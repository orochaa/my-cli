/*
Copyright © 2024 NAME HERE <EMAIL ADDRESS>
*/
package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/Mist3rBru/go-clack/prompts"
	"github.com/Mist3rBru/go-clack/prompts/utils"
	"github.com/Mist3rBru/go-clack/third_party/picocolors"
	"github.com/spf13/cobra"
)

// httpCmd represents the http command
var httpCmd = &cobra.Command{
	Use:   "http",
	Short: "Make an http request",
	Long:  "Make an http request",
	Run: func(cmd *cobra.Command, args []string) {
		verifyArgs("params", args)

		method, urlParams := getMethod(args)
		uri, bodyAndHeadersParams, err := getUrl(urlParams)
		if err != nil {
			prompts.Error(err.Error())
			return
		}

		bodyParams, headerParams := splitBodyAndHeaderParams(bodyAndHeadersParams)
		headers := getHeaders(headerParams)
		body := getBody(bodyParams)

		request := &http.Request{
			Method: method,
			URL:    uri,
			Header: headers,
			Body:   body,
		}
		client := &http.Client{}
		response, err := client.Do(request)
		if err != nil {
			prompts.Error(err.Error())
			return
		}
		defer response.Body.Close()

		statusLabel := picocolors.Cyan("\"StatusCode\"")
		bodyLabel := picocolors.Cyan("\"Body\"")

		statusMessage := fmt.Sprintf("%s: %d", statusLabel, response.StatusCode)
		if response.StatusCode < 400 {
			prompts.Success(statusMessage)
		} else {
			prompts.Error(statusMessage)
		}

		responseJsonLines, err := parseJsonResponse(response)
		if err != nil {
			prompts.Error(err.Error())
			return
		}

		if len(responseJsonLines) > 0 {
			os.Stdout.WriteString(fmt.Sprintf("%s %s: %s\n", picocolors.Gray(utils.S_BAR), bodyLabel, responseJsonLines[0]))
			lineTemplate := fmt.Sprintf(`$1%s`, picocolors.Cyan("$2"))
			lineRegex := regexp.MustCompile(`^(.*?)(".+?")`)
			for i := 1; i < len(responseJsonLines); i++ {
				formattedLine := lineRegex.ReplaceAllString(responseJsonLines[i], lineTemplate)
				os.Stdout.WriteString(fmt.Sprintf("%s %s\n", picocolors.Gray(utils.S_BAR), formattedLine))
			}
		} else {
			os.Stdout.WriteString(fmt.Sprintf("%s %s: No Content\n", picocolors.Gray(utils.S_BAR), bodyLabel))
		}

		os.Stdout.WriteString(picocolors.Gray(utils.S_BAR_END) + "\n")
	},
}

func getMethod(args []string) (string, []string) {
	verifyArgs("method param", args)

	method := strings.ToUpper(args[0])
	switch method {
	case "GET", "POST", "PUT", "DELETE":
		return method, args[1:]
	}
	return "GET", args
}

func getUrl(args []string) (*url.URL, []string, error) {
	verifyArgs("url param", args)

	firstArg := args[0]
	rest := args[1:]

	if strings.HasPrefix(firstArg, "/") {
		uri, err := url.Parse(fmt.Sprintf("http://localhost:3000%s", firstArg))
		return uri, rest, err
	}

	if strings.HasPrefix(firstArg, ":") {
		uri, err := url.Parse(fmt.Sprintf("http://localhost%s", firstArg))
		return uri, rest, err
	}

	if strings.HasPrefix(firstArg, "http") {
		uri, err := url.Parse(firstArg)
		return uri, rest, err
	}

	return &url.URL{}, []string{}, fmt.Errorf("invalid url param")
}

func splitBodyAndHeaderParams(args []string) ([]string, []string) {
	var bodyParams, headersParams []string

	for _, arg := range args {
		if strings.HasPrefix(arg, "h.") {
			headersParams = append(headersParams, arg)
		} else {
			bodyParams = append(bodyParams, arg)
		}
	}

	return bodyParams, headersParams
}

func getBody(args []string) io.ReadCloser {
	if len(args) == 0 {
		return nil
	}
	bodyObj := convertToJson(args)
	bodyBytes, _ := json.Marshal(bodyObj)
	bodyBuffer := bytes.NewBuffer(bodyBytes)
	return io.NopCloser(bodyBuffer)
}

func getHeaders(args []string) http.Header {
	headers := http.Header{}
	headers.Add("Content-Type", "application/json")

	if len(args) == 0 {
		return headers
	}

	headerArgs := []string{}
	for _, arg := range args {
		headerArgs = append(headerArgs, strings.Replace(arg, "h.", "", 1))
	}

	headerObj := convertToJson(headerArgs)
	for header, value := range headerObj {
		headers.Add(header, value.(string))
	}

	return headers
}

func convertToJson(keyValueList []string) map[string]any {
	result := make(map[string]any)

	for _, item := range keyValueList {
		parts := strings.SplitN(item, "=", 2)
		keys := strings.Split(parts[0], ".")
		value := parts[1]

		currentObject := result

		for i := 0; i < len(keys)-1; i++ {
			key := keys[i]

			if _, exists := currentObject[key].(map[string]any); !exists {
				currentObject[key] = make(map[string]any)
			}
			currentObject = currentObject[key].(map[string]any)
		}

		currentObject[keys[len(keys)-1]] = parseValue(value)
	}

	return result
}

func parseValue(value string) any {
	if value == "" {
		return value
	} else if value == "true" {
		return true
	} else if value == "false" {
		return false
	} else if num, err := strconv.ParseFloat(value, 64); err == nil {
		return num
	} else if isArray(value) {
		elements := strings.Split(value[1:len(value)-1], ",")
		var result []any
		for _, element := range elements {
			if trimmedElement := strings.TrimSpace(element); trimmedElement != "" {
				result = append(result, parseValue(trimmedElement))
			}
		}
		return result
	} else if isObject(value) {
		var result map[string]any
		if err := json.Unmarshal([]byte(value), &result); err == nil {
			return result
		}
	}

	return strings.ReplaceAll(strings.Trim(value, `"'`), "+", " ")
}

func isArray(value string) bool {
	matched, _ := regexp.MatchString(`^\[.*?\]$`, value)
	return matched
}

func isObject(value string) bool {
	matched, _ := regexp.MatchString(`^{.*?}$`, value)
	return matched
}

func parseJsonResponse(response *http.Response) ([]string, error) {
	body, err := io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}

	var bodyJsonBuffer bytes.Buffer
	if err := json.Indent(&bodyJsonBuffer, body, "", "  "); err != nil {
		return nil, nil
	}

	bodyJsonLines := strings.Split(bodyJsonBuffer.String(), "\n")

	return bodyJsonLines, nil
}

func verifyArgs(label string, args []string) {
	if len(args) == 0 {
		prompts.Error(fmt.Sprintf("Missing %s", label))
		os.Exit(0)
	}
}

func init() {
	rootCmd.AddCommand(httpCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// httpCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// httpCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}
