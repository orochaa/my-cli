package utils

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
)

func ReadJson(path string, target any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, target)
	return err
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func Exec(command ...string) (string, error) {
	s, _ := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
	s.Start(strings.Join(command, " "))
	out, err := exec.Command(command[0], command[1:]...).Output()
	if err != nil {
		s.Stop("", 1)
		prompts.Cancel(err.Error())
		return "", err
	}
	s.Stop("", 0)
	return string(out), nil
}

func ExecSilent(command ...string) (string, error) {
	out, err := exec.Command(command[0], command[1:]...).Output()
	return string(out), err
}

func ExecOrExit(command ...string) string {
	out, err := Exec(command...)
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
