package task

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	Create(ctx context.Context, task *Task) error
	FindByUserID(ctx context.Context, userID string) ([]Task, error)
	FindByID(ctx context.Context, userID, taskID string) (*Task, error)
	Update(ctx context.Context, task *Task) error
	Delete(ctx context.Context, userID, taskID string) error
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, task *Task) error {
	return r.db.WithContext(ctx).Create(task).Error
}

func (r *repository) FindByUserID(ctx context.Context, userID string) ([]Task, error) {
	var tasks []Task
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&tasks).Error
	return tasks, err
}

func (r *repository) FindByID(ctx context.Context, userID, taskID string) (*Task, error) {
	var t Task
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND id = ?", userID, taskID).
		First(&t).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &t, nil
}

func (r *repository) Update(ctx context.Context, task *Task) error {
	return r.db.WithContext(ctx).Save(task).Error
}

func (r *repository) Delete(ctx context.Context, userID, taskID string) error {
	return r.db.WithContext(ctx).
		Where("user_id = ? AND id = ?", userID, taskID).
		Delete(&Task{}).Error
}
