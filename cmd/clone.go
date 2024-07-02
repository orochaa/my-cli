/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/lockfile"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/Mist3rBru/my-cli/third_party/assert"
	"github.com/Mist3rBru/my-cli/third_party/ni"
	"github.com/spf13/cobra"
)

// cloneCmd represents the clone command
var cloneCmd = &cobra.Command{
	Use:   "clone",
	Short: "Clone a Github's repository",
	Long:  "Clone a Github's repository based on `setup`, sets git `origin` to `o`, install dependencies, and open it on vscode",
	Run: func(cmd *cobra.Command, args []string) {
		repo := getRepository(cmd, args)
		projectPath := formatProjectPath(cmd, repo)

		if utils.Exists(projectPath) {
			prompts.Step(fmt.Sprintf("cd %s", projectPath))
			os.Chdir(projectPath)
		} else {
			utils.ExecOrExit("git clone", repo.Clone_url, projectPath)
			prompts.Step(fmt.Sprintf("cd %s", projectPath))
			os.Chdir(projectPath)
			utils.ExecOrExit("git remote rename origin o")
		}

		if utils.Exists(filepath.Join(projectPath, "package.json")) {
			pkgManager, err := ni.Detect(ni.DetectOptions{})
			if err != nil {
				pkgManager = selectPackageManagerPrompt()
			}
			utils.ExecOrExit(string(pkgManager), "install")
		} else if utils.Exists(filepath.Join(projectPath, "go.mod")) {
			utils.ExecOrExit("go mod download")
		}

		utils.ExecOrExit("code", projectPath)
	},
}

type Repository struct {
	Name       string `json:"name"`
	Clone_url  string `json:"clone_url"`
	Updated_at string `json:"updated_at"`
}

func getRepository(cmd *cobra.Command, args []string) *Repository {
	githubRegex := regexp.MustCompile(`github.com\.com.+\.git$`)

	if len(args) > 0 && githubRegex.MatchString(args[0]) {
		repotitoryUrl := args[0]
		repositoryNameRegex := regexp.MustCompile(`.+\/(.+)\.git$`)
		repositoryName := repositoryNameRegex.ReplaceAllString(repotitoryUrl, "$1")

		return &Repository{
			Name:       repositoryName,
			Clone_url:  repotitoryUrl,
			Updated_at: "",
		}
	}

	repos := getUserRepositories()
	filter := cmd.Flag("filter").Value.String()

	if len(args) > 0 {
		for _, repo := range repos {
			if args[0] == repo.Name {
				return repo
			}
		}
		prompts.Warn("repository not found")
	} else if filter != "" {
		filterRegex := regexp.MustCompile("(?i)" + filter)
		var filteredRepos []*Repository
		for _, repo := range repos {
			if filterRegex.MatchString(repo.Name) {
				filteredRepos = append(filteredRepos, repo)
			}
		}
		assert.Assert(len(filteredRepos) > 0, "no filtered repository found")

		if len(filteredRepos) == 1 {
			return filteredRepos[0]
		}

		return selectRepositoryPrompt(filteredRepos)
	}

	return selectRepositoryPrompt(repos)
}

func getUserRepositories() []*Repository {
	var wg sync.WaitGroup
	var repos []*Repository
	reposCh := make(chan *Repository, 10)

	s := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
	s.Start("Fetching repositories")
	defer s.Stop("", 0)

	wg.Add(2)
	go getGhCliRepositories(&wg, reposCh)
	go getGhRepositories(&wg, reposCh)

	go func() {
		wg.Wait()
		close(reposCh)
	}()

	for repo := range reposCh {
		repos = append(repos, repo)
	}

	contains := func(list []*Repository, repo *Repository) bool {
		for _, item := range list {
			if item.Name == repo.Name {
				return true
			}
		}
		return false
	}

	removeDuplicates := func(repos []*Repository) []*Repository {
		list := []*Repository{}
		for _, repo := range repos {
			if !contains(list, repo) {
				list = append(list, repo)
			}
		}
		return list
	}

	return removeDuplicates(repos)
}

