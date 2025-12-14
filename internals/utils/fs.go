package utils

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/orochaa/go-clack/prompts"
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

type Entry struct {
	os.DirEntry
	Path string
}

func MapDir(dirPath string, cb func(entry Entry)) {
	dirEntries, err := os.ReadDir(dirPath)
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	for _, dirEntry := range dirEntries {
		entryName := dirEntry.Name()
		if entryName[0] == '.' || entryName == "node_modules" {
			continue
		}

		entry := Entry{
			DirEntry: dirEntry,
			Path:     filepath.Join(dirPath, entryName),
		}

		if entry.IsDir() {
			MapDir(entry.Path, cb)
		}

		cb(entry)
	}
}
