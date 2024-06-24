package lockfile

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/Mist3rBru/my-cli/third_party/assert"
)

const (
	Name string = "lockfile.json"
)

type Lockfile struct {
	UserGithubName       string   `json:"userGithubName"`
	UserProjectsRootList []string `json:"userProjectsRootList"`
}

func DirPath() string {
	homeDir, err := os.UserHomeDir()
	assert.NoError(err, "no user homedir found")
	return filepath.Join(homeDir, "my-cli")
}

func Path() string {
	return filepath.Join(DirPath(), Name)
}

func Verify() bool {
	return utils.Exists(Path())
}

func Read() Lockfile {
	var lockfile Lockfile
	err := utils.ReadJson(Path(), &lockfile)
	assert.NoError(err, "failed to read lockfile")
	return lockfile
}

func Write(lockfile Lockfile) {
	dirPath := DirPath()
	if _, err := os.Stat(dirPath); os.IsNotExist(err) {
		os.MkdirAll(dirPath, fs.ModeDir)
	}
	err := utils.WriteJson(Path(), &lockfile)
	assert.NoError(err, "lockfile failed to marshal")
}

func GetUserGithubName() string {
	var lockfile Lockfile
	if Verify() {
		lockfile = Read()
	}
	if lockfile.UserGithubName != "" {
		return lockfile.UserGithubName
	}
	lockfile.UserGithubName = RunGithubUserNamePrompt("")
	Write(lockfile)
	return lockfile.UserGithubName
}

func GetUserProjectsRootList() []string {
	var lockfile Lockfile
	if Verify() {
		lockfile = Read()
	}
	if len(lockfile.UserProjectsRootList) > 0 {
		return lockfile.UserProjectsRootList
	}
	lockfile.UserProjectsRootList = RunProjectsRootPrompt([]string{})
	Write(lockfile)
	return lockfile.UserProjectsRootList
}

type GitHubUser struct {
	Login string `json:"login"`
	Name  string `json:"name"`
}

func RunGithubUserNamePrompt(lastName string) string {
	s, err := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
	assert.NoError(err, "failed to start spinner")

	for {
		name, err := prompts.Text(prompts.TextParams{
			Message:      "What is your GitHub username?",
			InitialValue: lastName,
		})
		utils.VerifyPromptCancel(err)
		lastName = name

		s.Start("Validating user")
		resp, err := http.Get(fmt.Sprintf("https://api.github.com/users/%s", name))
		if err != nil {
			s.Stop("", 1)
			continue
		}

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			s.Stop("", 1)
			continue
		}

		var user GitHubUser
		err = json.Unmarshal(body, &user)
		if err != nil {
			s.Stop("", 1)
			continue
		}

		s.Stop(fmt.Sprintf("User: %s | %s", user.Login, user.Name), 0)
		isUser, err := prompts.Confirm(prompts.ConfirmParams{
			Message:      "Is that your user?",
			InitialValue: true,
		})
		utils.VerifyPromptCancel(err)
		if isUser {
			return user.Name
		}
	}
}

func RunProjectsRootPrompt(lastRootList []string) []string {
	res, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
		Message:     "What is your root projects path?",
		OnlyShowDir: true,
	})
	utils.VerifyPromptCancel(err)
	return res
}
