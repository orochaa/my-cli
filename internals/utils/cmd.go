package utils

import (
	"context"
	"os"
	"os/exec"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
)

func ParseCommand(command []string) []string {
	commands := []string{}
	for _, c := range command {
		for _, w := range strings.Split(c, " ") {
			if w != "" {
				commands = append(commands, w)
			}
		}
	}
	return commands
}

func Exec(command ...string) (string, error) {
	commands := ParseCommand(command)
	s := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
	s.Start(strings.Join(commands, " "))
	out, err := exec.Command(commands[0], commands[1:]...).Output()
	if err != nil {
		s.Stop("", 1)
		prompts.Cancel(err.Error())
		return "", err
	}
	s.Stop("", 0)
	return string(out), nil
}

func ExecSilent(command ...string) (string, error) {
	commands := ParseCommand(command)
	out, err := exec.Command(commands[0], commands[1:]...).Output()
	return string(out), err
}

func ExecOrExit(command ...string) string {
	commands := ParseCommand(command)
	out, err := Exec(commands...)
	if err != nil {
		os.Exit(1)
	}
	return out
}

func VerifyPromptCancel(err error) {
	if err != nil {
		os.Exit(0)
	}
}
