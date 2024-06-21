/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// scriptCmd represents the script command
var scriptCmd = &cobra.Command{
	Use:   "script",
	Short: "Write common scripts on local package.json",
	Long:  "Write common scripts on local package.json",
	Run: func(cmd *cobra.Command, args []string) {
		cwd, err := os.Getwd()
		if err != nil {
			prompts.Cancel(err.Error())
			return
		}

		scripts, err := prompts.MultiSelect(prompts.MultiSelectParams[string]{
			Message: "Select one or more scripts to use:",
			Options: []prompts.MultiSelectOption[string]{
				{Label: "lint", Value: "lint"},
				{Label: "jest", Value: "jest"},
				{Label: "vitest", Value: "vitest"},
				{Label: "prisma", Value: "prisma"},
				{Label: "changeset", Value: "changeset"},
			},
			Validate: func(value []string) error {
				if len(value) == 0 {
					return fmt.Errorf("select at least a snippet")
				}
				return nil
			},
		})
		utils.VerifyPromptCancel(err)

		packageJsonPath := filepath.Join(cwd, "package.json")
		var packageJson map[string]any
		if err = utils.ReadJson(packageJsonPath, &packageJson); err != nil {
			prompts.Error(err.Error())
			return
		}

		var packageJsonScripts map[string]any
		if packageJson["scripts"] == nil {
			packageJsonScripts = make(map[string]any)
		} else {
			packageJsonScripts = packageJson["scripts"].(map[string]any)
		}

		for _, script := range scripts {
			switch script {
			case "lint":
				packageJsonScripts["lint"] = "run-s lint:tsc lint:prettier lint:eslint"
				packageJsonScripts["lint:tsc"] = "tsc --noEmit"
				packageJsonScripts["lint:prettier"] = "prettier --write ."
				packageJsonScripts["lint:eslint"] = "eslint --fix \"src/**/*.ts\" \"__tests__/**/*.ts\""
			case "jest":
				packageJsonScripts["test"] = "jest --no-cache"
				packageJsonScripts["test:ci"] = "jest --no-cache  --coverage --silent"
			case "vitest":
				packageJsonScripts["test"] = "vitest --run"
				packageJsonScripts["test:ci"] = "vitest --run --coverage --silent"
			case "prisma":
				packageJsonScripts["postinstall"] = "npm run prisma"
				packageJsonScripts["prisma"] = "prisma generate"
				packageJsonScripts["prisma:dev"] = "prisma migrate dev"
				packageJsonScripts["prisma:prod"] = "prisma migrate deploy"
				packageJsonScripts["prisma:reset"] = "prisma migrate reset"
			case "changeset":
				packageJsonScripts["ci"] = "run-s lint build test"
				packageJsonScripts["publish"] = "changeset publish"
				packageJsonScripts["release"] = "run-s ci publish"
			default:
				prompts.Warn(fmt.Sprint("script not found: ", script))
			}
		}

		packageJson["scripts"] = packageJsonScripts
		err = utils.WriteJson(packageJsonPath, &packageJson)
		if err != nil {
			prompts.Error(err.Error())
		} else {
			prompts.Success("scripts add to " + packageJsonPath)
		}
	},
}

func init() {
	rootCmd.AddCommand(scriptCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// scriptCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// scriptCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
