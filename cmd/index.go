/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"regexp"
	"sort"
	"strings"

	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/orochaa/go-clack/prompts"
	"github.com/orochaa/go-clack/prompts/symbols"
	"github.com/orochaa/go-clack/third_party/picocolors"
	"github.com/spf13/cobra"
)

// indexCmd represents the index command
var indexCmd = &cobra.Command{
	Use:   "index",
	Short: "Sort and group all exports from index files",
	Run: func(cmd *cobra.Command, args []string) {
		folders, err := prompts.MultiSelectPath(prompts.MultiSelectPathParams{
			Message:     "Select folders to walk:",
			Required:    true,
			OnlyShowDir: true,
			Filter:      true,
		})
		prompts.ExitOnError(err)

		var pathShorter func(path string) string
		if cwd, err := os.Getwd(); err == nil {
			pathShorter = createPathShorter(cwd)
		} else {
			pathShorter = createPathShorter("")
		}

		taskWg, taskCh := utils.SpinIOTasks()

		for _, folder := range folders {
			utils.MapDir(folder, func(entry utils.Entry) {
				if entry.IsDir() {
					return
				}

				fileName := entry.Name()
				if fileName != "index.ts" {
					return
				}

				taskWg.Add(1)
				taskCh <- func() {
					defer taskWg.Done()

					data, err := os.ReadFile(entry.Path)
					if err != nil {
						fmt.Printf("Error reading file: %v.\n", err)
						return
					}

					originalText := string(data)
					text := originalText
					lines := strings.Split(text, "\n")
					groupedLines := make(map[string][]string)
					exportRegex := regexp.MustCompile("^export\\s+\\w*\\s*\\*\\s+from[\\s'\".\\/]+")

					for _, line := range lines {
						if line == "" {
							continue
						}

						if !exportRegex.MatchString(line) {
							prompts.Error(fmt.Sprintf("%s could not be parsed.", picocolors.Dim(pathShorter(entry.Path))))
							return
						}

						parsedLine := exportRegex.ReplaceAllString(line, "")
						components := strings.Split(parsedLine, "/")

						if len(components) > 1 {
							groupedLines[components[0]] = append(groupedLines[components[0]], line)
						} else {
							groupedLines[""] = append(groupedLines[""], line)
						}
					}

					groupKeys := make([]string, 0, len(groupedLines))
					for key := range groupedLines {
						groupKeys = append(groupKeys, key)
						sort.Strings(groupedLines[key])
					}
					sort.Strings(groupKeys)

					var result strings.Builder
					for i, key := range groupKeys {
						for _, line := range groupedLines[key] {
							result.WriteString(line)
							result.WriteString("\n")
						}
						if i < len(groupKeys)-1 {
							result.WriteString("\n")
						}
					}

					newText := result.String()
					if newText == originalText {
						fmt.Printf("%s %s %s\n",
							picocolors.Blue(symbols.INFO),
							picocolors.Dim(pathShorter(entry.Path)),
							picocolors.Dim("(not changed)."),
						)
						return
					}

					err = os.WriteFile(entry.Path, []byte(newText), 0644)
					if err != nil {
						fmt.Printf("Error writing to file: %v\n", err)
						return
					}

					fmt.Printf("%s %s.\n",
						picocolors.Green(symbols.SUCCESS),
						pathShorter(entry.Path),
					)
				}
			})
		}

		taskWg.Wait()
		close(taskCh)
	},
}

func init() {
	rootCmd.AddCommand(indexCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// indexCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// indexCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
