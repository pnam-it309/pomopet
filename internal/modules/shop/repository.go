package shop

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	GetCatalog(ctx context.Context) ([]ShopItem, error)
	FindItemByID(ctx context.Context, itemID string) (*ShopItem, error)
	SeedCatalog(ctx context.Context, items []ShopItem) error

	GetProfile(ctx context.Context, userID string) (*UserProfile, error)
	SaveProfile(ctx context.Context, profile *UserProfile) error

	GetInventory(ctx context.Context, userID string) ([]UserInventoryItem, error)
	GetInventoryItem(ctx context.Context, userID, itemID string) (*UserInventoryItem, error)
	SaveInventoryItem(ctx context.Context, item *UserInventoryItem) error
	DeleteInventoryItem(ctx context.Context, userID, itemID string) error

	GetUnlockedItems(ctx context.Context, userID, itemType string) ([]string, error)
	AddUnlockedItem(ctx context.Context, item *UserUnlockedItem) error
	IsItemUnlocked(ctx context.Context, userID, itemType, itemID string) (bool, error)

	GetDailyQuests(ctx context.Context, userID string) ([]DailyQuest, error)
	GetDailyQuestByID(ctx context.Context, userID, questID string) (*DailyQuest, error)
	SaveDailyQuest(ctx context.Context, quest *DailyQuest) error
	CreateDailyQuests(ctx context.Context, quests []DailyQuest) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetCatalog(ctx context.Context) ([]ShopItem, error) {
	var items []ShopItem
	err := r.db.WithContext(ctx).Find(&items).Error
	return items, err
}

func (r *repository) FindItemByID(ctx context.Context, itemID string) (*ShopItem, error) {
	var item ShopItem
	err := r.db.WithContext(ctx).Where("id = ?", itemID).First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *repository) SeedCatalog(ctx context.Context, items []ShopItem) error {
	var count int64
	r.db.WithContext(ctx).Model(&ShopItem{}).Count(&count)
	if count == 0 {
		return r.db.WithContext(ctx).Create(&items).Error
	}
	return nil
}

func (r *repository) GetProfile(ctx context.Context, userID string) (*UserProfile, error) {
	var p UserProfile
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&p).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) SaveProfile(ctx context.Context, profile *UserProfile) error {
	return r.db.WithContext(ctx).Save(profile).Error
}

func (r *repository) GetInventory(ctx context.Context, userID string) ([]UserInventoryItem, error) {
	var items []UserInventoryItem
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&items).Error
	return items, err
}

func (r *repository) GetInventoryItem(ctx context.Context, userID, itemID string) (*UserInventoryItem, error) {
	var item UserInventoryItem
	err := r.db.WithContext(ctx).Where("user_id = ? AND item_id = ?", userID, itemID).First(&item).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &item, nil
}

func (r *repository) SaveInventoryItem(ctx context.Context, item *UserInventoryItem) error {
	return r.db.WithContext(ctx).Save(item).Error
}

func (r *repository) DeleteInventoryItem(ctx context.Context, userID, itemID string) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND item_id = ?", userID, itemID).
		Delete(&UserInventoryItem{}).Error
}

func (r *repository) GetUnlockedItems(ctx context.Context, userID, itemType string) ([]string, error) {
	var items []UserUnlockedItem
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND item_type = ?", userID, itemType).
		Find(&items).Error
	if err != nil {
		return nil, err
	}
	res := make([]string, len(items))
	for i, it := range items {
		res[i] = it.ItemID
	}
	return res, nil
}

func (r *repository) AddUnlockedItem(ctx context.Context, item *UserUnlockedItem) error {
	return r.db.WithContext(ctx).Create(item).Error
}

func (r *repository) IsItemUnlocked(ctx context.Context, userID, itemType, itemID string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&UserUnlockedItem{}).
		Where("user_id = ? AND item_type = ? AND item_id = ?", userID, itemType, itemID).
		Count(&count).Error
	return count > 0, err
}

func (r *repository) GetDailyQuests(ctx context.Context, userID string) ([]DailyQuest, error) {
	var quests []DailyQuest
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&quests).Error
	return quests, err
}

func (r *repository) GetDailyQuestByID(ctx context.Context, userID, questID string) (*DailyQuest, error) {
	var q DailyQuest
	err := r.db.WithContext(ctx).Where("user_id = ? AND id = ?", userID, questID).First(&q).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &q, nil
}

func (r *repository) SaveDailyQuest(ctx context.Context, quest *DailyQuest) error {
	return r.db.WithContext(ctx).Save(quest).Error
}

func (r *repository) CreateDailyQuests(ctx context.Context, quests []DailyQuest) error {
	return r.db.WithContext(ctx).Create(&quests).Error
}
