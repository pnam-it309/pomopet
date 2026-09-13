package jwt

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

type Claims struct {
	UserID    string `json:"user_id"`
	Username  string `json:"username"`
	ExpiresAt int64  `json:"exp"`
	IssuedAt  int64  `json:"iat"`
}

type JWTManager struct {
	secretKey     []byte
	tokenDuration time.Duration
}

func NewJWTManager(secretKey string, durationHours int) *JWTManager {
	return &JWTManager{
		secretKey:     []byte(secretKey),
		tokenDuration: time.Duration(durationHours) * time.Hour,
	}
}

func (m *JWTManager) GenerateToken(userID, username string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:    userID,
		Username:  username,
		ExpiresAt: now.Add(m.tokenDuration).Unix(),
		IssuedAt:  now.Unix(),
	}

	headerJSON, _ := json.Marshal(map[string]string{"alg": "HS256", "typ": "JWT"})
	claimsJSON, err := json.Marshal(claims)
	if err != nil {
		return "", err
	}

	encodedHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
	encodedClaims := base64.RawURLEncoding.EncodeToString(claimsJSON)
	signingInput := encodedHeader + "." + encodedClaims

	sig := m.sign(signingInput)
	encodedSig := base64.RawURLEncoding.EncodeToString(sig)

	return signingInput + "." + encodedSig, nil
}

func (m *JWTManager) ValidateToken(tokenString string) (*Claims, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, errors.New("dinh dang token khong hop le")
	}

	signingInput := parts[0] + "." + parts[1]
	expectedSig := m.sign(signingInput)
	actualSig, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		return nil, errors.New("chu ky token khong hop le")
	}

	if !hmac.Equal(expectedSig, actualSig) {
		return nil, errors.New("chu ky xac thuc token that bai")
	}

	claimsBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, errors.New("khong the giai ma token claims")
	}

	var claims Claims
	if err := json.Unmarshal(claimsBytes, &claims); err != nil {
		return nil, errors.New("cau truc token claims khong hop le")
	}

	if time.Now().Unix() > claims.ExpiresAt {
		return nil, errors.New("token da het han su dung")
	}

	return &claims, nil
}

func (m *JWTManager) sign(data string) []byte {
	h := hmac.New(sha256.New, m.secretKey)
	h.Write([]byte(data))
	return h.Sum(nil)
}
