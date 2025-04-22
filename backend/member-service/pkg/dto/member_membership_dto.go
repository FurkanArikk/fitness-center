package dto

import (
	"time"
)

// MemberMembershipRequest represents the incoming request for creating or updating a member-membership
type MemberMembershipRequest struct {
	MemberID       int64     `json:"member_id"`
	MembershipID   int64     `json:"membership_id"`
	StartDate      time.Time `json:"start_date"`
	EndDate        time.Time `json:"end_date"`
	PaymentStatus  string    `json:"payment_status,omitempty"`
	ContractSigned bool      `json:"contract_signed"`
}

// MemberMembershipResponse represents the API response for a member-membership relationship
type MemberMembershipResponse struct {
	MemberMembershipID int64     `json:"member_membership_id"`
	MemberID           int64     `json:"member_id"`
	MemberName         string    `json:"member_name,omitempty"`
	MembershipID       int64     `json:"membership_id"`
	MembershipName     string    `json:"membership_name,omitempty"`
	StartDate          time.Time `json:"start_date"`
	EndDate            time.Time `json:"end_date"`
	DaysRemaining      int       `json:"days_remaining,omitempty"`
	PaymentStatus      string    `json:"payment_status"`
	ContractSigned     bool      `json:"contract_signed"`
	IsActive           bool      `json:"is_active"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

// MemberMembershipListResponse represents a list of member-memberships in the API response
type MemberMembershipListResponse struct {
	MemberMemberships []MemberMembershipResponse `json:"member_memberships"`
	Total             int                        `json:"total"`
}

// MemberMembershipExtendRequest represents a request to extend a membership
type MemberMembershipExtendRequest struct {
	ExtendByMonths int    `json:"extend_by_months"`
	PaymentStatus  string `json:"payment_status,omitempty"`
}

// MemberMembershipTransferRequest represents a request to transfer a membership to another member
type MemberMembershipTransferRequest struct {
	FromMemberID int64     `json:"from_member_id"`
	ToMemberID   int64     `json:"to_member_id"`
	StartDate    time.Time `json:"start_date,omitempty"`
	Reason       string    `json:"reason,omitempty"`
}
