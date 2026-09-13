package pomodoro

import (
	"time"
)

type Mode string

const (
	ModeFocus      Mode = "focus"
	ModeShortBreak Mode = "short_break"
	ModeLongBreak  Mode = "long_break"
)

// PomodoroSetting GORM Model
type PomodoroSetting struct {
	UserID            string `gorm:"primaryKey;size:64" json:"user_id"`
	FocusMinutes      int    `gorm:"not null;default:25" json:"focus_minutes"`
	ShortBreakMinutes int    `gorm:"not null;default:5" json:"short_break_minutes"`
	LongBreakMinutes  int    `gorm:"not null;default:15" json:"long_break_minutes"`
	LongBreakInterval int    `gorm:"not null;default:4" json:"long_break_interval"`
	CurrentCycle      int    `gorm:"not null;default:1" json:"current_cycle"`
	Mode              Mode   `gorm:"size:32;not null;default:'focus'" json:"mode"`
	ActiveTaskID      string `gorm:"size:64;default:''" json:"active_task_id"`
	IsPaused          bool   `gorm:"default:false" json:"is_paused"`
	RemainingSeconds  int    `gorm:"default:0" json:"remaining_seconds"`
}

func (PomodoroSetting) TableName() string {
	return "pomodoro_settings"
}

// PomodoroSession GORM Model
type PomodoroSession struct {
	ID              string    `gorm:"primaryKey;size:64" json:"id"`
	UserID          string    `gorm:"index;size:64;not null" json:"user_id"`
	TaskID          string    `gorm:"size:64;default:''" json:"task_id"`
	Mode            Mode      `gorm:"size:32;not null" json:"mode"`
	DurationMinutes int       `gorm:"not null" json:"duration_minutes"`
	ExpEarned       int       `gorm:"not null;default:0" json:"exp_earned"`
	CoinsEarned     int       `gorm:"not null;default:0" json:"coins_earned"`
	CompletedAt     time.Time `gorm:"autoCreateTime" json:"completed_at"`
}

func (PomodoroSession) TableName() string {
	return "pomodoro_sessions"
}
