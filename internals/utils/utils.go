package utils

import (
	"context"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/third_party/assert"
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
	s, _ := prompts.Spinner(context.Background(), prompts.SpinnerOptions{})
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

func AddPackageJsonScripts(scripts map[string]string) {
	cwd, err := os.Getwd()
	assert.NoError(err, "")
	packageJSONPath := filepath.Join(cwd, "package.json")

	file, err := os.ReadFile(packageJSONPath)
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	var packageData map[string]any
	if err := json.Unmarshal(file, &packageData); err != nil {
		prompts.Error(err.Error())
		return
	}

	// Ensure the "scripts" key exists and is a map
	packageScripts, ok := packageData["scripts"].(map[string]string)
	if !ok {
		packageScripts = make(map[string]string)
		packageData["scripts"] = packageScripts
	}
	for name, command := range scripts {
		packageScripts[name] = command
	}

	updatedJSON, err := json.MarshalIndent(packageData, "", "  ")
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	if err := os.WriteFile(packageJSONPath, updatedJSON, 0644); err != nil {
		prompts.Error(err.Error())
		return
	}
}
