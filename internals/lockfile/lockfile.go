package lockfile

import (
	"errors"
	"fmt"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/Mist3rBru/my-cli/third_party/assert"
	"github.com/orochaa/go-clack/prompts"
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

func (l *Lockfile) RunGithubUserNamePrompt() string {
	var err error
	l.UserGithubName, err = prompts.Text(prompts.TextParams{
		Message:      "What is your GitHub username?",
		InitialValue: l.UserGithubName,
		Required:     true,
		Validate: func(value string) error {
			if value != "" {
				res, err := http.Get(fmt.Sprintf("https://api.github.com/users/%s", value))
				if err != nil {
					return err
				}
				if res.StatusCode >= 400 {
					return errors.New("user not found")
				}
			}
			return nil
		},
	})
	prompts.ExitOnError(err)

	return l.UserGithubName
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
		Filter:       true,
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
	prompts.ExitOnError(err)
	return res
}
