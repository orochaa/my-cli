/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"os"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/go-clack/prompts/symbols"
	"github.com/Mist3rBru/go-clack/third_party/picocolors"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use: "my-cli",
	Run: func(cmd *cobra.Command, args []string) {
		if isInteractive, _ := cmd.Flags().GetBool("interactive"); isInteractive {
			options := []*prompts.SelectOption[*cobra.Command]{}

			for _, command := range cmd.Commands() {
				options = append(options, &prompts.SelectOption[*cobra.Command]{
					Label: command.Use,
					Value: command,
					Hint:  command.Short,
				})
			}

			command, err := prompts.Select(prompts.SelectParams[*cobra.Command]{
				Message:  "Select a command to run:",
				Options:  options,
				Required: true,
			})
			prompts.ExitOnError(err)

			command.Run(command, args)
			return
		}

		prompts.Intro(picocolors.BgCyan(" my-cli "))

		for _, command := range cmd.Commands() {
			os.Stdout.WriteString(fmt.Sprintf(
				"%s %s %s %s\n",
				picocolors.Gray(symbols.BAR),
				picocolors.Cyan(command.Use),
				picocolors.Dim("-"),
				command.Short,
			))
		}

		os.Stdout.WriteString(fmt.Sprintf(
			"%s\n%s %s\n",
			picocolors.Gray(symbols.BAR),
			picocolors.Gray(symbols.BAR_END),
			picocolors.Dim("use `my-cli -i` to enable interactive mode"),
		))
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	rootCmd.Flags().BoolP("interactive", "i", false, "Enable interactive mode")

	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.my-cli.yaml)")

	// Cobra also supports local flags, which will only run
	// // when this action is called directly.
	// rootCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
