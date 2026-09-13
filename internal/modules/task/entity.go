package task

import (
	"time"
)

// Task GORM Model
type Task struct {
	ID                  string    `gorm:"primaryKey;size:64" json:"id"`
	UserID              string    `gorm:"index;size:64;not null" json:"user_id"`
	Title               string    `gorm:"size:255;not null" json:"title"`
	EstimatedPomodoros  int       `gorm:"not null;default:1" json:"estimated_pomodoros"`
	CompletedPomodoros  int       `gorm:"not null;default:0" json:"completed_pomodoros"`
	IsCompleted         bool      `gorm:"default:false" json:"is_completed"`
	Tag                 string    `gorm:"size:64;default:'Khac'" json:"tag"`
	CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Task) TableName() string {
	return "tasks"
}
