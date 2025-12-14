/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/Mist3rBru/my-cli/internals/lockfile"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/orochaa/go-clack/prompts"
	"github.com/spf13/cobra"
)

type Project struct {
	Name   string
	Folder string
	Path   string
}

// openCmd represents the open command
var openCmd = &cobra.Command{
	Use:   "open",
	Short: "Open a project",
	Long:  "Open a project on vscode, the projects available are based on `setup`",
	Run: func(cmd *cobra.Command, args []string) {
		l := lockfile.Open()
		defer l.Close()

		projectsRootList := l.GetUserProjectsRootList()
		projects := mapProjects(projectsRootList)
		if len(projects) == 0 {
			prompts.Error("no project found")
		}
		var openProjectList []Project

		var filter string
		if len(args) > 0 {
			filter = args[0]
		} else {
			filter, _ = cmd.Flags().GetString("filter")
		}

		if filter != "" {
			filteredProjects := []Project{}
			for _, project := range projects {
				if strings.Contains(project.Folder, filter) || strings.Contains(project.Name, filter) {
					filteredProjects = append(filteredProjects, project)
				}
			}
			if len(filteredProjects) == 0 {
				prompts.Error("no filtered project found")
				return
			}

			if len(filteredProjects) == 1 {
				openProjectList = []Project{filteredProjects[0]}
			} else {
				openProjectList = projectsPrompt(filteredProjects)
			}
		} else {
			openProjectList = projectsPrompt(projects)
		}

		if len(openProjectList) == 0 {
			prompts.Cancel("no project selected to open")
			return
		}

		openList := make([]string, len(openProjectList))
		for i, project := range openProjectList {
			openList[i] = project.Path
		}

		isReuseWindow, _ := cmd.Flags().GetBool("reuse-window")
		reuse := ""
		if isReuseWindow {
			reuse = "--reuse-window"
		}

		isWorkspace, _ := cmd.Flags().GetBool("workspace")
		if !isWorkspace && len(openList) > 1 {
			isWorkspace, _ = prompts.Confirm(prompts.ConfirmParams{
				Message: "Do you want to open on a workspace?",
			})
		}

		if isWorkspace || (isReuseWindow && len(openProjectList) > 1) {
			utils.ExecOrExit(append([]string{"code", reuse}, openList...)...)
		} else {
			for _, open := range openList {
				utils.Exec("code", reuse, open)
			}
		}
	},
}

func mapProjects(rootList []string) []Project {
	projects := []Project{}
	for _, root := range rootList {
		entries, err := os.ReadDir(root)
		if err != nil {
			prompts.Error(err.Error())
			continue
		}
		for _, entry := range entries {
			if entry.IsDir() && !strings.HasPrefix(entry.Name(), ".") {
				projects = append(projects, Project{
					Name:   entry.Name(),
					Folder: filepath.Base(root),
					Path:   filepath.Join(root, entry.Name()),
				})
			}
		}
	}
	return projects
}

func projectsPrompt(projects []Project) []Project {
	options := make([]*prompts.MultiSelectOption[Project], len(projects))
	for i, project := range projects {
		options[i] = &prompts.MultiSelectOption[Project]{
			Label: filepath.Join(project.Folder, project.Name),
			Value: project,
		}
	}
	openProjectList, err := prompts.MultiSelect(prompts.MultiSelectParams[Project]{
		Message:  "Select one or more project to open:",
		Options:  options,
		Filter:   true,
		Required: true,
	})
	prompts.ExitOnError(err)
	return openProjectList
}

func init() {
	rootCmd.AddCommand(openCmd)

	openCmd.Flags().BoolP("workspace", "w", false, "open on workspace")
	openCmd.Flags().BoolP("reuse-window", "r", false, "reuse current window")
	openCmd.Flags().StringP("filter", "f", "", "filter open options")

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// openCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// openCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
