package dto

import (
	"time"

	"github.com/fitness-center/staff-service/internal/model"
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
