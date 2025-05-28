package repository

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/FurkanArikk/fitness-center/backend/auth-service/internal/model"
)

// UserRepository defines the interface for user data access
type UserRepository interface {
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByUsername(ctx context.Context, username string) (*model.User, error)
	GetUserByID(ctx context.Context, id int) (*model.User, error)
	GetUserCount(ctx context.Context) (int, error)
	GetUserCountByRole(ctx context.Context, role string) (int, error)
	UpdateUser(ctx context.Context, user *model.User) error
	UpdateLastLogin(ctx context.Context, userID int) error
}

// SessionRepository defines the interface for session data access
type SessionRepository interface {
	CreateSession(ctx context.Context, session *model.UserSession) error
	GetSessionByTokenHash(ctx context.Context, tokenHash string) (*model.UserSession, error)
	RevokeSession(ctx context.Context, tokenHash string) error
	CleanupExpiredSessions(ctx context.Context) error
}

// ConfigRepository defines the interface for system configuration data access
type ConfigRepository interface {
	GetConfigValue(ctx context.Context, key string) (string, error)
	UpdateConfigValue(ctx context.Context, key, value string) error
}

// Repositories holds all repository interfaces
type Repositories struct {
	User    UserRepository
	Session SessionRepository
	Config  ConfigRepository
}

// userRepository implements UserRepository
type userRepository struct {
	db *sql.DB
}

// sessionRepository implements SessionRepository
type sessionRepository struct {
	db *sql.DB
}

// configRepository implements ConfigRepository
type configRepository struct {
	db *sql.DB
}

// NewRepositories creates new repositories
func NewRepositories(db *sql.DB) *Repositories {
	return &Repositories{
		User:    &userRepository{db: db},
		Session: &sessionRepository{db: db},
		Config:  &configRepository{db: db},
	}
}

// CreateUser creates a new user
func (r *userRepository) CreateUser(ctx context.Context, user *model.User) error {
	query := `
		INSERT INTO users (username, password_hash, role, email, full_name, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, created_at, updated_at`

	err := r.db.QueryRowContext(ctx, query,
		user.Username, user.PasswordHash, user.Role, user.Email, user.FullName, user.IsActive,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to create user: %v", err)
	}

	return nil
}

// GetUserByUsername retrieves a user by username
func (r *userRepository) GetUserByUsername(ctx context.Context, username string) (*model.User, error) {
	user := &model.User{}
	query := `
		SELECT id, username, password_hash, role, email, full_name, is_active,
			   created_at, updated_at, last_login_at
		FROM users
		WHERE username = $1 AND is_active = true`

	err := r.db.QueryRowContext(ctx, query, username).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Role,
		&user.Email, &user.FullName, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (r *userRepository) GetUserByID(ctx context.Context, id int) (*model.User, error) {
	user := &model.User{}
	query := `
		SELECT id, username, password_hash, role, email, full_name, is_active,
			   created_at, updated_at, last_login_at
		FROM users
		WHERE id = $1 AND is_active = true`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&user.ID, &user.Username, &user.PasswordHash, &user.Role,
		&user.Email, &user.FullName, &user.IsActive,
		&user.CreatedAt, &user.UpdatedAt, &user.LastLoginAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %v", err)
	}

	return user, nil
}

// UpdateUser updates a user
func (r *userRepository) UpdateUser(ctx context.Context, user *model.User) error {
	query := `
		UPDATE users
		SET password_hash = $2, role = $3, email = $4, full_name = $5,
			is_active = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1`

	_, err := r.db.ExecContext(ctx, query,
		user.ID, user.PasswordHash, user.Role, user.Email, user.FullName, user.IsActive,
	)

	if err != nil {
		return fmt.Errorf("failed to update user: %v", err)
	}

	return nil
}

