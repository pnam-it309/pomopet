package shop

import (
	"time"
)

// ShopItem GORM Model (Stored in DB, NOT hardcoded!)
type ShopItem struct {
	ID            string `gorm:"primaryKey;size:64" json:"id"`
	Name          string `gorm:"size:100;not null" json:"name"`
	Description   string `gorm:"size:255;not null" json:"description"`
	Category      string `gorm:"size:32;not null" json:"category"` // food | hat | theme
	Price         int    `gorm:"not null" json:"price"`
	HungerGain    int    `gorm:"default:0" json:"hunger_gain"`
	HappinessGain int    `gorm:"default:0" json:"happiness_gain"`
	ExpGain       int    `gorm:"default:0" json:"exp_gain"`
	IconType      string `gorm:"size:64;not null" json:"icon_type"` // vector icon identifier
}

func (ShopItem) TableName() string {
	return "shop_items"
}

// UserProfile GORM Model
type UserProfile struct {
	UserID                 string    `gorm:"primaryKey;size:64" json:"user_id"`
	Coins                  int       `gorm:"not null;default:100" json:"coins"`
	TotalFocusMinutes      int       `gorm:"not null;default:0" json:"total_focus_minutes"`
	TotalSessionsCompleted int       `gorm:"not null;default:0" json:"total_sessions_completed"`
	StreakDays             int       `gorm:"not null;default:1" json:"streak_days"`
	LastActiveDate         string    `gorm:"size:32" json:"last_active_date"`
	UpdatedAt              time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (UserProfile) TableName() string {
	return "user_profiles"
}

// UserInventoryItem GORM Model
type UserInventoryItem struct {
	ID       string `gorm:"primaryKey;size:64" json:"id"`
	UserID   string `gorm:"index;size:64;not null" json:"user_id"`
	ItemID   string `gorm:"size:64;not null" json:"item_id"`
	Quantity int    `gorm:"not null;default:1" json:"quantity"`
}

func (UserInventoryItem) TableName() string {
	return "user_inventory_items"
}

// UserUnlockedItem GORM Model (for permanent hats and room themes)
type UserUnlockedItem struct {
	ID       string `gorm:"primaryKey;size:64" json:"id"`
	UserID   string `gorm:"index;size:64;not null" json:"user_id"`
	ItemType string `gorm:"size:32;not null" json:"item_type"` // "hat" | "theme"
	ItemID   string `gorm:"size:64;not null" json:"item_id"`
}

func (UserUnlockedItem) TableName() string {
	return "user_unlocked_items"
}

// DailyQuest GORM Model
type DailyQuest struct {
	ID          string `gorm:"primaryKey;size:64" json:"id"`
	UserID      string `gorm:"index;size:64;not null" json:"user_id"`
	QuestKey    string `gorm:"size:64;not null" json:"quest_key"`
	Title       string `gorm:"size:255;not null" json:"title"`
	Target      int    `gorm:"not null" json:"target"`
	Current     int    `gorm:"not null;default:0" json:"current"`
	RewardCoins int    `gorm:"not null" json:"reward_coins"`
	RewardExp   int    `gorm:"not null" json:"reward_exp"`
	IsClaimed   bool   `gorm:"default:false" json:"is_claimed"`
}

func (DailyQuest) TableName() string {
	return "daily_quests"
}
