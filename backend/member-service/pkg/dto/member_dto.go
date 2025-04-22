package dto

import (
	"time"
)

// MemberRequest represents the incoming request for creating or updating a member
type MemberRequest struct {
	FirstName             string    `json:"first_name"`
	LastName              string    `json:"last_name"`
	Email                 string    `json:"email"`
	Phone                 string    `json:"phone,omitempty"`
	Address               string    `json:"address,omitempty"`
	DateOfBirth           time.Time `json:"date_of_birth,omitempty"`
	EmergencyContactName  string    `json:"emergency_contact_name,omitempty"`
	EmergencyContactPhone string    `json:"emergency_contact_phone,omitempty"`
	JoinDate              time.Time `json:"join_date,omitempty"`
	Status                string    `json:"status,omitempty"`
}

// MemberResponse represents the API response for a member
type MemberResponse struct {
	MemberID           int64     `json:"member_id"`
	FirstName          string    `json:"first_name"`
	LastName           string    `json:"last_name"`
	FullName           string    `json:"full_name"`
	Email              string    `json:"email"`
	Phone              string    `json:"phone,omitempty"`
	Address            string    `json:"address,omitempty"`
	DateOfBirth        time.Time `json:"date_of_birth,omitempty"`
	Age                int       `json:"age,omitempty"`
	EmergencyContact   string    `json:"emergency_contact,omitempty"` // Combined name and phone
	JoinDate           time.Time `json:"join_date"`
	MembershipDuration int       `json:"membership_duration"` // In months since joining
	Status             string    `json:"status"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// MemberListResponse represents a list of members in the API response
type MemberListResponse struct {
	Members []MemberResponse `json:"members"`
	Total   int              `json:"total"`
	Page    int              `json:"page"`
	Size    int              `json:"size"`
}

// MemberDetailResponse represents a detailed member profile with additional information
type MemberDetailResponse struct {
	MemberResponse
	CurrentMembership *MemberMembershipResponse  `json:"current_membership,omitempty"`
	MembershipHistory []MemberMembershipResponse `json:"membership_history,omitempty"`
	LatestAssessment  *AssessmentResponse        `json:"latest_assessment,omitempty"`
}

// MemberStatusUpdateRequest represents a request to update a member's status
type MemberStatusUpdateRequest struct {
	Status string `json:"status"`
}
