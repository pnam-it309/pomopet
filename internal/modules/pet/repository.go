package pet

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, pet *Pet) error
	FindByUserID(ctx context.Context, userID string) (*Pet, error)
	Update(ctx context.Context, pet *Pet) error
	DeleteByUserID(ctx context.Context, userID string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, pet *Pet) error {
	return r.db.WithContext(ctx).Create(pet).Error
}

func (r *repository) FindByUserID(ctx context.Context, userID string) (*Pet, error) {
	var pet Pet
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&pet).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &pet, nil
}

func (r *repository) Update(ctx context.Context, pet *Pet) error {
	return r.db.WithContext(ctx).Save(pet).Error
}

func (r *repository) DeleteByUserID(ctx context.Context, userID string) error {
	return r.db.WithContext(ctx).Where("user_id = ?", userID).Delete(&Pet{}).Error
}
