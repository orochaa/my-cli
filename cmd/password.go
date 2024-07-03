/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"fmt"
	"math"
	"math/rand"
	"strconv"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
)

// passwordCmd represents the password command
var passwordCmd = &cobra.Command{
	Use:     "password",
	Aliases: []string{"pass"},
	Short:   "Generate a random password",
	Long:    "Generate a random and safe password with the given length",
	Run: func(cmd *cobra.Command, args []string) {
		var err error
		var length int

		if len(args) > 0 {
			length, err = strconv.Atoi(args[0])
			if err != nil {
				prompts.Error(err.Error())
				return
			}
		} else {
			res, err := prompts.Text(prompts.TextParams{
				Message:  "What is your desired password length?",
				Required: true,
				Validate: func(value string) error {
					if _, err := strconv.Atoi(value); err != nil {
						return fmt.Errorf("invalid number")
					}
					return nil
				},
			})
			utils.VerifyPromptCancel(err)
			length, _ = strconv.Atoi(res)
		}

		specials := "!@#$%&_?."
		lowercase := "abcdefghijklmnopqrstuvwxyz"
		uppercase := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		numbers := "0123456789"
		all := specials + lowercase + uppercase + numbers

		var password string
		for len(password) < length {
			password += pick(specials, 1, 0)
			password += pick(lowercase, 1, 0)
			password += pick(uppercase, 1, 0)
			password += pick(all, 3, 10)
		}

		prompts.Outro(shuffle(password[0:max(0, length)]))
	},
}

func pick(str string, min float64, max float64) string {
	var n int
	if max < min {
		n = int(min)
	} else {
		n = int(math.Floor(rand.Float64() * (max - min + 1)))
	}

	var chars string
	for i := 0; i < n; i++ {
		randIdx := int(rand.Float64() * float64((len(str))))
		randChar := string(str[randIdx])
		chars += randChar
	}

	return chars
}

func shuffle(str string) string {
	arr := strings.Split(str, "")
	topIdx := len(arr) - 1

	for topIdx > 0 {
		currentIdx := int(rand.Float64() * float64(topIdx+1))
		tmp := arr[currentIdx]
		arr[currentIdx] = arr[topIdx]
		arr[topIdx] = tmp
		topIdx--
	}

	return strings.Join(arr, "")
}

func init() {
	rootCmd.AddCommand(passwordCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// passwordCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// passwordCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