func getGhCliRepositories(wg *sync.WaitGroup, reposCh chan *Repository) {
	defer wg.Done()

	authStatus, err := utils.ExecSilent("gh auth status")
	if err != nil || !strings.Contains(authStatus, "Logged in") {
		return
	}

	output, err := utils.ExecSilent("gh repo list -L 50")
	if err != nil {
		return
	}

	for _, line := range strings.Split(output, "\n") {
		if line == "" {
			continue
		}
		userName := regexp.MustCompile(`^(.+?)\/.+`).ReplaceAllString(line, "$1")
		repositoryName := regexp.MustCompile(`^.+?\/(.+?)\s.+`).ReplaceAllString(line, "$1")
		updatedAt := regexp.MustCompile(`.+[\s\t](.+)$`).ReplaceAllString(line, "$1")
		// fmt.Println(userName, repositoryName, updatedAt)

		reposCh <- &Repository{
			Name:       repositoryName,
			Clone_url:  fmt.Sprintf("https://github.com/%s/%s.git", userName, repositoryName),
			Updated_at: updatedAt,
		}
	}
}

func getGhRepositories(wg *sync.WaitGroup, reposCh chan *Repository) {
	defer wg.Done()

	l := lockfile.Open()
	defer l.Close()

	userName := l.GetUserGithubName()
	if userName == "" {
		return
	}

	resp, err := http.Get(fmt.Sprintf("https://api.github.com/users/%s/repos", userName))
	if err != nil {
		return
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return
	}

	var repos []Repository
	err = json.Unmarshal(body, &repos)
	if err != nil {
		return
	}

	for _, repo := range repos {
		reposCh <- &repo
	}
}

func selectRepositoryPrompt(repos []*Repository) *Repository {
	sort.Slice(repos, func(i, j int) bool {
		a, err := time.Parse("2006-01-02T15:04:05Z0700", repos[i].Updated_at)
		assert.NoError(err, "invalid repository updated_at field")
		b, err := time.Parse("2006-01-02T15:04:05Z0700", repos[j].Updated_at)
		assert.NoError(err, "invalid repository updated_at field")
		return a.After(b)
	})

	var options []prompts.SelectOption[*Repository]
	for _, repo := range repos {
		options = append(options, prompts.SelectOption[*Repository]{
			Label: repo.Name,
			Value: repo,
		})
	}
	repo, err := prompts.Select[*Repository](prompts.SelectParams[*Repository]{
		Message: "Select one of your repositories:",
		Options: options,
	})
	utils.VerifyPromptCancel(err)

	return repo
}

func formatProjectPath(cmd *cobra.Command, repo *Repository) string {
	l := lockfile.Open()
	defer l.Close()

	if isRoot, _ := cmd.Flags().GetBool("root"); isRoot {
		projectsRootList := l.GetUserProjectsRootList()
		return filepath.Join(projectsRootList[0], repo.Name)
	}
	cwd, _ := os.Getwd()
	return filepath.Join(cwd, repo.Name)
}

func selectPackageManagerPrompt() ni.Agent {
	agent, err := prompts.Select[ni.Agent](prompts.SelectParams[ni.Agent]{
		Message: "Select your package manager:",
		Options: []prompts.SelectOption[ni.Agent]{
			{Label: "pnpm", Value: "pnpm"},
			{Label: "yarn", Value: "yarn"},
			{Label: "npm", Value: "npm"},
		},
	})
	utils.VerifyPromptCancel(err)
	return agent
}

func init() {
	rootCmd.AddCommand(cloneCmd)

	cloneCmd.Flags().StringP("filter", "f", "", "Filters the repository options with the given value")

	cloneCmd.Flags().BoolP("root", "r", false, "Change the target folder from cwd to the first project root stored on lockfile")

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// cloneCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// cloneCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
