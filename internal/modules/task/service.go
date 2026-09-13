package task

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"
)

type Service interface {
	GetTasks(ctx context.Context, userID string) ([]Task, error)
	CreateTask(ctx context.Context, userID string, req CreateTaskRequest) (*Task, error)
	ToggleTask(ctx context.Context, userID, taskID string) (*Task, error)
	DeleteTask(ctx context.Context, userID, taskID string) error
	IncrementPomodoros(ctx context.Context, userID, taskID string) error
}

type service struct {
	repo Repository
}

func NewService(repo Repository) Service {
	return &service{repo: repo}
}

func (s *service) GetTasks(ctx context.Context, userID string) ([]Task, error) {
	return s.repo.FindByUserID(ctx, userID)
}

func (s *service) CreateTask(ctx context.Context, userID string, req CreateTaskRequest) (*Task, error) {
	title := strings.TrimSpace(req.Title)
	if title == "" {
		return nil, errors.New("tieu de nhiem vu khong duoc de trong")
	}

	est := req.EstimatedPomodoros
	if est < 1 {
		est = 1
	}

	tag := strings.TrimSpace(req.Tag)
	if tag == "" {
		tag = "Khac"
	}

	task := &Task{
		ID:                 fmt.Sprintf("task_%d", time.Now().UnixNano()),
		UserID:             userID,
		Title:              title,
		EstimatedPomodoros: est,
		CompletedPomodoros: 0,
		IsCompleted:        false,
		Tag:                tag,
		CreatedAt:          time.Now(),
	}

	if err := s.repo.Create(ctx, task); err != nil {
		return nil, fmt.Errorf("loi tao nhiem vu: %w", err)
	}
	return task, nil
}

func (s *service) ToggleTask(ctx context.Context, userID, taskID string) (*Task, error) {
	task, err := s.repo.FindByID(ctx, userID, taskID)
	if err != nil {
		return nil, err
	}
	if task == nil {
		return nil, errors.New("khong tim thay nhiem vu")
	}

	task.IsCompleted = !task.IsCompleted
	if err := s.repo.Update(ctx, task); err != nil {
		return nil, err
	}
	return task, nil
}

func (s *service) DeleteTask(ctx context.Context, userID, taskID string) error {
	return s.repo.Delete(ctx, userID, taskID)
}

func (s *service) IncrementPomodoros(ctx context.Context, userID, taskID string) error {
	if taskID == "" {
		return nil
	}
	task, err := s.repo.FindByID(ctx, userID, taskID)
	if err != nil || task == nil {
		return err
	}

	task.CompletedPomodoros++
	if task.CompletedPomodoros >= task.EstimatedPomodoros {
		task.IsCompleted = true
	}
	return s.repo.Update(ctx, task)
}
