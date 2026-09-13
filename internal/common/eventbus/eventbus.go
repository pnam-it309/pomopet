package eventbus

import (
	"context"
	"sync"
)

// Event is the generic interface for domain events
type Event interface {
	EventName() string
}

// EventHandler is the callback signature for event listeners
type EventHandler func(ctx context.Context, event Event) error

// EventBus provides decoupled in-memory pub-sub messaging
type EventBus struct {
	mu        sync.RWMutex
	listeners map[string][]EventHandler
}

var (
	defaultBus *EventBus
	once       sync.Once
)

// GetBus returns the singleton event bus
func GetBus() *EventBus {
	once.Do(func() {
		defaultBus = &EventBus{
			listeners: make(map[string][]EventHandler),
		}
	})
	return defaultBus
}

// Subscribe registers a handler for a given event name
func (b *EventBus) Subscribe(eventName string, handler EventHandler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.listeners[eventName] = append(b.listeners[eventName], handler)
}

// Publish dispatches an event to all registered listeners
func (b *EventBus) Publish(ctx context.Context, event Event) error {
	b.mu.RLock()
	handlers, exists := b.listeners[event.EventName()]
	b.mu.RUnlock()

	if !exists {
		return nil
	}

	for _, handler := range handlers {
		if err := handler(ctx, event); err != nil {
			// Log error but continue executing remaining listeners
			continue
		}
	}
	return nil
}

// =========================================================================
// Domain Event Definitions
// =========================================================================

// EventNames
const (
	EventPomodoroCompleted = "pomodoro.completed"
	EventUserRegistered    = "user.registered"
	EventPetInteracted     = "pet.interacted"
)

// PomodoroCompletedEvent is dispatched when a focus or break session finishes
type PomodoroCompletedEvent struct {
	UserID          string
	Mode            string
	DurationMinutes int
	ActiveTaskID    string
	ExpEarned       int
	CoinsEarned     int
}

func (e PomodoroCompletedEvent) EventName() string {
	return EventPomodoroCompleted
}

// UserRegisteredEvent is dispatched when a new account is created
type UserRegisteredEvent struct {
	UserID         string
	Username       string
	DisplayName    string
	InitialSpecies string
}

func (e UserRegisteredEvent) EventName() string {
	return EventUserRegistered
}

// PetInteractedEvent is dispatched when user feeds or pats pet
type PetInteractedEvent struct {
	UserID         string
	Action         string // "feed" | "pat"
	FoodItemID     string
	HappinessDelta int
	HungerDelta    int
}

func (e PetInteractedEvent) EventName() string {
	return EventPetInteracted
}
