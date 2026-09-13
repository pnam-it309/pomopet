package shop

type FullProfileResponse struct {
	UserID                 string              `json:"user_id"`
	Coins                  int                 `json:"coins"`
	TotalFocusMinutes      int                 `json:"total_focus_minutes"`
	TotalSessionsCompleted int                 `json:"total_sessions_completed"`
	StreakDays             int                 `json:"streak_days"`
	Inventory              []UserInventoryItem `json:"inventory"`
	UnlockedHats           []string            `json:"unlocked_hats"`
	UnlockedThemes         []string            `json:"unlocked_themes"`
	DailyQuests            []DailyQuest        `json:"daily_quests"`
}

type BuyRequest struct {
	ItemID string `json:"item_id"`
}

type ClaimQuestRequest struct {
	QuestID string `json:"quest_id"`
}
