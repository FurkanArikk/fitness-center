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
