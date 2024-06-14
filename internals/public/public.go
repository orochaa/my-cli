package public

import (
	"embed"
	"fmt"
	"io"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/my-cli/third_party/assert"
)

//go:embed config/* snippets/*
var e embed.FS

func CopyConfig(fileName string) {
	src, err := e.Open(filepath.Join("config", fileName))
	assert.NoError(err, fmt.Sprintf("%s should open", fileName))
	defer src.Close()
	dst, err := os.Create(fileName)
	if err != nil {
		prompts.Error(err.Error())
		return
	}
	defer dst.Close()
	_, err = io.Copy(dst, src)
	if err != nil {
		prompts.Error(err.Error())
	}
}

func VsCodeFolderPath() string {
	cwd, err := os.Getwd()
	assert.NoError(err, "")
	return filepath.Join(cwd, ".vscode")

}

func CreateVsCodeFolder() {
	os.MkdirAll(VsCodeFolderPath(), os.ModePerm)
}

func CopySnippet(snippet string) {
	fileName := fmt.Sprintf("%s.code-snippets", snippet)
	src, err := e.Open(filepath.Join("snippets", fileName))
	assert.NoError(err, fmt.Sprintf("%s should open", fileName))
	defer src.Close()
	dst, err := os.Create(filepath.Join(VsCodeFolderPath(), fileName))
	if err != nil {
		prompts.Error(err.Error())
		return
	}
	defer dst.Close()
	_, err = io.Copy(dst, src)
	if err != nil {
		prompts.Error(err.Error())
	}
}
