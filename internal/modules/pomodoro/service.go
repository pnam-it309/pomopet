package pomodoro

import (
	"context"
	"fmt"
	"time"

	"pomopet/internal/common/config"
	"pomopet/internal/common/eventbus"
)

type Service interface {
	GetSettings(ctx context.Context, userID string) (*PomodoroSetting, error)
	UpdateSettings(ctx context.Context, userID string, req UpdateSettingsRequest) (*PomodoroSetting, error)
	StartSession(ctx context.Context, userID string, req StartRequest) (*PomodoroSetting, error)
	PauseSession(ctx context.Context, userID string, req PauseRequest) (*PomodoroSetting, error)
	CompleteSession(ctx context.Context, userID string) (*CompleteResult, error)
	AbortSession(ctx context.Context, userID string) (*PomodoroSetting, error)
	GetHistory(ctx context.Context, userID string, limit int) ([]PomodoroSession, error)
}

type service struct {
	repo Repository
	cfg  *config.Config
	bus  *eventbus.EventBus
}

func NewService(repo Repository, cfg *config.Config, bus *eventbus.EventBus) Service {
	return &service{
		repo: repo,
		cfg:  cfg,
		bus:  bus,
	}
}

func (s *service) GetSettings(ctx context.Context, userID string) (*PomodoroSetting, error) {
	setting, err := s.repo.GetSettings(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("loi lay cai dat pomodoro: %w", err)
	}
	if setting == nil {
		setting = &PomodoroSetting{
			UserID:            userID,
			FocusMinutes:      s.cfg.PomoFocusMins,
			ShortBreakMinutes: s.cfg.PomoShortBreakMins,
			LongBreakMinutes:  s.cfg.PomoLongBreakMins,
			LongBreakInterval: s.cfg.PomoLongBreakInterval,
			CurrentCycle:      1,
			Mode:              ModeFocus,
			ActiveTaskID:      "",
			IsPaused:          false,
			RemainingSeconds:  s.cfg.PomoFocusMins * 60,
		}
		if err := s.repo.SaveSettings(ctx, setting); err != nil {
			return nil, err
		}
	}
	return setting, nil
}

func (s *service) UpdateSettings(ctx context.Context, userID string, req UpdateSettingsRequest) (*PomodoroSetting, error) {
	setting, err := s.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}

	if req.FocusMinutes > 0 {
		setting.FocusMinutes = req.FocusMinutes
	}
	if req.ShortBreakMinutes > 0 {
		setting.ShortBreakMinutes = req.ShortBreakMinutes
	}
	if req.LongBreakMinutes > 0 {
		setting.LongBreakMinutes = req.LongBreakMinutes
	}
	if req.LongBreakInterval > 0 {
		setting.LongBreakInterval = req.LongBreakInterval
	}

	if err := s.repo.SaveSettings(ctx, setting); err != nil {
		return nil, err
	}
	return setting, nil
}

func (s *service) StartSession(ctx context.Context, userID string, req StartRequest) (*PomodoroSetting, error) {
	setting, err := s.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}

	if req.Mode != "" {
		setting.Mode = req.Mode
	}
	setting.ActiveTaskID = req.ActiveTaskID
	setting.IsPaused = false

	var totalSec int
	switch setting.Mode {
	case ModeShortBreak:
		totalSec = setting.ShortBreakMinutes * 60
	case ModeLongBreak:
		totalSec = setting.LongBreakMinutes * 60
	default:
		totalSec = setting.FocusMinutes * 60
	}
	setting.RemainingSeconds = totalSec

	if err := s.repo.SaveSettings(ctx, setting); err != nil {
		return nil, err
	}
	return setting, nil
}

func (s *service) PauseSession(ctx context.Context, userID string, req PauseRequest) (*PomodoroSetting, error) {
	setting, err := s.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}
	setting.IsPaused = req.IsPaused
	setting.RemainingSeconds = req.RemainingSeconds
	if err := s.repo.SaveSettings(ctx, setting); err != nil {
		return nil, err
	}
	return setting, nil
}

func (s *service) CompleteSession(ctx context.Context, userID string) (*CompleteResult, error) {
	setting, err := s.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}

	var durationMins int
	var expEarned int
	var coinsEarned int

	if setting.Mode == ModeFocus {
		durationMins = setting.FocusMinutes
		expEarned = s.cfg.PomoBaseExpSession
		coinsEarned = s.cfg.PomoBaseCoinsSession
		setting.CurrentCycle++
	} else if setting.Mode == ModeShortBreak {
		durationMins = setting.ShortBreakMinutes
	} else {
		durationMins = setting.LongBreakMinutes
	}

	// Record session
	session := &PomodoroSession{
		ID:              fmt.Sprintf("sess_%d", time.Now().UnixNano()),
		UserID:          userID,
		TaskID:          setting.ActiveTaskID,
		Mode:            setting.Mode,
		DurationMinutes: durationMins,
		ExpEarned:       expEarned,
		CoinsEarned:     coinsEarned,
		CompletedAt:     time.Now(),
	}
	_ = s.repo.CreateSession(ctx, session)

	// Determine next mode
	if setting.Mode == ModeFocus {
		if setting.CurrentCycle%setting.LongBreakInterval == 0 {
			setting.Mode = ModeLongBreak
			setting.RemainingSeconds = setting.LongBreakMinutes * 60
		} else {
			setting.Mode = ModeShortBreak
			setting.RemainingSeconds = setting.ShortBreakMinutes * 60
		}
	} else {
		setting.Mode = ModeFocus
		setting.RemainingSeconds = setting.FocusMinutes * 60
	}
	setting.IsPaused = false
	_ = s.repo.SaveSettings(ctx, setting)

	// Publish domain event via EventBus (Pet, Shop, Task listeners handle their domains)
	_ = s.bus.Publish(ctx, eventbus.PomodoroCompletedEvent{
		UserID:          userID,
		Mode:            string(session.Mode),
		DurationMinutes: durationMins,
		ActiveTaskID:    session.TaskID,
		ExpEarned:       expEarned,
		CoinsEarned:     coinsEarned,
	})

	return &CompleteResult{
		Mode:            session.Mode,
		DurationMinutes: durationMins,
		ExpEarned:       expEarned,
		CoinsEarned:     coinsEarned,
		Settings:        setting,
	}, nil
}

func (s *service) AbortSession(ctx context.Context, userID string) (*PomodoroSetting, error) {
	setting, err := s.GetSettings(ctx, userID)
	if err != nil {
		return nil, err
	}
	setting.IsPaused = false
	if setting.Mode == ModeFocus {
		setting.RemainingSeconds = setting.FocusMinutes * 60
	} else if setting.Mode == ModeShortBreak {
		setting.RemainingSeconds = setting.ShortBreakMinutes * 60
	} else {
		setting.RemainingSeconds = setting.LongBreakMinutes * 60
	}
	_ = s.repo.SaveSettings(ctx, setting)
	return setting, nil
}

func (s *service) GetHistory(ctx context.Context, userID string, limit int) ([]PomodoroSession, error) {
	return s.repo.GetHistory(ctx, userID, limit)
}
