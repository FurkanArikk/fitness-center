package dto

import (
	"time"

	"github.com/FurkanArikk/fitness-center/backend/staff-service/internal/model"
)

// QualificationResponse represents a qualification response to the client
type QualificationResponse struct {
	ID                int64     `json:"id"`
	StaffID           int64     `json:"staff_id"`
	QualificationName string    `json:"qualification_name"`
	IssueDate         string    `json:"issue_date"`
	ExpiryDate        string    `json:"expiry_date"`
	IssuingAuthority  string    `json:"issuing_authority"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// QualificationRequest represents a qualification request from the client
type QualificationRequest struct {
	StaffID           int64  `json:"staff_id" validate:"required"`
	QualificationName string `json:"qualification_name" validate:"required"`
	IssueDate         string `json:"issue_date" validate:"required,datetime=2006-01-02"`
	ExpiryDate        string `json:"expiry_date" validate:"required,datetime=2006-01-02"`
	IssuingAuthority  string `json:"issuing_authority" validate:"required"`
}

// QualificationUpdateRequest represents a qualification update request from the client
type QualificationUpdateRequest struct {
	StaffID           *int64  `json:"staff_id,omitempty"`
	QualificationName *string `json:"qualification_name,omitempty"`
	IssueDate         *string `json:"issue_date,omitempty" validate:"omitempty,datetime=2006-01-02"`
	ExpiryDate        *string `json:"expiry_date,omitempty" validate:"omitempty,datetime=2006-01-02"`
	IssuingAuthority  *string `json:"issuing_authority,omitempty"`
}

// ToModel converts a QualificationRequest to a Qualification model
func (r *QualificationRequest) ToModel() (*model.Qualification, error) {
	issueDate, err := time.Parse("2006-01-02", r.IssueDate)
	if err != nil {
		return nil, err
	}

	expiryDate, err := time.Parse("2006-01-02", r.ExpiryDate)
	if err != nil {
		return nil, err
	}

	return &model.Qualification{
		StaffID:           r.StaffID,
		QualificationName: r.QualificationName,
		IssueDate:         issueDate,
		ExpiryDate:        expiryDate,
		IssuingAuthority:  r.IssuingAuthority,
	}, nil
}

// ToModel converts a QualificationUpdateRequest to a Qualification model using an existing qualification
func (r *QualificationUpdateRequest) ToModel(existing *model.Qualification) (*model.Qualification, error) {
	// Start with the existing qualification
	qualification := &model.Qualification{
		QualificationID:   existing.QualificationID,
		StaffID:           existing.StaffID,
		QualificationName: existing.QualificationName,
		IssueDate:         existing.IssueDate,
		ExpiryDate:        existing.ExpiryDate,
		IssuingAuthority:  existing.IssuingAuthority,
		CreatedAt:         existing.CreatedAt,
		UpdatedAt:         existing.UpdatedAt,
	}

	// Update fields that are provided in the request
	if r.StaffID != nil {
		qualification.StaffID = *r.StaffID
	}

	if r.QualificationName != nil {
		qualification.QualificationName = *r.QualificationName
	}

	if r.IssueDate != nil {
		issueDate, err := time.Parse("2006-01-02", *r.IssueDate)
		if err != nil {
			return nil, err
		}
		qualification.IssueDate = issueDate
	}

	if r.ExpiryDate != nil {
		expiryDate, err := time.Parse("2006-01-02", *r.ExpiryDate)
		if err != nil {
			return nil, err
		}
		qualification.ExpiryDate = expiryDate
	}

	if r.IssuingAuthority != nil {
		qualification.IssuingAuthority = *r.IssuingAuthority
	}

	return qualification, nil
}

// FromModel creates a QualificationResponse from a Qualification model
func QualificationFromModel(q *model.Qualification) *QualificationResponse {
	return &QualificationResponse{
		ID:                q.QualificationID,
		StaffID:           q.StaffID,
		QualificationName: q.QualificationName,
		IssueDate:         q.IssueDate.Format("2006-01-02"),
		ExpiryDate:        q.ExpiryDate.Format("2006-01-02"),
		IssuingAuthority:  q.IssuingAuthority,
		CreatedAt:         q.CreatedAt,
		UpdatedAt:         q.UpdatedAt,
	}
}

// QualificationsFromModel creates QualificationResponses from Qualification models
func QualificationsFromModel(qualifications []model.Qualification) []QualificationResponse {
	result := make([]QualificationResponse, len(qualifications))
	for i, q := range qualifications {
		result[i] = *QualificationFromModel(&q)
	}
	return result
}
