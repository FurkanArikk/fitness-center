package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/furkan/fitness-center/backend/facility-service/internal/model"
	"github.com/gin-gonic/gin"
)

// CreateAttendance handles attendance creation (check-in)
func (h *Handler) CreateAttendance(c *gin.Context) {
	var attendance model.Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set check-in time to now if not provided
	if attendance.CheckInTime.IsZero() {
		attendance.CheckInTime = time.Now()
	}

	createdAttendance, err := h.repo.Attendance().Create(c.Request.Context(), &attendance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, createdAttendance)
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

	c.JSON(http.StatusOK, attendance)
}

// UpdateAttendance handles attendance update
func (h *Handler) UpdateAttendance(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid attendance ID"})
		return
	}

	var attendance model.Attendance
	if err := c.ShouldBindJSON(&attendance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	attendance.AttendanceID = id
	updatedAttendance, err := h.repo.Attendance().Update(c.Request.Context(), &attendance)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, updatedAttendance)
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

	checkOutTime := time.Now()
	if err := h.repo.Attendance().CheckOut(c.Request.Context(), id, checkOutTime); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":        "Member checked out successfully",
		"check_out_time": checkOutTime,
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

	c.JSON(http.StatusOK, gin.H{
		"data":       attendance,
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
