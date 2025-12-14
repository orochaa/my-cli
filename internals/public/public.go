package public

import (
	"embed"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path/filepath"

	"github.com/Mist3rBru/my-cli/third_party/assert"
	"github.com/orochaa/go-clack/prompts"
)

//go:embed config/* snippets/*
var e embed.FS

var SnippetExtension string = ".code-snippets"

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

func CreateVsCodeFolder() error {
	return os.MkdirAll(VsCodeFolderPath(), os.ModePerm)
}

func CopySnippet(snippet string) error {
	fileName := snippet + SnippetExtension
	src, err := e.Open(filepath.Join("snippets", fileName))
	assert.NoError(err, fmt.Sprintf("%s should open", fileName))
	defer src.Close()

	dst, err := os.Create(filepath.Join(VsCodeFolderPath(), fileName))
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	if err != nil {
		return err
	}

	return nil
}

func ReadSnippets() []fs.DirEntry {
	files, err := e.ReadDir("snippets")
	assert.NoError(err, "")
	return files
}
