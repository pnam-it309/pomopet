package shop

import (
	"context"
	"errors"
	"fmt"
	"time"

	"pomopet/internal/common/config"
	"pomopet/internal/common/eventbus"
)

type Service interface {
	GetCatalog(ctx context.Context) ([]ShopItem, error)
	GetProfile(ctx context.Context, userID string) (*FullProfileResponse, error)
	BuyItem(ctx context.Context, userID, itemID string) (*FullProfileResponse, error)
	ClaimQuest(ctx context.Context, userID, questID string) (*DailyQuest, int, int, error)
	ConsumeFoodItem(ctx context.Context, userID, itemID string) (*ShopItem, error)
	RecordSessionProgress(ctx context.Context, userID string, durationMins, coinsEarned int) error
	CreateStarterProfile(ctx context.Context, userID string) error
	RecordPetAction(ctx context.Context, userID, action string) error
}

type service struct {
	repo Repository
	cfg  *config.Config
	bus  *eventbus.EventBus
}

func NewService(repo Repository, cfg *config.Config, bus *eventbus.EventBus) Service {
	s := &service{
		repo: repo,
		cfg:  cfg,
		bus:  bus,
	}
	s.ensureCatalogSeeded(context.Background())
	return s
}

func (s *service) ensureCatalogSeeded(ctx context.Context) {
	defaultCatalog := []ShopItem{
		// Foods
		{ID: "food_apple", Name: "Tao Do", Description: "Hoi phuc 20 Do no va 10 EXP cho thu cung", Category: "food", Price: 15, HungerGain: 20, HappinessGain: 5, ExpGain: 10, IconType: "apple"},
		{ID: "food_cookie", Name: "Banh Quy", Description: "Hoi phuc 30 Do no va 15 Vui ve", Category: "food", Price: 25, HungerGain: 30, HappinessGain: 15, ExpGain: 15, IconType: "cookie"},
		{ID: "food_fish", Name: "Ca Hoi Tuoi", Description: "Mon ngon hao hang giup thu tang 45 EXP", Category: "food", Price: 40, HungerGain: 40, HappinessGain: 25, ExpGain: 45, IconType: "fish"},
		{ID: "food_steak", Name: "Bit Tet Thuong Hang", Description: "Bua tiec nang luong giup thu no ca ngay", Category: "food", Price: 70, HungerGain: 70, HappinessGain: 40, ExpGain: 80, IconType: "steak"},

		// Hats & Accessories
		{ID: "hat_chef", Name: "Mu Dau Bep", Description: "Doi len dau thuong thuc cac mon ngon", Category: "hat", Price: 120, IconType: "chef-hat"},
		{ID: "hat_witch", Name: "Mu Phu Thuy", Description: "Hao quang huyen bi tu the gioi phep thuat", Category: "hat", Price: 180, IconType: "witch-hat"},
		{ID: "hat_viking", Name: "Mu Chien Binh", Description: "Kien cuong tap trung vuot qua moi thu thach", Category: "hat", Price: 250, IconType: "viking-hat"},
		{ID: "hat_crown", Name: "Vuong Mien Hoang Gia", Description: "Dinh cao ton vinh chu nhan cham chi", Category: "hat", Price: 500, IconType: "crown"},

		// Themes
		{ID: "theme_cozy", Name: "Phong Hoc Am Cung", Description: "Khong gian go moc mac thu thai", Category: "theme", Price: 0, IconType: "theme-cozy"},
		{ID: "theme_space", Name: "Tram Vu Tru Tinh Lang", Description: "Nhin ngam tinh tu trong vu tru bao la", Category: "theme", Price: 200, IconType: "theme-space"},
		{ID: "theme_forest", Name: "Rung Thong Ban Mai", Description: "Khong khi trong lanh ngap tran huong co", Category: "theme", Price: 250, IconType: "theme-forest"},
		{ID: "theme_sunset", Name: "Hoang Hon Bo Tay", Description: "Gam mau am ap de chiu cuoi ngay", Category: "theme", Price: 300, IconType: "theme-sunset"},
	}
	_ = s.repo.SeedCatalog(ctx, defaultCatalog)
}

func (s *service) GetCatalog(ctx context.Context) ([]ShopItem, error) {
	return s.repo.GetCatalog(ctx)
}

