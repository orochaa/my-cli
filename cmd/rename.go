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
	Short:   "Rename files and directories recursively from A to B",
	Long:    "Rename files and directories recursively from A to B",
	Run: func(cmd *cobra.Command, args []string) {
		renameDirs, err := cmd.Flags().GetBool("directory")
		prompts.ExitOnError(err)

		folders, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select folders to walk:",
			Required:    true,
			OnlyShowDir: true,
			Filter:      true,
		})
		prompts.ExitOnError(err)

		pattern, err := prompts.Text(prompts.TextParams{
			Message:  "Insert a text pattern to find:",
			Required: true,
		})
		prompts.ExitOnError(err)

		replace, err := prompts.Text(prompts.TextParams{
			Message: "Insert a text to replace to:",
		})
		prompts.ExitOnError(err)

		var highlightRenamedPath func(path, match string, color func(str string) string, dim bool) string
		if cwd, err := os.Getwd(); err == nil {
			highlightRenamedPath = createPathHighlight(cwd)
		} else {
			highlightRenamedPath = createPathHighlight("")
		}

		var renameOptions []*prompts.MultiSelectOption[string]

		for _, folder := range folders {
			utils.MapDir(folder, func(entry utils.Entry) {
				if !renameDirs && entry.IsDir() {
					return
				}

				name := entry.Name()
				if !strings.Contains(name, pattern) {
					return
				}

				renameOptions = append(renameOptions, &prompts.MultiSelectOption[string]{
					Label:      highlightRenamedPath(entry.Path, pattern, picocolors.Red, false),
					Value:      entry.Path,
					IsSelected: true,
				})
			})
		}

		if len(renameOptions) == 0 {
			prompts.Error("No option found")
			return
		}

		filePathList, err := prompts.MultiSelect(prompts.MultiSelectParams[string]{
			Message:  "Confirm the following files/directories to be renamed:",
			Options:  renameOptions,
			Filter:   true,
			Required: true,
		})
		prompts.ExitOnError(err)

		prompts.Step("Renamed files/directories:")

		for _, filePath := range filePathList {
			folderPath := filepath.Dir(filePath)
			fileName := filepath.Base(filePath)
			newFileName := strings.Replace(fileName, pattern, replace, -1)
			newFilePath := filepath.Join(folderPath, newFileName)

			if err := os.Rename(filePath, newFilePath); err != nil {
				fmt.Printf("%s %s %s\n%s %s\n",
					picocolors.Red(symbols.BAR),
					picocolors.Red("Failed to rename:"),
					highlightRenamedPath(filePath, pattern, picocolors.Red, true),
					picocolors.Red(symbols.BAR),
					err.Error(),
				)
				continue
			}

			fmt.Printf("%s %s %s %s\n",
				picocolors.Gray(symbols.BAR),
				highlightRenamedPath(filePath, pattern, picocolors.Red, true),
				picocolors.Dim("=>"),
				highlightRenamedPath(newFilePath, replace, picocolors.Cyan, true),
			)
		}

		fmt.Println(picocolors.Gray(symbols.BAR_END))
	},
}

func createPathShorter(basePath string) func(path string) string {
	return func(path string) string {
		return strings.Replace(path, basePath+"/", "", 1)
	}
}

func createPathHighlight(basePath string) func(path, match string, color func(str string) string, dim bool) string {
	pathShorter := createPathShorter(basePath)

	return func(path, match string, color func(str string) string, dim bool) string {
		filename := filepath.Base(path)
		folderPath := pathShorter(filepath.Dir(path) + "/")

		if !dim {
			return fmt.Sprint(
				folderPath,
				strings.Replace(filename, match, color(match), -1),
			)
		}

		return fmt.Sprint(
			picocolors.Dim(folderPath),
			strings.Replace(filename, match, color(match), -1),
		)
	}
}

func init() {
	rootCmd.AddCommand(renameCmd)
	renameCmd.Flags().BoolP("directory", "d", false, "Include directories in the rename operation")

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// renameCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// renameCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
