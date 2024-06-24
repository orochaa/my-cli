/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"os"
	"path/filepath"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/public"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// initCmd represents the init command
var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize a default project",
	Long:  "Initialize a default node or go project",
	Run: func(cmd *cobra.Command, args []string) {
		var err error

		var project string
		if len(args) > 0 {
			project = args[0]
		} else {
			project, err = prompts.Select(prompts.SelectParams[string]{
				Message: "Select a project:",
				Options: []prompts.SelectOption[string]{
					{Label: "Node", Value: "node"},
					{Label: "Go", Value: "go"},
				},
			})
			utils.VerifyPromptCancel(err)
		}

		cwd, err := os.Getwd()
		if err != nil {
			prompts.Error(err.Error())
			return
		}
		name := filepath.Base(cwd)

		switch project {
		case "go":
			utils.ExecOrExit("go mod init", name)
			os.WriteFile("main.go", []byte{}, os.ModePerm)
		case "node":
			public.CopyConfig(".editorconfig")
			public.CopyConfig(".eslintrc.json")
			public.CopyConfig(".prettierrc")
			public.CopyConfig(".prettierignore")
			public.CopyConfig(".gitignore")
			public.CopyConfig(".gitattributes")
			public.CopyConfig("tsconfig.json")
			prompts.Step("created config files")

			utils.Exec("git init")
			utils.Exec("pnpm init")

			cwd, err := os.Getwd()
			if err != nil {
				prompts.Error(err.Error())
				return
			}

			packageJSONPath := filepath.Join(cwd, "package.json")
			var packageJson map[string]any
			if err := utils.ReadJson(packageJSONPath, &packageJson); err != nil {
				prompts.Error(err.Error())
				return
			}

			var packageJsonScripts map[string]any
			if packageJson["scripts"] == nil {
				packageJsonScripts = make(map[string]any)
			} else {
				packageJsonScripts = packageJson["scripts"].(map[string]any)
			}

			scripts := map[string]string{
				"dev":           "tsx src/index.ts",
				"build":         "tsc",
				"lint":          "run-s lint:tsc lint:prettier lint:eslint",
				"lint:tsc":      "tsc --noEmit",
				"lint:prettier": "prettier --write .",
				"lint:eslint":   "eslint --fix \"src/**/*.ts\" \"__tests__/**/*.ts\"",
			}
			for name, command := range scripts {
				packageJsonScripts[name] = command
			}

			packageJson["scripts"] = packageJsonScripts
			if err := utils.WriteJson(packageJSONPath, &packageJson); err != nil {
				prompts.Error(err.Error())
				return
			}

			prompts.Step("scripts added to package.json")
			utils.Exec("pnpm add -D typescript @types/node tsx prettier eslint eslint-plugin-mist3rbru npm-run-all2")

			os.Mkdir(filepath.Join(cwd, "src"), os.ModePerm)
			_, err = os.Create(filepath.Join(cwd, "src", "index.ts"))
			if err == nil {
				prompts.Step("created src/index.ts")
			}
		default:
			prompts.Error("Project type not supported")
		}
	},
}

func init() {
	rootCmd.AddCommand(initCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// initCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// initCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
