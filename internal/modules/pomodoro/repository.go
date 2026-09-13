package pomodoro

import (
	"context"
	"errors"

	"gorm.io/gorm"
)

type Repository interface {
	GetSettings(ctx context.Context, userID string) (*PomodoroSetting, error)
	SaveSettings(ctx context.Context, s *PomodoroSetting) error
	CreateSession(ctx context.Context, session *PomodoroSession) error
	GetHistory(ctx context.Context, userID string, limit int) ([]PomodoroSession, error)
	CountCompletedSessions(ctx context.Context, userID string) (int64, error)
}

type repository struct {
	db *gorm.DB
}

func NewRepository(db *gorm.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetSettings(ctx context.Context, userID string) (*PomodoroSetting, error) {
	var s PomodoroSetting
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).First(&s).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &s, nil
}

func (r *repository) SaveSettings(ctx context.Context, s *PomodoroSetting) error {
	return r.db.WithContext(ctx).Save(s).Error
}

func (r *repository) CreateSession(ctx context.Context, session *PomodoroSession) error {
	return r.db.WithContext(ctx).Create(session).Error
}

func (r *repository) GetHistory(ctx context.Context, userID string, limit int) ([]PomodoroSession, error) {
	var sessions []PomodoroSession
	if limit <= 0 {
		limit = 20
	}
	err := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("completed_at DESC").
		Limit(limit).
		Find(&sessions).Error
	return sessions, err
}

func (r *repository) CountCompletedSessions(ctx context.Context, userID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&PomodoroSession{}).
		Where("user_id = ? AND mode = ?", userID, ModeFocus).
		Count(&count).Error
	return count, err
}
