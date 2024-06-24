package ni

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type Agent string

var AGENTS = map[string]Agent{
	"yarn":       "yarn",
	"pnpm":       "pnpm",
	"npm":        "npm",
	"yarn@berry": "yarn@berry",
}

var LOCKS = map[string]Agent{
	"yarn.lock":         "yarn",
	"package-lock.json": "npm",
	"pnpm-lock.yaml":    "pnpm",
}

var INSTALL_PAGE = map[Agent]string{
	"yarn": "https://yarnpkg.com/getting-started/install",
	"pnpm": "https://pnpm.io/installation",
	"npm":  "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
}

type DetectOptions struct {
	AutoInstall  bool
	Programmatic bool
	Cwd          string
}

type PackageJson struct {
	PackageManager string `json:"packageManager"`
}

func Detect(options DetectOptions) (Agent, error) {
	var agent Agent

	lockPath, err := findUp(ObjectKeys(LOCKS), options.Cwd)
	if err != nil {
		return "", err
	}
	var packageJsonPath string

	if lockPath != "" {
		packageJsonPath = filepath.Join(filepath.Dir(lockPath), "package.json")
	} else {
		packageJsonPath, err = findUp([]string{"package.json"}, options.Cwd)
		if err != nil {
			return "", err
		}
	}

	if packageJsonPath != "" && fileExists(packageJsonPath) {
		pkg, err := readPackageJson(packageJsonPath)
		if err != nil {
			return "", err
		}
		if pkg.PackageManager != "" {
			nameVer := strings.Split(strings.TrimPrefix(pkg.PackageManager, "^"), "@")
			name := nameVer[0]
			ver := nameVer[1]
			if name == "yarn" && parseVersion(ver) > 1 {
				agent = "yarn@berry"
			} else if name == "pnpm" && parseVersion(ver) < 7 {
				agent = "pnpm@6"
			} else if _, ok := AGENTS[name]; ok {
				agent = AGENTS[name]
			} else if !options.Programmatic {
				fmt.Println("[ni] Unknown packageManager:", pkg.PackageManager)
			}
		}
	}

	if agent == "" && lockPath != "" {
		agent = LOCKS[filepath.Base(lockPath)]
	}

	return agent, nil
}

func ObjectKeys(m map[string]Agent) []string {
	keys := make([]string, 0, len(m))
	for k := range m {
		keys = append(keys, k)
	}
	return keys
}

func findUp(names []string, cwd string) (string, error) {
	for _, name := range names {
		current := cwd
		for {
			if current == "" {
				current, _ = os.Getwd()
			}
			path := filepath.Join(current, name)
			if fileExists(path) {
				return path, nil
			}
			if current == filepath.Dir(current) {
				break
			}
			current = filepath.Dir(current)
		}
	}
	return "", nil
}

func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

func readPackageJson(path string) (PackageJson, error) {
	var pkg PackageJson
	data, err := os.ReadFile(path)
	if err != nil {
		return pkg, err
	}
	err = json.Unmarshal(data, &pkg)
	return pkg, err
}

func parseVersion(version string) int {
	ver, _ := strconv.Atoi(strings.Split(version, ".")[0])
	return ver
}
