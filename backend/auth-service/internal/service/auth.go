package service

import (
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication operations
type AuthService struct {
	jwtSecret      []byte
	jwtExpireHours int
	adminRepo      *repository.AdminRepository
}

// Claims represents JWT claims
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// NewAuthService creates a new auth service instance
func NewAuthService(jwtSecret string, jwtExpireHours int, adminRepo *repository.AdminRepository) *AuthService {
	return &AuthService{
		jwtSecret:      []byte(jwtSecret),
		jwtExpireHours: jwtExpireHours,
		adminRepo:      adminRepo,
	}
}

// Login validates user credentials and generates JWT token
func (s *AuthService) Login(username, password string) (string, error) {
	// Get admin user from database
	admin, err := s.adminRepo.GetByUsername(username)
	if err != nil {
		return "", fmt.Errorf("invalid username or password")
	}

	// Check password
	if !s.CheckPasswordHash(password, admin.Password) {
		return "", fmt.Errorf("invalid username or password")
	}

	// Update last login
	err = s.adminRepo.UpdateLastLogin(admin.ID)
	if err != nil {
		// Log error but don't fail login
		fmt.Printf("Warning: Failed to update last login for user %s: %v\n", username, err)
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

// CreateInitialAdmin creates the initial admin user if it doesn't exist
func (s *AuthService) CreateInitialAdmin(username, password, email string) error {
	// Check if admin already exists
	_, err := s.adminRepo.GetByUsername(username)
	if err == nil {
		// Admin already exists
		return nil
	}

	// Hash password
	hashedPassword, err := s.HashPassword(password)
	if err != nil {
		return fmt.Errorf("error hashing password: %v", err)
	}

	// Create admin model
	admin := &model.Admin{
		Username:  username,
		Password:  hashedPassword,
		Email:     email,
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Create admin
	err = s.adminRepo.Create(admin)
	if err != nil {
		return fmt.Errorf("error creating admin: %v", err)
	}

	fmt.Printf("Initial admin user created: %s\n", username)
	return nil
}

// UpdatePassword updates admin password
func (s *AuthService) UpdatePassword(username, currentPassword, newPassword string) error {
	// Get admin user from database
	admin, err := s.adminRepo.GetByUsername(username)
	if err != nil {
		return fmt.Errorf("invalid username")
	}

	// Check current password
	if !s.CheckPasswordHash(currentPassword, admin.Password) {
		return fmt.Errorf("current password is incorrect")
	}

	// Hash new password
	hashedPassword, err := s.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("error hashing new password: %v", err)
	}

	// Update password
	admin.Password = hashedPassword
	admin.UpdatedAt = time.Now()

	err = s.adminRepo.Update(admin)
	if err != nil {
		return fmt.Errorf("error updating password: %v", err)
	}

	fmt.Printf("Password updated for user: %s\n", username)
	return nil
}

// ListAdmins returns all active admin users
func (s *AuthService) ListAdmins() ([]model.Admin, error) {
	return s.adminRepo.List()
}

// DeactivateAdmin deactivates an admin user
func (s *AuthService) DeactivateAdmin(username string) error {
	admin, err := s.adminRepo.GetByUsername(username)
	if err != nil {
		return fmt.Errorf("admin not found")
	}

	admin.IsActive = false
	admin.UpdatedAt = time.Now()

	err = s.adminRepo.Update(admin)
	if err != nil {
		return fmt.Errorf("error deactivating admin: %v", err)
	}

	fmt.Printf("Admin deactivated: %s\n", username)
	return nil
}
