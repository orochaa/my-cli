/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/go-clack/third_party/picocolors"
	"github.com/Mist3rBru/go-clack/third_party/sisteransi"
	"github.com/Mist3rBru/my-cli/internals/utils"
	"github.com/spf13/cobra"
	"golang.org/x/term"
)

// runCmd represents the run command
var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run scripts in sequence",
	Long:  "Run scripts in sequence from package.json",
	Run: func(cmd *cobra.Command, args []string) {
		isDeep, _ := cmd.Flags().GetBool("deep")

		if isDeep {
			deepRun(cmd, args)
		}

		// 	if len(args) > 0 && isDeep {
		// 		deepRun(args)
		// 	} else if len(args) > 0 {
		// 		shallowRun(args)
		// 	} else {
		// 		scripts, err := scriptsPrompt()
		// 		shallowRun(scripts)
		// 	}
	},
}

type PackageJson struct {
	Scripts map[string]string `json:"scripts"`
}

type ProjectOutput struct {
	Idx     int
	Name    string
	Command string
	Out     string
}

type CommandWriter struct {
	buffer []string
	writer func(str string)
}

func (w *CommandWriter) Write(p []byte) (n int, err error) {
	line := string(p)
	w.buffer = append(w.buffer, strings.Trim(line, "\n"))
	w.writer(strings.Join(w.buffer, "\n"))
	return 0, nil
}

func deepRun(cmd *cobra.Command, args []string) {
	if len(args) == 0 {
		prompts.Cancel("no args provided")
		return
	}

	_, maxRows, err := term.GetSize(int(os.Stdout.Fd()))
	if err != nil {
		maxRows = 10
	}

	cwd, err := os.Getwd()
	if err != nil {
		prompts.Error(err.Error())
		return
	}

	var wg sync.WaitGroup
	projects := filterNodeProjects(mapProjects([]string{cwd}))
	outputCh := make(chan ProjectOutput, len(projects))

	isScript, _ := cmd.Flags().GetBool("strict")

	for i, project := range projects {
		wg.Add(1)
		go func(args []string, project Project, idx int, outputCh chan ProjectOutput) {
			defer wg.Done()

			var packageJson PackageJson
			err := utils.ReadJson(filepath.Join(project.Path, "package.json"), &packageJson)
			if err != nil {
				outputCh <- ProjectOutput{
					Idx:     idx,
					Name:    project.Name,
					Command: args[0],
					Out:     picocolors.Green("done"),
				}
				return
			}
			scriptRunners := mapScriptRunners(args, packageJson, isScript)
			for _, scriptRunner := range scriptRunners {
				commands := utils.ParseCommand([]string{scriptRunner.Runner, scriptRunner.Script})
				writer := &CommandWriter{
					writer: func(out string) {
						outputCh <- ProjectOutput{Idx: idx, Name: project.Name, Out: out, Command: strings.Join(commands, " ")}
					},
				}
				cmd := exec.Command(commands[0], commands[1:]...)
				cmd.Dir = project.Path
				stdoutPipe, err := cmd.StdoutPipe()
				if err != nil {
					fmt.Fprintf(writer, "Error creating stdout pipe for command '%s': %s\n", strings.Join(commands, " "), err)
					continue
				}
				stderrPipe, err := cmd.StderrPipe()
				if err != nil {
					fmt.Fprintf(writer, "Error creating stderr pipe for command '%s': %s\n", strings.Join(commands, " "), err)
					continue
				}

				if err := cmd.Start(); err != nil {
					fmt.Fprintf(writer, "Error starting command '%s': %s\n", strings.Join(commands, " "), err)
					continue
				}

				stdoutScanner := bufio.NewScanner(stdoutPipe)
				stderrScanner := bufio.NewScanner(stderrPipe)

				go func() {
					for stdoutScanner.Scan() {
						fmt.Fprintf(writer, "%s\n", stdoutScanner.Text())
					}
				}()

				go func() {
					for stderrScanner.Scan() {
						fmt.Fprintf(writer, "%s\n", stderrScanner.Text())
					}
				}()

				if err := cmd.Wait(); err != nil {
					fmt.Fprintf(writer, "Error waiting for command '%s' to finish: %s\n", strings.Join(commands, " "), err)
				} else {
					fmt.Fprint(writer, picocolors.Green("done"))
				}
			}
		}(args, project, i, outputCh)
	}

	go func() {
		wg.Wait()
		close(outputCh)
	}()

	// Clear the terminal screen
	rowsPerProject := max(maxRows/len(projects), 2)

	os.Stdout.WriteString(strings.Repeat("\n", len(projects)*rowsPerProject))

	for output := range outputCh {
		rowStart := output.Idx * rowsPerProject
		lines := strings.Split(output.Out, "\n")
		startIdx := max(len(lines)-rowsPerProject+1, 0)
		value := strings.Join(lines[startIdx:], "\n")
		if len(lines)+1 < rowsPerProject {
			value += strings.Repeat("\n", rowsPerProject-len(lines)-1)
		}
		os.Stdout.WriteString(sisteransi.MoveCursor(-rowStart-1, -999))
		os.Stdout.WriteString(strings.Repeat("\033[2K\n\r", rowsPerProject))
		os.Stdout.WriteString(sisteransi.MoveCursor(-rowsPerProject, -999))
		os.Stdout.WriteString(fmt.Sprintf("%s\n%s\n%s", picocolors.Cyan(output.Name), output.Command, value))
		os.Stdout.WriteString(sisteransi.MoveCursorDown(999))
	}
}

type ScriptRunner struct {
	Script string
	Runner string
}

func mapScriptRunners(args []string, packageJson PackageJson, isStrict bool) []ScriptRunner {
	var scriptRunners []ScriptRunner

	if packageJson.Scripts == nil {
		return scriptRunners
	}

	for _, arg := range args {
		if packageJson.Scripts[arg] != "" {
			scriptRunners = append(scriptRunners, ScriptRunner{
				Script: arg,
				Runner: "npm run",
			})
		} else if !isStrict {
			scriptRunners = append(scriptRunners, ScriptRunner{
				Script: arg,
				Runner: "npx",
			})
		}
	}

	return scriptRunners
}

func filterNodeProjects(projects []Project) []Project {
	nodeProjects := []Project{}

	for _, project := range projects {
		if utils.Exists(filepath.Join(project.Path, "package.json")) {
			nodeProjects = append(nodeProjects, project)
		}
	}

	return nodeProjects
}

func init() {
	rootCmd.AddCommand(runCmd)

	runCmd.Flags().BoolP("deep", "d", false, "run scripts on child projects")
	runCmd.Flags().BoolP("strict", "s", false, "run only scripts from package.json")

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// runCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// runCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
