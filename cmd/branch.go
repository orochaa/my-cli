/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"regexp"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// branchCmd represents the branch command
var branchCmd = &cobra.Command{
	Use:     "branch",
	Aliases: []string{"b"},
	Short:   "Checkout to branch",
	Long:    "List all local and remote branches, to select and checkout to it",
	Run: func(cmd *cobra.Command, args []string) {
		branchesData, err := utils.ExecSilent("git", "branch", "-a")
		if err != nil {
			prompts.Error(err.Error())
			return
		}
		branches := strings.Split(branchesData, "\n")
		selectedBranch := branchPrompt(branches)

		if isRemoteBranch(selectedBranch) {
			remoteBranch := formatRemoteBranch(selectedBranch)
			remoteOrigin := formatRemoteOrigin(selectedBranch)
			utils.ExecOrExit("git", "checkout", "-b", remoteBranch)
			utils.ExecOrExit("git", "pull", remoteOrigin, remoteBranch)
		} else {
			originsData := utils.ExecOrExit("git", "remote")
			originList := strings.Split(originsData, "\n")
			origin := originList[0]
			for _, _origin := range originList {
				if strings.HasPrefix(_origin, "o") {
					origin = _origin
					break
				}
			}
			branch := formatBranch(selectedBranch)
			utils.ExecOrExit("git", "checkout", branch)
			utils.ExecOrExit("git", "pull", origin, branch)
		}
	},
}

func isRemoteBranch(branch string) bool {
	return regexp.MustCompile(`^\s*remote`).MatchString(branch)
}

func formatBranch(branch string) string {
	return regexp.MustCompile(`.*?(\S+)$`).ReplaceAllString(branch, "$1")
}

func formatRemoteBranch(branch string) string {
	return regexp.MustCompile(`^\s*(?:\w+\/){2}(?:HEAD.+?\/)?(.+)`).ReplaceAllString(branch, "$1")
}

func formatRemoteOrigin(origin string) string {
	return regexp.MustCompile(`^\s*\w+\/(\w+).+`).ReplaceAllString(origin, "$1")
}

func branchPrompt(branches []string) string {
	var initialValue string
	options := make([]prompts.SelectOption[string], len(branches)-1)
	for i, branch := range branches {
		if branch == "" {
			continue
		}
		if strings.HasPrefix(branch, "*") {
			initialValue = branch
		}
		options[i] = prompts.SelectOption[string]{
			Label: branch,
			Value: branch,
		}
	}
	branch, err := prompts.Select[string](prompts.SelectParams[string]{
		Message:      "Select a branch",
		Options:      options,
		InitialValue: initialValue,
	})
	utils.VerifyPromptCancel(err)
	return branch
}

func init() {
	rootCmd.AddCommand(branchCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// branchCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// branchCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
