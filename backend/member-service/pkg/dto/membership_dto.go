package dto

import (
	"time"
)

// MembershipRequest represents the incoming request for creating or updating a membership
type MembershipRequest struct {
	MembershipName string  `json:"membership_name"`
	Description    string  `json:"description,omitempty"`
	Duration       int     `json:"duration"` // in months
	Price          float64 `json:"price"`
	IsActive       bool    `json:"is_active"`
}

// MembershipResponse represents the API response for a membership
type MembershipResponse struct {
	MembershipID   int64     `json:"membership_id"`
	MembershipName string    `json:"membership_name"`
	Description    string    `json:"description,omitempty"`
	Duration       int       `json:"duration"` // in months
	Price          float64   `json:"price"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// MembershipListResponse represents a list of memberships in the API response
type MembershipListResponse struct {
	Memberships []MembershipResponse `json:"memberships"`
	Total       int                  `json:"total"`
	Page        int                  `json:"page"`
	Size        int                  `json:"size"`
}

// MembershipStatusUpdateRequest represents a request to update a membership's active status
type MembershipStatusUpdateRequest struct {
	IsActive bool `json:"is_active"`
}

// MembershipStatsResponse represents statistics about a membership plan
type MembershipStatsResponse struct {
	MembershipID    int64   `json:"membership_id"`
	MembershipName  string  `json:"membership_name"`
	ActiveMembers   int     `json:"active_members"`
	TotalRevenue    float64 `json:"total_revenue"`
	AverageDuration float64 `json:"average_duration"` // Average months members stay on this plan
}
