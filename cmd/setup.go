/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/lockfile"
	"github.com/spf13/cobra"
)

// setupCmd represents the setup command
var setupCmd = &cobra.Command{
	Use:   "setup",
	Short: "Prepare the required setup",
	Long:  "Prepare the required setup",
	Run: func(cmd *cobra.Command, args []string) {
		var data lockfile.Lockfile
		if lockfile.Verify() {
			data = lockfile.Read()
		}

		data.UserGithubName = lockfile.RunGithubUserNamePrompt(data.UserGithubName)
		data.UserProjectsRootList = lockfile.RunProjectsRootPrompt(data.UserProjectsRootList)
		lockfile.Write(data)

		prompts.Success("Setup finished!")
	},
}

func init() {
	rootCmd.AddCommand(setupCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// setupCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// setupCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
