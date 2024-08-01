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
	"github.com/Mist3rBru/my-cli/internals/public"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// snippetCmd represents the snippet command
var snippetCmd = &cobra.Command{
	Use:   "snippet",
	Short: "Create snippet collections on local project",
	Long:  "Create snippet collections on local project",
	Run: func(cmd *cobra.Command, args []string) {
		var err error

		if isCustom, _ := cmd.Flags().GetBool("custom"); isCustom {
			cwd, err := os.Getwd()
			if err != nil {
				prompts.Error(err.Error())
				return
			}

			public.CreateVsCodeFolder()
			snippetName := filepath.Base(cwd)
			snippetPath := filepath.Join(public.VsCodeFolderPath(), snippetName+public.SnippetExtension)
			file, err := os.Create(snippetPath)
			if err != nil {
				prompts.Error(err.Error())
				return
			}
			defer file.Close()

			file.WriteString(fmt.Sprintf(`{
	"%s": {
		"scope": "typescript",
		"prefix": ["%s"],
		"body": [
			"",
		],
	}
}`, snippetName, snippetName))
			prompts.Step(fmt.Sprint("created: ", snippetPath))
			return
		}

		files := public.ReadSnippets()
		options := []*prompts.MultiSelectOption[string]{}
		for _, file := range files {
			snippet := strings.ReplaceAll(file.Name(), public.SnippetExtension, "")
			options = append(options, &prompts.MultiSelectOption[string]{
				Label: snippet,
				Value: snippet,
			})
		}

		snippets := []string{}
		if len(args) > 0 {
			for _, arg := range args {
				for _, option := range options {
					if arg == option.Value {
						snippets = append(snippets, option.Value)
						break
					}
				}
			}
		} else {
			snippets, err = prompts.MultiSelect(prompts.MultiSelectParams[string]{
				Message:  "Select one or more snippets to use:",
				Options:  options,
				Filter:   true,
				Required: true,
			})
			utils.VerifyPromptCancel(err)
		}

		if len(snippets) > 0 {
			public.CreateVsCodeFolder()
			for _, snippet := range snippets {
				err = public.CopySnippet(snippet)
				if err != nil {
					prompts.Error(err.Error())
				} else {
					prompts.Step(fmt.Sprint("created: ", filepath.Join(public.VsCodeFolderPath(), snippet+public.SnippetExtension)))
				}
			}
		} else {
			prompts.Cancel("snippet not found")
		}
	},
}

func init() {
	rootCmd.AddCommand(snippetCmd)

	snippetCmd.Flags().BoolP("custom", "c", false, "create a custom snippet file")

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// snippetCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// snippetCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
