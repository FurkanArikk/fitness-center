package service

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/config"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/model"
	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// AuthService handles authentication operations
type AuthService struct {
	config *config.Config
	repos  *repository.Repositories
}

// NewAuthService creates a new authentication service
func NewAuthService(cfg config.Config, repos *repository.Repositories) *AuthService {
	return &AuthService{
		config: &cfg,
		repos:  repos,
	}
}

// Login authenticates user and returns JWT token
func (s *AuthService) Login(username, password string) (*model.LoginResponse, error) {
	ctx := context.Background()

	// First check if it's the default admin user from .env
	if username == s.config.Auth.Username && password == s.config.Auth.Password {
		// Use default admin user
		token, expiresAt, err := s.generateJWT(username, "admin", 0)
		if err != nil {
			return nil, err
		}

		return &model.LoginResponse{
			Token:     token,
			ExpiresAt: expiresAt,
			User: model.User{
				Username: username,
				Role:     "admin",
				FullName: "Default Admin",
			},
		}, nil
	}

	// Check database for user
	user, err := s.repos.User.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, errors.New("geçersiz kullanıcı adı veya şifre")
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("geçersiz kullanıcı adı veya şifre")
	}

	// Update last login
	if err := s.repos.User.UpdateLastLogin(ctx, user.ID); err != nil {
		// Log error but don't fail login
		fmt.Printf("Warning: failed to update last login: %v\n", err)
	}

	// Create JWT token
	token, expiresAt, err := s.generateJWT(user.Username, user.Role, user.ID)
	if err != nil {
		return nil, err
	}

	// Create session record
	tokenHash := s.hashToken(token)
	session := &model.UserSession{
		UserID:    user.ID,
		TokenHash: tokenHash,
		ExpiresAt: expiresAt,
	}

	if err := s.repos.Session.CreateSession(ctx, session); err != nil {
		// Log error but don't fail login
		fmt.Printf("Warning: failed to create session: %v\n", err)
	}

	return &model.LoginResponse{
		Token:     token,
		ExpiresAt: expiresAt,
		User:      *user,
	}, nil
}

// ValidateToken validates JWT token and returns user info
func (s *AuthService) ValidateToken(tokenString string) (*model.ValidateTokenResponse, error) {
	claims, err := s.parseJWT(tokenString)
	// If it's user ID 0, it's the default admin
	if claims.UserID == 0 {
		return &model.ValidateTokenResponse{
			Valid: true,
			User: model.User{
				ID:       0,
				Username: claims.Username,
				Role:     claims.Role,
				FullName: "Default Admin",
			},
		}, nil
	}

	// Check session in database
	ctx := context.Background()
	tokenHash := s.hashToken(tokenString)

	_, err = s.repos.Session.GetSessionByTokenHash(ctx, tokenHash)
	if err != nil {
		return &model.ValidateTokenResponse{Valid: false}, nil
	}

	// Get user from database
	user, err := s.repos.User.GetUserByID(ctx, claims.UserID)
	if err != nil {
		return &model.ValidateTokenResponse{Valid: false}, nil
	}

	return &model.ValidateTokenResponse{
		Valid: true,
		User:  *user,
	}, nil
}

// CreateUser creates a new user (admin function)
func (s *AuthService) CreateUser(username, password, role, email, fullName string) (*model.User, error) {
	ctx := context.Background()

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %v", err)
	}

	user := &model.User{
		Username:     username,
		PasswordHash: string(hashedPassword),
		Role:         role,
		Email:        email,
		FullName:     fullName,
		IsActive:     true,
	}

	if err := s.repos.User.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

// Register creates a new user with user count validation
func (s *AuthService) Register(req model.RegisterRequest) (*model.RegisterResponse, error) {
	ctx := context.Background()

	// Check if username already exists
	_, err := s.repos.User.GetUserByUsername(ctx, req.Username)
	if err == nil {
		return &model.RegisterResponse{
			Success: false,
			Message: "Kullanıcı adı zaten kullanımda",
		}, nil
	}

	// Force role to be "admin" for all registrations
	role := "admin"

	// Check admin user count limit (max 3 admins)
	currentAdminCount, err := s.repos.User.GetUserCountByRole(ctx, "admin")
	if err != nil {
		return nil, fmt.Errorf("failed to get admin user count: %v", err)
	}

	if currentAdminCount >= 3 {
		return &model.RegisterResponse{
			Success: false,
			Message: "Maksimum admin kullanıcı sayısına ulaşıldı (3/3). Yeni admin kullanıcı kaydı yapılamaz.",
		}, nil
	}

	// Combine firstName and lastName to create full_name
	fullName := req.FirstName + " " + req.LastName

	// Create the user
	user, err := s.CreateUser(req.Username, req.Password, role, req.Email, fullName)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %v", err)
	}

	// Remove password hash from response
	user.PasswordHash = ""

	return &model.RegisterResponse{
		Success: true,
		Message: "Admin kullanıcısı başarıyla oluşturuldu",
		User:    *user,
	}, nil
}

