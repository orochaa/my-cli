/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"time"

	"github.com/Mist3rBru/my-cli/internals/lockfile"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/orochaa/go-clack/prompts"
	"github.com/orochaa/go-clack/prompts/symbols"
	"github.com/orochaa/go-clack/third_party/picocolors"
	"github.com/orochaa/go-clack/third_party/sisteransi"
	"github.com/spf13/cobra"
)

type CopyProgress struct {
	Found  int
	Copied int
}

// copyCmd represents the copy command
var copyCmd = &cobra.Command{
	Use:   "copy",
	Short: "Copy files from other project",
	Long:  "Copy files from other project",
	Run: func(cmd *cobra.Command, args []string) {
		l := lockfile.Open()
		defer l.Close()

		userProjectsRootList := l.GetUserProjectsRootList()
		selectedPaths, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select items to copy:",
			InitialPath: userProjectsRootList[0],
			Filter:      true,
			Required:    true,
		})
		prompts.ExitOnError(err)
		os.Stdout.WriteString("\n")

		slices.Reverse(userProjectsRootList)
		defer slices.Reverse(userProjectsRootList)

		progressCh := make(chan CopyProgress)
		startTime := time.Now()

		taskWg, taskCh := utils.SpinIOTasks()

		taskWg.Add(1)
		taskCh <- func() {
			defer taskWg.Done()
			for _, selectedPath := range selectedPaths {
				stat, err := os.Stat(selectedPath)
				if err != nil {
					continue
				}

				if !stat.IsDir() {
					progressCh <- CopyProgress{Found: 1}
					taskWg.Add(1)
					taskCh <- func() {
						defer taskWg.Done()
						if err := RelativeCopyFile(userProjectsRootList, selectedPath); err != nil {
							prompts.Error(err.Error())
						} else {
							progressCh <- CopyProgress{Copied: 1}
						}
					}
					continue
				}

				utils.MapDir(selectedPath, func(entry utils.Entry) {
					if entry.IsDir() {
						return
					}

					progressCh <- CopyProgress{Found: 1}
					taskWg.Add(1)
					taskCh <- func() {
						defer taskWg.Done()

						err := RelativeCopyFile(userProjectsRootList, entry.Path)
						if err != nil {
							prompts.Error(err.Error())
							return
						}

						progressCh <- CopyProgress{Copied: 1}
					}
				})
			}
		}

		go func() {
			taskWg.Wait()
			close(taskCh)
			close(progressCh)
		}()

		var total, copied int
		const barLength = 40

		for p := range progressCh {
			total += p.Found
			copied += p.Copied
			progress := copied * barLength / total
			progressBar := picocolors.BgWhite(strings.Repeat(" ", progress))
			remainingBar := strings.Repeat(" ", barLength-progress)
			os.Stdout.WriteString(sisteransi.MoveCursor(-1, -999))
			os.Stdout.WriteString(sisteransi.EraseCurrentLine())
			os.Stdout.WriteString(fmt.Sprintf("%s %s%s %d/%d\n", picocolors.Gray(symbols.BAR_END), progressBar, remainingBar, copied, total))
		}

		os.Stdout.WriteString(sisteransi.MoveCursorUp(1))
		os.Stdout.WriteString(sisteransi.EraseDown())
		os.Stdout.WriteString(fmt.Sprintf("%s %s\n", picocolors.Gray(symbols.BAR_END), picocolors.Dim(fmt.Sprintf("%d files copied in %s", copied, time.Since(startTime).String()))))
	},
}

func RelativeCopyFile(userProjectsRootList []string, filePath string) error {
	cwd, err := os.Getwd()
	if err != nil {
		return err
	}

	var relativePath string
	for _, root := range userProjectsRootList {
		relativeRegex := regexp.MustCompile(fmt.Sprintf(`^%s/.+?/(.+)`, root))
		if relativeRegex.MatchString(filePath) {
			relativePath = relativeRegex.ReplaceAllString(filePath, "$1")
			break
		}
	}

	if relativePath == "" {
		relativePath = filepath.Base(filePath)
	}

	fromDirPath := filepath.Dir(filePath)
	toFilePath := filepath.Join(cwd, relativePath)
	toDirPath := filepath.Dir(toFilePath)

	fromDirStat, err := os.Stat(fromDirPath)
	if err != nil {
		return err
	}

	if err := os.MkdirAll(toDirPath, fromDirStat.Mode()); err != nil {
		return err
	}

	if err = CopyFile(filePath, toFilePath); err != nil {
		return err
	}

	return nil
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