func (s *service) CreateStarterProfile(ctx context.Context, userID string) error {
	today := time.Now().Format("2006-01-02")
	profile := &UserProfile{
		UserID:                 userID,
		Coins:                  100,
		TotalFocusMinutes:      0,
		TotalSessionsCompleted: 0,
		StreakDays:             1,
		LastActiveDate:         today,
		UpdatedAt:              time.Now(),
	}
	if err := s.repo.SaveProfile(ctx, profile); err != nil {
		return err
	}

	// Starter inventory
	_ = s.repo.SaveInventoryItem(ctx, &UserInventoryItem{
		ID:       fmt.Sprintf("inv_%d_1", time.Now().UnixNano()),
		UserID:   userID,
		ItemID:   "food_apple",
		Quantity: 3,
	})
	_ = s.repo.SaveInventoryItem(ctx, &UserInventoryItem{
		ID:       fmt.Sprintf("inv_%d_2", time.Now().UnixNano()),
		UserID:   userID,
		ItemID:   "food_cookie",
		Quantity: 2,
	})

	// Default theme unlocked
	_ = s.repo.AddUnlockedItem(ctx, &UserUnlockedItem{
		ID:       fmt.Sprintf("unl_%d", time.Now().UnixNano()),
		UserID:   userID,
		ItemType: "theme",
		ItemID:   "theme_cozy",
	})

	// Starter daily quests
	quests := []DailyQuest{
		{ID: fmt.Sprintf("q_%d_1", time.Now().UnixNano()), UserID: userID, QuestKey: "quest_focus_1", Title: "Hoan thanh 1 phien tap trung", Target: 1, Current: 0, RewardCoins: 30, RewardExp: 50},
		{ID: fmt.Sprintf("q_%d_2", time.Now().UnixNano()), UserID: userID, QuestKey: "quest_focus_3", Title: "Hoan thanh 3 phien tap trung", Target: 3, Current: 0, RewardCoins: 60, RewardExp: 120},
		{ID: fmt.Sprintf("q_%d_3", time.Now().UnixNano()), UserID: userID, QuestKey: "quest_feed", Title: "Cho thu cung an 2 lan", Target: 2, Current: 0, RewardCoins: 20, RewardExp: 30},
		{ID: fmt.Sprintf("q_%d_4", time.Now().UnixNano()), UserID: userID, QuestKey: "quest_pat", Title: "Vuot ve cung nung thu cung 3 lan", Target: 3, Current: 0, RewardCoins: 20, RewardExp: 30},
	}
	_ = s.repo.CreateDailyQuests(ctx, quests)

	return nil
}

func (s *service) GetProfile(ctx context.Context, userID string) (*FullProfileResponse, error) {
	p, err := s.repo.GetProfile(ctx, userID)
	if err != nil {
		return nil, err
	}
	if p == nil {
		if err := s.CreateStarterProfile(ctx, userID); err != nil {
			return nil, err
		}
		p, _ = s.repo.GetProfile(ctx, userID)
	}

	inv, _ := s.repo.GetInventory(ctx, userID)
	hats, _ := s.repo.GetUnlockedItems(ctx, userID, "hat")
	themes, _ := s.repo.GetUnlockedItems(ctx, userID, "theme")
	quests, _ := s.repo.GetDailyQuests(ctx, userID)

	return &FullProfileResponse{
		UserID:                 p.UserID,
		Coins:                  p.Coins,
		TotalFocusMinutes:      p.TotalFocusMinutes,
		TotalSessionsCompleted: p.TotalSessionsCompleted,
		StreakDays:             p.StreakDays,
		Inventory:              inv,
		UnlockedHats:           hats,
		UnlockedThemes:         themes,
		DailyQuests:            quests,
	}, nil
}

