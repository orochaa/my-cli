package utils

import (
	"runtime"
	"sync"
)

func SpinTasks() (*sync.WaitGroup, chan func()) {
	var taskWg sync.WaitGroup
	taskCh := make(chan func())

	for range runtime.NumCPU() * 10 {
		go func() {
			for task := range taskCh {
				task()
			}
		}()
	}

	return &taskWg, taskCh
}
