package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/FurkanArikk/fitness-center/backend/member-service/internal/model"
	"github.com/gin-gonic/gin"
)

// GetMembers returns all members
func (h *MemberHandler) GetMembers(c *gin.Context) {
	// Parse pagination parameters
	params := ParsePaginationParams(c)

	members, totalCount, err := h.service.List(c.Request.Context(), params.Page, params.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Return paginated response if pagination is requested, otherwise simple array
	if params.IsPagined {
		response := CreatePaginatedResponse(members, params, totalCount)
		c.JSON(http.StatusOK, response)
	} else {
		c.JSON(http.StatusOK, members)
	}
}

// GetMemberByID returns a specific member
func (h *MemberHandler) GetMemberByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	member, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, member)
}

// CreateMember creates a new member
func (h *MemberHandler) CreateMember(c *gin.Context) {
	var request struct {
		FirstName             string `json:"first_name" binding:"required"`
		LastName              string `json:"last_name" binding:"required"`
		Email                 string `json:"email" binding:"required,email"`
		Phone                 string `json:"phone" binding:"required"`
		Address               string `json:"address"`
		DateOfBirth           string `json:"date_of_birth"`
		EmergencyContactName  string `json:"emergency_contact_name"`
		EmergencyContactPhone string `json:"emergency_contact_phone"`
		Status                string `json:"status"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert the request to member model
	member := convertRequestToMember(request)

	if err := h.service.Create(c.Request.Context(), member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, member)
}

// UpdateMember updates an existing member
func (h *MemberHandler) UpdateMember(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	var request struct {
		FirstName             string `json:"first_name"`
		LastName              string `json:"last_name"`
		Email                 string `json:"email"`
		Phone                 string `json:"phone"`
		Address               string `json:"address"`
		DateOfBirth           string `json:"date_of_birth"`
		EmergencyContactName  string `json:"emergency_contact_name"`
		EmergencyContactPhone string `json:"emergency_contact_phone"`
		Status                string `json:"status"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get existing member
	member, err := h.service.GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	// Update member fields from request
	updateMemberFromRequest(member, request)

	if err := h.service.Update(c.Request.Context(), member); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, member)
}

// DeleteMember deletes a member
func (h *MemberHandler) DeleteMember(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Member deleted successfully"})
}

// Helper functions to convert between request and model
func convertRequestToMember(request struct {
	FirstName             string `json:"first_name" binding:"required"`
	LastName              string `json:"last_name" binding:"required"`
	Email                 string `json:"email" binding:"required,email"`
	Phone                 string `json:"phone" binding:"required"`
	Address               string `json:"address"`
	DateOfBirth           string `json:"date_of_birth"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyContactPhone string `json:"emergency_contact_phone"`
	Status                string `json:"status"`
}) *model.Member {
	member := &model.Member{
		FirstName:             request.FirstName,
		LastName:              request.LastName,
		Email:                 request.Email,
		Phone:                 request.Phone,
		Address:               request.Address,
		EmergencyContactName:  request.EmergencyContactName,
		EmergencyContactPhone: request.EmergencyContactPhone,
		Status:                request.Status,
		JoinDate:              model.NewDateOnly(time.Now()),
	}

	// Parse date of birth
	if request.DateOfBirth != "" {
		if t, err := time.Parse("2006-01-02", request.DateOfBirth); err == nil {
			member.DateOfBirth = model.NewDateOnly(t)
		} else if t, err := time.Parse(time.RFC3339, request.DateOfBirth); err == nil {
			member.DateOfBirth = model.NewDateOnly(t)
		}
	}

	return member
}

func updateMemberFromRequest(member *model.Member, request struct {
	FirstName             string `json:"first_name"`
	LastName              string `json:"last_name"`
	Email                 string `json:"email"`
	Phone                 string `json:"phone"`
	Address               string `json:"address"`
	DateOfBirth           string `json:"date_of_birth"`
	EmergencyContactName  string `json:"emergency_contact_name"`
	EmergencyContactPhone string `json:"emergency_contact_phone"`
	Status                string `json:"status"`
}) {
	if request.FirstName != "" {
		member.FirstName = request.FirstName
	}
	if request.LastName != "" {
		member.LastName = request.LastName
	}
	if request.Email != "" {
		member.Email = request.Email
	}
	if request.Phone != "" {
		member.Phone = request.Phone
	}
	if request.Address != "" {
		member.Address = request.Address
	}
	if request.EmergencyContactName != "" {
		member.EmergencyContactName = request.EmergencyContactName
	}
	if request.EmergencyContactPhone != "" {
		member.EmergencyContactPhone = request.EmergencyContactPhone
	}
	if request.Status != "" {
		member.Status = request.Status
	}

	// Parse date of birth
	if request.DateOfBirth != "" {
		if t, err := time.Parse("2006-01-02", request.DateOfBirth); err == nil {
			member.DateOfBirth = model.NewDateOnly(t)
		} else if t, err := time.Parse(time.RFC3339, request.DateOfBirth); err == nil {
			member.DateOfBirth = model.NewDateOnly(t)
		}
	}
}
