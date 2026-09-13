package auth

import (
	"time"
)

// User GORM Model
type User struct {
	ID           string    `gorm:"primaryKey;size:64" json:"id"`
	Username     string    `gorm:"uniqueIndex;size:64;not null" json:"username"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	DisplayName  string    `gorm:"size:100;not null" json:"display_name"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
	LastLoginAt  time.Time `json:"last_login_at"`
}

func (User) TableName() string {
	return "users"
}

// Safe returns a sanitized copy for client serialization
func (u *User) Safe() *User {
	if u == nil {
		return nil
	}
	clone := *u
	clone.PasswordHash = ""
	return &clone
}
