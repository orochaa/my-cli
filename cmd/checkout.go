/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/Mist3rBru/my-cli/third_party/ni"
	"github.com/spf13/cobra"
)

// checkoutCmd represents the checkout command
var checkoutCmd = &cobra.Command{
	Use:     "checkout",
	Aliases: []string{"ck"},
	Short:   "Checkout to branch",
	Long:    "List all local and remote branches, to select and checkout to it",
	Run: func(cmd *cobra.Command, args []string) {
		branchesData, err := utils.ExecSilent("git branch -a")
		if err != nil {
			prompts.Error(err.Error())
			return
		}
		branches := strings.Split(branchesData, "\n")

		var selectedBranch string
		if len(args) > 0 {
			for _, branch := range branches {
				if strings.HasSuffix(branch, args[0]) {
					selectedBranch = branch
					break
				}
			}
			if selectedBranch == "" {
				origins, err := listOrigins()
				if err != nil {
					prompts.Error(err.Error())
					return
				}
				selectedBranch = fmt.Sprintf("remotes/%s/%s", origins[0], args[0])
			}
		} else {
			selectedBranch = checkoutPrompt(branches)
		}

		if isRemoteBranch(selectedBranch) {
			remoteBranch := formatRemoteBranch(selectedBranch)
			remoteOrigin := formatRemoteOrigin(selectedBranch)
			utils.ExecOrExit("git checkout -b", remoteBranch)
			utils.ExecOrExit("git pull", remoteOrigin, remoteBranch)
		} else {
			origins, err := listOrigins()
			if err != nil {
				prompts.Error(err.Error())
				return
			}

			var origin string
			for _, _origin := range origins {
				if strings.HasPrefix(_origin, "o") {
					origin = _origin
					break
				}
			}

			if origin == "" {
				origin = origins[0]
			}

			checkout := formatBranch(selectedBranch)
			utils.ExecOrExit("git checkout", checkout)
			utils.ExecOrExit("git pull", origin, checkout)
		}

		cwd, err := os.Getwd()
		if err != nil {
			prompts.Error(err.Error())
			return
		}

		if utils.Exists(filepath.Join(cwd, "package.json")) {
			pkgManager, err := ni.Detect(ni.DetectOptions{})
			if err != nil {
				pkgManager = selectPackageManagerPrompt()
			}
			utils.ExecOrExit(string(pkgManager), "install")
		} else if utils.Exists(filepath.Join(cwd, "go.mod")) {
			utils.ExecOrExit("go mod download")
		}
	},
}

func isRemoteBranch(branch string) bool {
	return regexp.MustCompile(`^\s*remote`).MatchString(branch)
}

func formatBranch(branch string) string {
	return regexp.MustCompile(`.*?(\S+)$`).ReplaceAllString(branch, "$1")
}

func formatRemoteBranch(branch string) string {
	return regexp.MustCompile(`^\s*(?:\w+\/){2}(?:HEAD.+?\/)?(.+)`).ReplaceAllString(branch, "$1")
}

func formatRemoteOrigin(origin string) string {
	return regexp.MustCompile(`^\s*\w+\/(\w+).+`).ReplaceAllString(origin, "$1")
}

func listOrigins() ([]string, error) {
	originsData, err := utils.ExecSilent("git remote")
	if err != nil {
		return nil, err
	}

	origins := strings.Split(originsData, "\n")
	if len(origins) == 0 {
		return nil, errors.New("no git's origin found")
	}

	return origins, nil
}

func checkoutPrompt(branches []string) string {
	var initialValue string
	options := make([]*prompts.SelectOption[string], len(branches)-1)
	for i, checkout := range branches {
		if checkout == "" {
			continue
		}
		if strings.HasPrefix(checkout, "*") {
			initialValue = checkout
		}
		options[i] = &prompts.SelectOption[string]{
			Label: checkout,
			Value: checkout,
		}
	}
	branch, err := prompts.Select[string](prompts.SelectParams[string]{
		Message:      "Select a branch",
		Options:      options,
		InitialValue: initialValue,
		Required:     true,
	})
	utils.VerifyPromptCancel(err)
	return branch
}

func init() {
	rootCmd.AddCommand(checkoutCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// checkoutCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// checkoutCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
