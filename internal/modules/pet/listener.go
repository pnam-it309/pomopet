package pet

import (
	"context"
	"log"

	"pomopet/internal/common/eventbus"
)

// RegisterListeners registers event handlers for Pet module
func RegisterListeners(bus *eventbus.EventBus, petSvc Service) {
	// 1. Auto-create starter pet when a new user registers
	bus.Subscribe(eventbus.EventUserRegistered, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.UserRegisteredEvent)
		if !ok {
			return nil
		}
		species := Species(evt.InitialSpecies)
		if species == "" {
			species = SpeciesCat
		}
		behavior := NewSpeciesBehavior(species)
		_, err := petSvc.CreateStarterPet(ctx, evt.UserID, behavior.DefaultName(), species)
		if err != nil {
			log.Printf("[ERROR] Failed to auto-create pet for user %s: %v", evt.UserID, err)
			return err
		}
		return nil
	})

	// 2. Grant EXP and vitality boost when Pomodoro completes
	bus.Subscribe(eventbus.EventPomodoroCompleted, func(ctx context.Context, e eventbus.Event) error {
		evt, ok := e.(eventbus.PomodoroCompletedEvent)
		if !ok {
			return nil
		}
		if evt.ExpEarned > 0 {
			_, _, err := petSvc.AddExp(ctx, evt.UserID, evt.ExpEarned)
			if err != nil {
				log.Printf("[ERROR] Failed to grant exp to pet for user %s: %v", evt.UserID, err)
				return err
			}
		}
		return nil
	})
}
