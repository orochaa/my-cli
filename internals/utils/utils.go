package utils

import (
	"runtime"
	"sync"
)

func SpinTasks(numRoutines int) (*sync.WaitGroup, chan func()) {
	var taskWg sync.WaitGroup
	taskCh := make(chan func())

	for range numRoutines {
		go func() {
			for task := range taskCh {
				task()
			}
		}()
	}

	return &taskWg, taskCh
}

func SpinIOTasks() (*sync.WaitGroup, chan func()) {
	return SpinTasks(runtime.NumCPU() * 10)
}
