package service

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication operations
type AuthService struct {
	jwtSecret      []byte
	jwtExpireHours int
	adminUsername  string
	adminPassword  string
}

// Claims represents JWT claims
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// NewAuthService creates a new auth service instance
func NewAuthService(jwtSecret string, jwtExpireHours int, adminUsername, adminPassword string) *AuthService {
	return &AuthService{
		jwtSecret:      []byte(jwtSecret),
		jwtExpireHours: jwtExpireHours,
		adminUsername:  adminUsername,
		adminPassword:  adminPassword,
	}
}

// Login validates user credentials and generates JWT token
func (s *AuthService) Login(username, password string) (string, error) {
	// Check only admin user
	if username != s.adminUsername || password != s.adminPassword {
		return "", fmt.Errorf("invalid username or password")
	}

	// Create JWT token
	claims := Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.jwtExpireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "fitness-center-auth",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", fmt.Errorf("error creating token: %v", err)
	}

	return tokenString, nil
}

// ValidateToken validates JWT token
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

// HashPassword hashes password
func (s *AuthService) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

// CheckPasswordHash compares password with hash
func (s *AuthService) CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}
