package eventbus

import (
	"context"
	"testing"
)

func TestEventBusPubSub(t *testing.T) {
	bus := GetBus()
	received := false

	bus.Subscribe("test.event", func(ctx context.Context, e Event) error {
		received = true
		return nil
	})

	err := bus.Publish(context.Background(), mockEvent{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !received {
		t.Errorf("expected event to be received by subscriber")
	}
}

type mockEvent struct{}

func (mockEvent) EventName() string {
	return "test.event"
}