// GetUserStats returns current user statistics including count and limit
func (s *AuthService) GetUserStats() (map[string]interface{}, error) {
	ctx := context.Background()

	// Get current user count
	currentUserCount, err := s.repos.User.GetUserCount(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get current user count: %v", err)
	}

	// Get maximum user limit from config
	maxUsersStr, err := s.repos.Config.GetConfigValue(ctx, "max_users")
	if err != nil {
		return nil, fmt.Errorf("failed to get max users config: %v", err)
	}

	maxUsers := 50 // default value
	if maxUsersInt, parseErr := fmt.Sscanf(maxUsersStr, "%d", &maxUsers); parseErr != nil || maxUsersInt != 1 {
		maxUsers = 50
	}

	return map[string]interface{}{
		"current_users": currentUserCount,
		"max_users":     maxUsers,
		"available":     maxUsers - currentUserCount,
		"usage_percent": float64(currentUserCount) / float64(maxUsers) * 100,
	}, nil
}

// UpdateMaxUsers updates the maximum user limit (admin only)
func (s *AuthService) UpdateMaxUsers(newLimit int) error {
	if newLimit < 1 {
		return errors.New("maksimum kullanıcı sayısı 1'den küçük olamaz")
	}

	ctx := context.Background()

	// Check current user count
	currentUserCount, err := s.repos.User.GetUserCount(ctx)
	if err != nil {
		return fmt.Errorf("failed to get current user count: %v", err)
	}

	// Don't allow setting limit below current user count
	if newLimit < currentUserCount {
		return fmt.Errorf("maksimum kullanıcı sayısı mevcut kullanıcı sayısından (%d) küçük olamaz", currentUserCount)
	}

	// Update the configuration
	err = s.repos.Config.UpdateConfigValue(ctx, "max_users", fmt.Sprintf("%d", newLimit))
	if err != nil {
		return fmt.Errorf("failed to update max users config: %v", err)
	}

	return nil
}

// InitializeDefaultUsers - Sample data loading removed, users must be created manually via API
func (s *AuthService) InitializeDefaultUsers() error {
	// No default users are created anymore
	// All admin users must be created manually via registration API
	fmt.Println("No default users created. Use the registration API to create admin users.")
	return nil
}

// generateJWT creates a new JWT token
func (s *AuthService) generateJWT(username, role string, userID int) (string, time.Time, error) {
	expiresAt := time.Now().Add(s.config.Auth.JWTExpiration)

	claims := jwt.MapClaims{
		"username": username,
		"role":     role,
		"user_id":  userID,
		"iat":      time.Now().Unix(),
		"exp":      expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.config.Auth.JWTSecret))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

// parseJWT parses and validates JWT token
func (s *AuthService) parseJWT(tokenString string) (*model.TokenClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("geçersiz token imzalama yöntemi")
		}
		return []byte(s.config.Auth.JWTSecret), nil
	})

	if err != nil || !token.Valid {
		return nil, errors.New("geçersiz token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("token claims ayrıştırılamadı")
	}

	userID := 0
	if uid, ok := claims["user_id"].(float64); ok {
		userID = int(uid)
	}

	return &model.TokenClaims{
		Username:  claims["username"].(string),
		Role:      claims["role"].(string),
		UserID:    userID,
		IssuedAt:  int64(claims["iat"].(float64)),
		ExpiresAt: int64(claims["exp"].(float64)),
	}, nil
}

// hashToken creates a hash of the token for storage
func (s *AuthService) hashToken(token string) string {
	hash := sha256.Sum256([]byte(token))
	return hex.EncodeToString(hash[:])
}
