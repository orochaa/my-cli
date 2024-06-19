/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sync"
	"time"

	"github.com/Mist3rBru/go-clack/prompts"
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

		userProjectsRootList := lockfile.GetUserProjectsRootList()

		selectedPaths, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select mudules to copy:",
			InitialPath: userProjectsRootList[0],
		})
		utils.VerifyPromptCancel(err)

		wg := sync.WaitGroup{}
		startTime := time.Now()

		for _, selectedPath := range selectedPaths {
			wg.Add(1)

			go func(selectedPath string) {
				defer wg.Done()

				var relativePath string
				for _, root := range userProjectsRootList {
					relativeRegex := regexp.MustCompile(fmt.Sprintf(`^%s/.+?/(.+)`, root))
					if relativeRegex.MatchString(root) {
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
					wg.Add(1)
					go utils.CopyDir(selectedPath, absoluteToPath, &wg)
				} else {
					wg.Add(1)
					go func() {
						defer wg.Done()

						if err := os.MkdirAll(filepath.Join(cwd, filepath.Dir(relativePath)), stat.Mode()); err != nil {
							prompts.Error(err.Error())
							return
						}

						err = utils.CopyFile(selectedPath, absoluteToPath)
						if err != nil {
							prompts.Error(err.Error())
							return
						}
					}()
				}
			}(selectedPath)
		}

		wg.Wait()
		prompts.Success("Files copied in " + time.Since(startTime).String())
	},
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