func (s *service) BuyItem(ctx context.Context, userID, itemID string) (*FullProfileResponse, error) {
	item, err := s.repo.FindItemByID(ctx, itemID)
	if err != nil || item == nil {
		return nil, errors.New("vat pham khong ton tai trong cua hang")
	}

	p, err := s.repo.GetProfile(ctx, userID)
	if err != nil || p == nil {
		return nil, errors.New("khong tim thay ho so nguoi dung")
	}

	if p.Coins < item.Price {
		return nil, errors.New("so xu khong du de mua vat pham nay")
	}

	// Check if already unlocked for permanent items
	if item.Category == "hat" || item.Category == "theme" {
		unlocked, _ := s.repo.IsItemUnlocked(ctx, userID, item.Category, itemID)
		if unlocked {
			return nil, errors.New("ban da so huu vat pham nay roi")
		}
	}

	p.Coins -= item.Price
	if err := s.repo.SaveProfile(ctx, p); err != nil {
		return nil, err
	}

	switch item.Category {
	case "food":
		invItem, _ := s.repo.GetInventoryItem(ctx, userID, itemID)
		if invItem == nil {
			invItem = &UserInventoryItem{
				ID:       fmt.Sprintf("inv_%d", time.Now().UnixNano()),
				UserID:   userID,
				ItemID:   itemID,
				Quantity: 1,
			}
		} else {
			invItem.Quantity++
		}
		_ = s.repo.SaveInventoryItem(ctx, invItem)

	case "hat", "theme":
		_ = s.repo.AddUnlockedItem(ctx, &UserUnlockedItem{
			ID:       fmt.Sprintf("unl_%d", time.Now().UnixNano()),
			UserID:   userID,
			ItemType: item.Category,
			ItemID:   itemID,
		})
	}

	return s.GetProfile(ctx, userID)
}

func (s *service) ConsumeFoodItem(ctx context.Context, userID, itemID string) (*ShopItem, error) {
	item, err := s.repo.FindItemByID(ctx, itemID)
	if err != nil || item == nil {
		return nil, errors.New("vat pham khong hop le")
	}

	invItem, err := s.repo.GetInventoryItem(ctx, userID, itemID)
	if err != nil || invItem == nil || invItem.Quantity <= 0 {
		return nil, errors.New("ban khong co vat pham nay trong tui do")
	}

	invItem.Quantity--
	if invItem.Quantity <= 0 {
		_ = s.repo.DeleteInventoryItem(ctx, userID, itemID)
	} else {
		_ = s.repo.SaveInventoryItem(ctx, invItem)
	}

	return item, nil
}

func (s *service) ClaimQuest(ctx context.Context, userID, questID string) (*DailyQuest, int, int, error) {
	quest, err := s.repo.GetDailyQuestByID(ctx, userID, questID)
	if err != nil || quest == nil {
		return nil, 0, 0, errors.New("nhiem vu khong ton tai")
	}

	if quest.IsClaimed {
		return nil, 0, 0, errors.New("phan thuong nhiem vu nay da duoc nhan roi")
	}

	if quest.Current < quest.Target {
		return nil, 0, 0, errors.New("chua hoan thanh muc tieu cua nhiem vu")
	}

	quest.IsClaimed = true
	_ = s.repo.SaveDailyQuest(ctx, quest)

	// Credit reward coins to profile
	p, _ := s.repo.GetProfile(ctx, userID)
	if p != nil {
		p.Coins += quest.RewardCoins
		_ = s.repo.SaveProfile(ctx, p)
	}

	return quest, quest.RewardCoins, quest.RewardExp, nil
}

func (s *service) RecordSessionProgress(ctx context.Context, userID string, durationMins, coinsEarned int) error {
	p, err := s.repo.GetProfile(ctx, userID)
	if err != nil || p == nil {
		return err
	}

	p.TotalFocusMinutes += durationMins
	p.TotalSessionsCompleted++
	p.Coins += coinsEarned

	// Streak calculation
	today := time.Now().Format("2006-01-02")
	yesterday := time.Now().AddDate(0, 0, -1).Format("2006-01-02")
	if p.LastActiveDate == yesterday {
		p.StreakDays++
	} else if p.LastActiveDate != today {
		p.StreakDays = 1
	}
	p.LastActiveDate = today

	_ = s.repo.SaveProfile(ctx, p)

	// Update focus daily quests
	quests, _ := s.repo.GetDailyQuests(ctx, userID)
	for _, q := range quests {
		if q.QuestKey == "quest_focus_1" || q.QuestKey == "quest_focus_3" {
			q.Current++
			_ = s.repo.SaveDailyQuest(ctx, &q)
		}
	}

	return nil
}

func (s *service) RecordPetAction(ctx context.Context, userID, action string) error {
	quests, err := s.repo.GetDailyQuests(ctx, userID)
	if err != nil {
		return err
	}

	for _, q := range quests {
		if action == "feed" && q.QuestKey == "quest_feed" {
			q.Current++
			_ = s.repo.SaveDailyQuest(ctx, &q)
		} else if action == "pat" && q.QuestKey == "quest_pat" {
			q.Current++
			_ = s.repo.SaveDailyQuest(ctx, &q)
		}
	}
	return nil
}
