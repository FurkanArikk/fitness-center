package dto

// LoginRequest represents user login request
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse represents login response
type LoginResponse struct {
	Token   string `json:"token"`
	Message string `json:"message"`
}

// ErrorResponse represents error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// ForwardAuthResponse represents ForwardAuth response
type ForwardAuthResponse struct {
	Valid bool   `json:"valid"`
	User  string `json:"user,omitempty"`
	Error string `json:"error,omitempty"`
}

// CreateAdminRequest represents create admin request
type CreateAdminRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Email    string `json:"email" binding:"required"`
}

// UpdatePasswordRequest represents password update request
type UpdatePasswordRequest struct {
	Username        string `json:"username" binding:"required"`
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
}

// SuccessResponse represents success response
type SuccessResponse struct {
	Message string `json:"message"`
}

// AdminResponse represents admin user information
type AdminResponse struct {
	ID          uint   `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	IsActive    bool   `json:"is_active"`
	CreatedAt   string `json:"created_at"`
	LastLoginAt string `json:"last_login_at,omitempty"`
}

// ListAdminsResponse represents list of admin users
type ListAdminsResponse struct {
	Admins []AdminResponse `json:"admins"`
}
