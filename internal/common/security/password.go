package security

import (
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/hex"
	"errors"
	"fmt"
)

const (
	saltLength = 16
	iterations = 5000
)

// HashPassword generates a salted SHA-256 hash
func HashPassword(password string) (string, error) {
	if len(password) < 6 {
		return "", errors.New("mat khau phai co it nhat 6 ky tu")
	}

	saltBytes := make([]byte, saltLength)
	if _, err := rand.Read(saltBytes); err != nil {
		return "", fmt.Errorf("failed to generate random salt: %w", err)
	}
	saltHex := hex.EncodeToString(saltBytes)

	hash := computeIterativeHash([]byte(password), []byte(saltHex))
	return fmt.Sprintf("%s$%s", saltHex, hash), nil
}

// CheckPassword verifies a plaintext password against the stored salted hash
func CheckPassword(password, storedCombined string) bool {
	var saltHex, expectedHash string
	n, err := fmt.Sscanf(storedCombined, "%32s$%64s", &saltHex, &expectedHash)
	if err != nil || n != 2 {
		return false
	}

	computed := computeIterativeHash([]byte(password), []byte(saltHex))
	return subtle.ConstantTimeCompare([]byte(computed), []byte(expectedHash)) == 1
}

func computeIterativeHash(password, salt []byte) string {
	combined := append(password, salt...)
	h := sha256.Sum256(combined)
	for i := 0; i < iterations; i++ {
		h = sha256.Sum256(append(h[:], salt...))
	}
	return hex.EncodeToString(h[:])
}
