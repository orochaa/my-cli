package utils

import (
	"encoding/json"
	"os"
)

func ReadJson(path string, target any) error {
	data, err := os.ReadFile(path)
	if err != nil {
		return err
	}
	err = json.Unmarshal(data, target)
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
