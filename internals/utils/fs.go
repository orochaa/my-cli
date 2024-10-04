package utils

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/go-clack/prompts"
)

func ReadJson(path string, v any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, v)
	return err
}

func WriteJson(path string, v any) error {
	data, err := json.MarshalIndent(v, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(path, data, os.ModePerm)
}

func Exists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func MapDir(dirPath string, cb func(filePath string)) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	for _, entry := range entries {
		if entry.Name() == ".git" || entry.Name() == "node_modules" {
			continue
		}
		entryPath := filepath.Join(dirPath, entry.Name())

		if entry.IsDir() {
			MapDir(entryPath, cb)
			continue
		}

		cb(entryPath)
	}
}
