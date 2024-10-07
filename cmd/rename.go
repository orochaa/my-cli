/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/go-clack/prompts/symbols"
	"github.com/Mist3rBru/go-clack/third_party/picocolors"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// renameCmd represents the rename command
var renameCmd = &cobra.Command{
	Use:     "rename",
	Aliases: []string{"rn"},
	Short:   "Rename files recursively from A to B",
	Long:    "Rename files recursively from A to B",
	Run: func(cmd *cobra.Command, args []string) {
		folders, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select folders to walk:",
			Required:    true,
			OnlyShowDir: true,
			Filter:      true,
		})
		prompts.ExitOnError(err)

		pattern, err := prompts.Text(prompts.TextParams{
			Message: "Insert a text pattern to find:",
		})
		prompts.ExitOnError(err)

		replace, err := prompts.Text(prompts.TextParams{
			Message: "Insert a text to replace to:",
		})
		prompts.ExitOnError(err)

		fmt.Println(picocolors.Gray(symbols.BAR))

		highlightPath := func(path, match string, color func(str string) string) string {
			folderPath := filepath.Dir(path)
			filename := filepath.Base(path)

			return fmt.Sprint(
				picocolors.Dim(folderPath+"/"),
				strings.Replace(filename, match, color(match), -1),
			)
		}

		taskWg, taskCh := utils.SpinTasks()

		taskWg.Add(1)
		taskCh <- func() {
			defer taskWg.Done()

			for _, folder := range folders {
				utils.MapDir(folder, func(filePath string) {
					taskWg.Add(1)
					taskCh <- func() {
						defer taskWg.Done()

						fileName := filepath.Base(filePath)
						if strings.Contains(fileName, pattern) {
							folderPath := filepath.Dir(filePath)
							newFileName := strings.Replace(fileName, pattern, replace, -1)
							newFilePath := filepath.Join(folderPath, newFileName)

							if err := os.Rename(filePath, newFilePath); err != nil {
								prompts.Error(err.Error())
								return
							}

							fmt.Printf("%s %s %s %s\n",
								picocolors.Gray(symbols.BAR),
								highlightPath(filePath, pattern, picocolors.Red),
								picocolors.Dim("=>"),
								highlightPath(newFilePath, replace, picocolors.Cyan),
							)
						}
					}
				})
			}
		}

		taskWg.Wait()
		close(taskCh)

		fmt.Println(picocolors.Gray(symbols.BAR_END))
	},
}

func init() {
	rootCmd.AddCommand(renameCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// renameCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// renameCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
