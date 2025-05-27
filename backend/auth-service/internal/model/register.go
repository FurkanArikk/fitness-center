package model

// RegisterRequest represents the registration request
type RegisterRequest struct {
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

// RegisterResponse represents the registration response
type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	User    User   `json:"user,omitempty"`
}
