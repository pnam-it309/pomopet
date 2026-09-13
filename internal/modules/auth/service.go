package auth

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"pomopet/internal/common/eventbus"
	"pomopet/internal/common/jwt"
	"pomopet/internal/common/security"
)

type Service interface {
	Register(ctx context.Context, req RegisterRequest) (*User, string, error)
	Login(ctx context.Context, req LoginRequest) (*User, string, error)
	GetProfile(ctx context.Context, userID string) (*User, error)
}

type service struct {
	repo       Repository
	jwtManager *jwt.JWTManager
	bus        *eventbus.EventBus
}

func NewService(repo Repository, jwtManager *jwt.JWTManager, bus *eventbus.EventBus) Service {
	return &service{
		repo:       repo,
		jwtManager: jwtManager,
		bus:        bus,
	}
}

func (s *service) Register(ctx context.Context, req RegisterRequest) (*User, string, error) {
	username := strings.TrimSpace(req.Username)
	if len(username) < 3 {
		return nil, "", errors.New("ten dang nhap phai co it nhat 3 ky tu")
	}

	existing, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		return nil, "", fmt.Errorf("loi kiem tra ten nguoi dung: %w", err)
	}
	if existing != nil {
		return nil, "", errors.New("ten dang nhap da duoc su dung")
	}

	hash, err := security.HashPassword(req.Password)
	if err != nil {
		return nil, "", err
	}

	displayName := strings.TrimSpace(req.DisplayName)
	if displayName == "" {
		displayName = username
	}

	userID := fmt.Sprintf("usr_%d", time.Now().UnixNano())
	user := &User{
		ID:           userID,
		Username:     username,
		PasswordHash: hash,
		DisplayName:  displayName,
		CreatedAt:    time.Now(),
		LastLoginAt:  time.Now(),
	}

	if err := s.repo.Create(ctx, user); err != nil {
		return nil, "", fmt.Errorf("loi tao tai khoan: %w", err)
	}

	token, err := s.jwtManager.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, "", fmt.Errorf("loi phat hanh token: %w", err)
	}

	// Dispatch domain event (Pet and Shop modules subscribe independently)
	_ = s.bus.Publish(ctx, eventbus.UserRegisteredEvent{
		UserID:         user.ID,
		Username:       user.Username,
		DisplayName:    user.DisplayName,
		InitialSpecies: req.InitialSpecies,
	})

	return user, token, nil
}

func (s *service) Login(ctx context.Context, req LoginRequest) (*User, string, error) {
	username := strings.TrimSpace(req.Username)
	user, err := s.repo.FindByUsername(ctx, username)
	if err != nil {
		return nil, "", fmt.Errorf("loi dang nhap: %w", err)
	}
	if user == nil {
		return nil, "", errors.New("ten dang nhap hoac mat khau khong dung")
	}

	if !security.CheckPassword(req.Password, user.PasswordHash) {
		return nil, "", errors.New("ten dang nhap hoac mat khau khong dung")
	}

	user.LastLoginAt = time.Now()
	_ = s.repo.Update(ctx, user)

	token, err := s.jwtManager.GenerateToken(user.ID, user.Username)
	if err != nil {
		return nil, "", fmt.Errorf("loi phat hanh token: %w", err)
	}

	return user, token, nil
}

func (s *service) GetProfile(ctx context.Context, userID string) (*User, error) {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("khong tim thay nguoi dung")
	}
	return user, nil
}
