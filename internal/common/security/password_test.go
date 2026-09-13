package security

import (
	"testing"
)

func TestPasswordHashingAndCheck(t *testing.T) {
	password := "Secret123"
	hash, err := HashPassword(password)
	if err != nil {
		t.Fatalf("failed to hash password: %v", err)
	}

	if !CheckPassword(password, hash) {
		t.Errorf("expected valid password to match hash")
	}

	if CheckPassword("WrongPass", hash) {
		t.Errorf("expected wrong password to fail matching")
	}
}
