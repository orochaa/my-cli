/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"runtime"
	"strings"
	"sync"
	"time"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/go-clack/third_party/picocolors"
	"github.com/Mist3rBru/go-clack/third_party/sisteransi"
	"github.com/Mist3rBru/my-cli/internals/lockfile"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// copyCmd represents the copy command
var copyCmd = &cobra.Command{
	Use:   "copy",
	Short: "Copy files from other project",
	Long:  "Copy files from other project",
	Run: func(cmd *cobra.Command, args []string) {
		cwd, err := os.Getwd()
		if err != nil {
			prompts.Cancel(err.Error())
			return
		}

		l := lockfile.Open()
		defer l.Close()

		userProjectsRootList := l.GetUserProjectsRootList()

		selectedPaths, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select mudules to copy:",
			InitialPath: userProjectsRootList[0],
			Filter:      true,
			Required:    true,
		})
		utils.VerifyPromptCancel(err)

		progressCh := make(chan CopyProgress)
		taskCh := make(chan func())
		startTime := time.Now()

		for range runtime.NumCPU() * 10 {
			go func() {
				for task := range taskCh {
					task()
				}
			}()
		}

		var taskWg sync.WaitGroup
		taskWg.Add(1)
		taskCh <- func() {
			defer taskWg.Done()

			for _, selectedPath := range selectedPaths {
				var relativePath string
				for _, root := range userProjectsRootList {
					relativeRegex := regexp.MustCompile(fmt.Sprintf(`^%s/.+?/(.+)`, root))
					if relativeRegex.MatchString(selectedPath) {
						relativePath = relativeRegex.ReplaceAllString(selectedPath, "$1")
						break
					}
				}

				absoluteToPath := filepath.Join(cwd, relativePath)

				stat, err := os.Stat(selectedPath)
				if err != nil {
					prompts.Error(err.Error())
					return
				}

				if stat.IsDir() {
					CopyDir(selectedPath, absoluteToPath, &taskWg, taskCh, progressCh)
				} else {
					folderPath := filepath.Join(cwd, filepath.Dir(relativePath))
					if err := os.MkdirAll(folderPath, stat.Mode()); err != nil {
						prompts.Error(err.Error())
						return
					}

					if err := CopyFile(selectedPath, absoluteToPath); err != nil {
						prompts.Error(err.Error())
						return
					}
				}
			}
		}

		go func() {
			taskWg.Wait()
			close(taskCh)
			close(progressCh)
		}()

		var total, copied int
		for p := range progressCh {
			total += p.Found
			copied += p.Copied
			progress := picocolors.Inverse(strings.Repeat(" ", copied*40/total))
			remaining := strings.Repeat(" ", 40-(copied*40/total))
			os.Stdout.WriteString(sisteransi.MoveCursor(0, -999))
			os.Stdout.WriteString(sisteransi.EraseCurrentLine())
			os.Stdout.WriteString(fmt.Sprintf("|%s%s| %d/%d", progress, remaining, copied, total))
		}

		prompts.Success(fmt.Sprintf("%d files copied in %s", copied, time.Since(startTime).String()))
	},
}

type CopyProgress struct {
	Found  int
	Copied int
}

func CopyDir(fromDirPath string, toDirPath string, taskWg *sync.WaitGroup, taskCh chan func(), progressCh chan CopyProgress) {
	if err := os.MkdirAll(toDirPath, fs.ModeDir); err != nil {
		prompts.Error(err.Error())
		return
	}

	entries, err := os.ReadDir(fromDirPath)
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	for _, entry := range entries {
		if entry.Name() == ".git" || entry.Name() == "node_modules" {
			continue
		}

		fromPath := filepath.Join(fromDirPath, entry.Name())
		toPath := filepath.Join(toDirPath, entry.Name())

		if entry.IsDir() {
			CopyDir(fromPath, toPath, taskWg, taskCh, progressCh)
		} else {
			progressCh <- CopyProgress{Found: 1}
			taskWg.Add(1)
			taskCh <- func() {
				defer taskWg.Done()
				if err = CopyFile(fromPath, toPath); err != nil {
					prompts.Error(err.Error())
				} else {
					progressCh <- CopyProgress{Copied: 1}
				}
			}
		}
	}
}

func CopyFile(fromFilePath, toFilePath string) error {
	fromFile, err := os.Open(fromFilePath)
	if err != nil {
		return err
	}
	defer fromFile.Close()

	toFile, err := os.Create(toFilePath)
	if err != nil {
		return err
	}
	defer toFile.Close()

	_, err = io.Copy(toFile, fromFile)
	if err != nil {
		return err
	}

	return toFile.Sync()
}

func init() {
	rootCmd.AddCommand(copyCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// copyCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// copyCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
