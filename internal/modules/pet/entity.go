package pet

import (
	"time"
)

type Species string
type Stage string

const (
	SpeciesCat     Species = "cat"
	SpeciesDragon  Species = "dragon"
	SpeciesSprout  Species = "sprout"
	SpeciesPenguin Species = "penguin"

	StageEgg    Stage = "egg"
	StageBaby   Stage = "baby"
	StageTeen   Stage = "teen"
	StageAdult  Stage = "adult"
	StageMythic Stage = "mythic"
)

// Pet GORM Model
type Pet struct {
	ID               string    `gorm:"primaryKey;size:64" json:"id"`
	UserID           string    `gorm:"uniqueIndex;size:64;not null" json:"user_id"`
	Name             string    `gorm:"size:64;not null" json:"name"`
	Species          Species   `gorm:"size:32;not null" json:"species"`
	Stage            Stage     `gorm:"size:32;not null" json:"stage"`
	Level            int       `gorm:"not null;default:1" json:"level"`
	Exp              int       `gorm:"not null;default:0" json:"exp"`
	ExpToNext        int       `gorm:"not null;default:100" json:"exp_to_next"`
	Health           int       `gorm:"not null;default:100" json:"health"`
	Hunger           int       `gorm:"not null;default:80" json:"hunger"`
	Happiness        int       `gorm:"not null;default:90" json:"happiness"`
	Energy           int       `gorm:"not null;default:100" json:"energy"`
	State            string    `gorm:"size:32;not null;default:'idle'" json:"state"`
	EquippedHat      string    `gorm:"size:64;default:''" json:"equipped_hat"`
	RoomTheme        string    `gorm:"size:64;default:'theme_cozy'" json:"room_theme"`
	LastFedAt        time.Time `json:"last_fed_at"`
	LastInteractedAt time.Time `json:"last_interacted_at"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt        time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Pet) TableName() string {
	return "pets"
}
