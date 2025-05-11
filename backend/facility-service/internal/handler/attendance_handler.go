package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// CreateAttendance handles attendance creation (check-in)
func (h *Handler) CreateAttendance(c *gin.Context) {
	var attendanceReq dto.AttendanceCreateRequest
	if err := c.ShouldBindJSON(&attendanceReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	attendance := attendanceReq.ToModel()

	createdAttendance, err := h.repo.Attendance().Create(c.Request.Context(), &attendance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.AttendanceResponseFromModel(*createdAttendance)
	c.JSON(http.StatusCreated, response)
}

// GetAttendance retrieves attendance by ID
func (h *Handler) GetAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	attendance, err := h.repo.Attendance().GetByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Attendance record not found"})
		return
	}

	// Convert model to response DTO
	response := dto.AttendanceResponseFromModel(*attendance)
	c.JSON(http.StatusOK, response)
}

// UpdateAttendance handles attendance update
func (h *Handler) UpdateAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	var attendanceReq dto.AttendanceUpdateRequest
	if err := c.ShouldBindJSON(&attendanceReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	attendance := attendanceReq.ToModel()
	attendance.AttendanceID = id

	updatedAttendance, err := h.repo.Attendance().Update(c.Request.Context(), &attendance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to response DTO
	response := dto.AttendanceResponseFromModel(*updatedAttendance)
	c.JSON(http.StatusOK, response)
}

// DeleteAttendance handles attendance deletion
func (h *Handler) DeleteAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	if err := h.repo.Attendance().Delete(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Attendance record deleted successfully"})
}

// CheckoutAttendance handles member check-out
func (h *Handler) CheckoutAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	var checkoutReq dto.CheckoutRequest
	if err := c.ShouldBindJSON(&checkoutReq); err != nil {
		// If no check-out time provided, use current time
		checkOutTime := time.Now()
		if err := h.repo.Attendance().CheckOut(c.Request.Context(), id, checkOutTime); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message":        "Member checked out successfully",
			"check_out_time": checkOutTime,
		})
		return
	}

	if err := h.repo.Attendance().CheckOut(c.Request.Context(), id, checkoutReq.CheckOutTime); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Member checked out successfully",
		"check_out_time": checkoutReq.CheckOutTime,
	})
}

// ListAttendance handles listing all attendance records with pagination
func (h *Handler) ListAttendance(c *gin.Context) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	attendance, total, err := h.repo.Attendance().List(c.Request.Context(), map[string]interface{}{}, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model list to response DTO list
	responseList := dto.AttendanceResponseListFromModel(attendance)

	c.JSON(http.StatusOK, gin.H{
		"data":       responseList,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListAttendanceByMember handles listing attendance by member ID
func (h *Handler) ListAttendanceByMember(c *gin.Context) {
	memberID, err := strconv.Atoi(c.Param("memberID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid member ID"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	attendance, total, err := h.repo.Attendance().ListByMemberID(c.Request.Context(), memberID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       attendance,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListAttendanceByFacility handles listing attendance by facility ID
func (h *Handler) ListAttendanceByFacility(c *gin.Context) {
	facilityID, err := strconv.Atoi(c.Param("facilityID"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid facility ID"})
		return
	}

	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	attendance, total, err := h.repo.Attendance().ListByFacilityID(c.Request.Context(), facilityID, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       attendance,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}

// ListAttendanceByDate handles listing attendance by date
func (h *Handler) ListAttendanceByDate(c *gin.Context) {
	date := c.Param("date")
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil || page < 1 {
		page = 1
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "10"))
	if err != nil || pageSize < 1 {
		pageSize = 10
	}

	attendance, total, err := h.repo.Attendance().ListByDate(c.Request.Context(), date, page, pageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       attendance,
		"page":       page,
		"pageSize":   pageSize,
		"totalItems": total,
		"totalPages": (total + pageSize - 1) / pageSize,
	})
}