// UpdateLastLogin updates the last login time for a user
func (r *userRepository) UpdateLastLogin(ctx context.Context, userID int) error {
	query := `UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	if err != nil {
		return fmt.Errorf("failed to update last login: %v", err)
	}
	return nil
}

// GetUserCount returns the total number of active users in the system
func (r *userRepository) GetUserCount(ctx context.Context) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE is_active = true`
	err := r.db.QueryRowContext(ctx, query).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get user count: %v", err)
	}
	return count, nil
}

// GetUserCountByRole returns the number of active users with a specific role
func (r *userRepository) GetUserCountByRole(ctx context.Context, role string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM users WHERE is_active = true AND role = $1`
	err := r.db.QueryRowContext(ctx, query, role).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get user count by role: %v", err)
	}
	return count, nil
}

// CreateSession creates a new user session
func (r *sessionRepository) CreateSession(ctx context.Context, session *model.UserSession) error {
	query := `
		INSERT INTO user_sessions (user_id, token_hash, expires_at, user_agent, ip_address)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at`

	// Handle empty IP address
	var ipAddress interface{}
	if session.IPAddress == "" {
		ipAddress = nil
	} else {
		ipAddress = session.IPAddress
	}

	err := r.db.QueryRowContext(ctx, query,
		session.UserID, session.TokenHash, session.ExpiresAt, session.UserAgent, ipAddress,
	).Scan(&session.ID, &session.CreatedAt)

	if err != nil {
		return fmt.Errorf("failed to create session: %v", err)
	}

	return nil
}

// GetSessionByTokenHash retrieves a session by token hash
func (r *sessionRepository) GetSessionByTokenHash(ctx context.Context, tokenHash string) (*model.UserSession, error) {
	session := &model.UserSession{}
	query := `
		SELECT id, user_id, token_hash, expires_at, created_at, is_revoked, user_agent, ip_address
		FROM user_sessions
		WHERE token_hash = $1 AND is_revoked = false AND expires_at > CURRENT_TIMESTAMP`

	var ipAddress sql.NullString
	err := r.db.QueryRowContext(ctx, query, tokenHash).Scan(
		&session.ID, &session.UserID, &session.TokenHash, &session.ExpiresAt,
		&session.CreatedAt, &session.IsRevoked, &session.UserAgent, &ipAddress,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("session not found or expired")
		}
		return nil, fmt.Errorf("failed to get session: %v", err)
	}

	// Handle null IP address
	if ipAddress.Valid {
		session.IPAddress = ipAddress.String
	} else {
		session.IPAddress = ""
	}

	return session, nil
}

// RevokeSession revokes a session
func (r *sessionRepository) RevokeSession(ctx context.Context, tokenHash string) error {
	query := `UPDATE user_sessions SET is_revoked = true WHERE token_hash = $1`
	_, err := r.db.ExecContext(ctx, query, tokenHash)
	if err != nil {
		return fmt.Errorf("failed to revoke session: %v", err)
	}
	return nil
}

// CleanupExpiredSessions removes expired sessions
func (r *sessionRepository) CleanupExpiredSessions(ctx context.Context) error {
	query := `DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP OR is_revoked = true`
	_, err := r.db.ExecContext(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to cleanup expired sessions: %v", err)
	}
	return nil
}

// GetConfigValue retrieves a configuration value by key
func (r *configRepository) GetConfigValue(ctx context.Context, key string) (string, error) {
	var value string
	query := `SELECT config_value FROM system_config WHERE config_key = $1`

	err := r.db.QueryRowContext(ctx, query, key).Scan(&value)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("config key '%s' not found", key)
		}
		return "", fmt.Errorf("failed to get config value: %v", err)
	}

	return value, nil
}

// UpdateConfigValue updates a configuration value by key
func (r *configRepository) UpdateConfigValue(ctx context.Context, key, value string) error {
	query := `
		UPDATE system_config 
		SET config_value = $2, updated_at = CURRENT_TIMESTAMP 
		WHERE config_key = $1`
	result, err := r.db.ExecContext(ctx, query, key, value)
	if err != nil {
		return fmt.Errorf("failed to update config value: %v", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %v", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("config key '%s' not found", key)
	}

	return nil
}
