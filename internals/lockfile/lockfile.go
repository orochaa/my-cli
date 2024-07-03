package lockfile

import (
	"context"
	"encoding/json"
	"errors"
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

type Lockfile struct {
	Updated              bool
	DirPath              string
	FilePath             string
	UserGithubName       string   `json:"userGithubName"`
	UserProjectsRootList []string `json:"userProjectsRootList"`
}

func NewLockfile() *Lockfile {
	homeDir, err := os.UserHomeDir()
	assert.NoError(err, "no user homedir found")
	dirPath := filepath.Join(homeDir, "my-cli")

	return &Lockfile{
		DirPath:  dirPath,
		FilePath: filepath.Join(dirPath, "lockfile.json"),
	}
}

func Open() *Lockfile {
	l := NewLockfile()

	if utils.Exists(l.FilePath) {
		utils.ReadJson(l.FilePath, &l)
	}

	return l
}

func (l *Lockfile) Close() {
	if !l.Updated {
		return
	}
	if _, err := os.Stat(l.DirPath); os.IsNotExist(err) {
		err := os.MkdirAll(l.DirPath, fs.ModeDir)
		assert.NoError(err, "my-cli folder failed to be created")
	}
	err := utils.WriteJson(l.FilePath, l)
	assert.NoError(err, "lockfile failed to be written")
}

func (l *Lockfile) GetUserGithubName() string {
	if l.UserGithubName != "" {
		return l.UserGithubName
	}
	l.UserGithubName = l.RunGithubUserNamePrompt()
	l.Updated = true
	return l.UserGithubName
}

type GitHubUser struct {
	Login string `json:"login"`
	Name  string `json:"name"`
}

func (l *Lockfile) RunGithubUserNamePrompt() string {
	s := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})

	lastName := l.UserGithubName

	for {
		name, err := prompts.Text(prompts.TextParams{
			Required:     true,
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
			return user.Login
		}
	}
}

func (l *Lockfile) GetUserProjectsRootList() []string {
	if len(l.UserProjectsRootList) > 0 {
		return l.UserProjectsRootList
	}
	l.UserProjectsRootList = l.RunProjectsRootPrompt()
	l.Updated = true
	return l.UserProjectsRootList
}

func (l *Lockfile) RunProjectsRootPrompt() []string {
	var initialPath string
	if len(l.UserProjectsRootList) > 0 {
		initialPath = l.UserProjectsRootList[0]
	}
	res, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
		Message:      "What is your root projects path?",
		OnlyShowDir:  true,
		Required:     true,
		InitialValue: l.UserProjectsRootList,
		InitialPath:  initialPath,
		Validate: func(value []string) error {
			if len(value) == 0 {
				return errors.New("must select at least one folder")
			}
			return nil
		},
	})
	utils.VerifyPromptCancel(err)
	return res
}
