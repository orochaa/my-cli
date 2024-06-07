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

func Exec(command ...string) error {
	s, _ := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
	s.Start(strings.Join(command, " "))
	err := exec.Command(command[0], command[1:]...).Run()
	if err != nil {
		s.Stop(err.Error(), 1)
	} else {
		s.Stop("", 0)
	}
	return err
}

func ExecSilent(command ...string) string {
	out, _ := exec.Command(command[0], command[1:]...).Output()
	return string(out)
}

func VerifyPromptCancel(err error) {
	if err != nil {
		os.Exit(0)
	}
}
