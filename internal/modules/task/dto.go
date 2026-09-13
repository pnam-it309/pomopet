package task

type CreateTaskRequest struct {
	Title              string `json:"title"`
	EstimatedPomodoros int    `json:"estimated_pomodoros"`
	Tag                string `json:"tag"`
}

type UpdateTaskRequest struct {
	Title              string `json:"title"`
	EstimatedPomodoros int    `json:"estimated_pomodoros"`
	Tag                string `json:"tag"`
	IsCompleted        *bool  `json:"is_completed,omitempty"`
}
