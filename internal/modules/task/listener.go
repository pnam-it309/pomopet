package task

import (
	"context"

	"pomopet/internal/common/eventbus"
)

// RegisterListeners registers event handlers for Task module
func RegisterListeners(bus *eventbus.EventBus, taskSvc Service) {
	// 1. Create a starter task when user registers
	bus.Subscribe(eventbus.EventUserRegistered, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.UserRegisteredEvent)
		if !ok {
			return nil
		}
		_, _ = taskSvc.CreateTask(ctx, evt.UserID, CreateTaskRequest{
			Title:              "Lam quen voi ung dung PomoPet Mobile",
			EstimatedPomodoros: 1,
			Tag:                "Khoi dong",
		})
		return nil
	})

	// 2. Increment pomodoros when a Pomodoro session finishes
	bus.Subscribe(eventbus.EventPomodoroCompleted, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.PomodoroCompletedEvent)
		if !ok || evt.ActiveTaskID == "" {
			return nil
		}
		return taskSvc.IncrementPomodoros(ctx, evt.UserID, evt.ActiveTaskID)
	})
}
