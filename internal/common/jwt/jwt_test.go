package jwt

import (
	"testing"
)

func TestJWTGenerationAndValidation(t *testing.T) {
	manager := NewJWTManager("super_secret_test_key_1234567890", 2)
	token, err := manager.GenerateToken("usr_123", "mochi_user")
	if err != nil {
		t.Fatalf("failed to generate token: %v", err)
	}

	claims, err := manager.ValidateToken(token)
	if err != nil {
		t.Fatalf("failed to validate token: %v", err)
	}

	if claims.UserID != "usr_123" || claims.Username != "mochi_user" {
		t.Errorf("token claims do not match: got %v", claims)
	}

	// Tampered token test
	tampered := token + "bad"
	if _, err := manager.ValidateToken(tampered); err == nil {
		t.Errorf("expected error on tampered token, got nil")
	}
}
