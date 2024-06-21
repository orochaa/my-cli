package utils

import (
	"encoding/json"
	"io"
	"os"
	"path/filepath"
	"sync"

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

func CopyFile(fromFilePath, toFilePath string) error {
	fromFile, err := os.Open(fromFilePath)
	if err != nil {
		return err
	}
	defer fromFile.Close()

	toFile, err := os.Create(toFilePath)
	if err != nil {
		return err
	}
	defer toFile.Close()

	_, err = io.Copy(toFile, fromFile)
	if err != nil {
		return err
	}

	return toFile.Sync()
}

func CopyDir(fromDirPath string, toDirPath string, wg *sync.WaitGroup) {
	defer wg.Done()

	entries, err := os.ReadDir(fromDirPath)
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	for _, entry := range entries {
		if entry.Name() == ".git" || entry.Name() == "node_modules" {
			continue
		}

		fromPath := filepath.Join(fromDirPath, entry.Name())
		toPath := filepath.Join(toDirPath, entry.Name())

		if entry.IsDir() {
			if err = os.MkdirAll(toPath, entry.Type()); err != nil {
				prompts.Error(err.Error())
				continue
			}
			wg.Add(1)
			go CopyDir(fromPath, toPath, wg)
		} else {
			wg.Add(1)
			go func(fromFilePath, toFilePath string) {
				defer wg.Done()
				if err = CopyFile(fromFilePath, toFilePath); err != nil {
					prompts.Error(err.Error())
				}
			}(fromPath, toPath)
		}
	}
}
