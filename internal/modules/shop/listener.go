package shop

import (
	"context"

	"pomopet/internal/common/eventbus"
)

// RegisterListeners registers event handlers for Shop module
func RegisterListeners(bus *eventbus.EventBus, shopSvc Service) {
	// 1. Create starter profile, coins, items when user registers
	bus.Subscribe(eventbus.EventUserRegistered, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.UserRegisteredEvent)
		if !ok {
			return nil
		}
		return shopSvc.CreateStarterProfile(ctx, evt.UserID)
	})

	// 2. Grant coins, record streak, update daily quest when Pomodoro completes
	bus.Subscribe(eventbus.EventPomodoroCompleted, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.PomodoroCompletedEvent)
		if !ok {
			return nil
		}
		return shopSvc.RecordSessionProgress(ctx, evt.UserID, evt.DurationMinutes, evt.CoinsEarned)
	})

	// 3. Update quest when pet is patted or fed, and consume item
	bus.Subscribe(eventbus.EventPetInteracted, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.PetInteractedEvent)
		if !ok {
			return nil
		}
		if evt.Action == "feed" && evt.FoodItemID != "" {
			_, _ = shopSvc.ConsumeFoodItem(ctx, evt.UserID, evt.FoodItemID)
		}
		return shopSvc.RecordPetAction(ctx, evt.UserID, evt.Action)
	})
}
