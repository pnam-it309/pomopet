package pomodoro

type StartRequest struct {
	Mode         Mode   `json:"mode"`
	ActiveTaskID string `json:"active_task_id"`
}

type PauseRequest struct {
	IsPaused         bool `json:"is_paused"`
	RemainingSeconds int  `json:"remaining_seconds"`
}

type UpdateSettingsRequest struct {
	FocusMinutes      int `json:"focus_minutes"`
	ShortBreakMinutes int `json:"short_break_minutes"`
	LongBreakMinutes  int `json:"long_break_minutes"`
	LongBreakInterval int `json:"long_break_interval"`
}

type CompleteResult struct {
	Mode            Mode             `json:"mode"`
	DurationMinutes int              `json:"duration_minutes"`
	ExpEarned       int              `json:"exp_earned"`
	CoinsEarned     int              `json:"coins_earned"`
	Settings        *PomodoroSetting `json:"settings"`
}
