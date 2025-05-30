package handler

import (
	"net/http"
	"strconv"

	"github.com/FurkanArikk/fitness-center/backend/class-service/pkg/dto"
	"github.com/gin-gonic/gin"
)

// GetSchedules handles GET /schedules
func (h *ScheduleHandler) GetSchedules(c *gin.Context) {
	status := c.Query("status")

	// Parse pagination parameters
	params := ParsePaginationParams(c)

	schedules, total, err := h.service.GetSchedulesPaginated(c.Request.Context(), status, params.Offset, params.PageSize)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.ScheduleResponse to dto.ScheduleResponse
	dtoSchedules := dto.ScheduleResponseListFromModel(schedules)

	response := CreatePaginatedResponse(dtoSchedules, params, total)
	c.JSON(http.StatusOK, response)
}

// GetScheduleByID handles GET /schedules/:id
func (h *ScheduleHandler) GetScheduleByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	schedule, err := h.service.GetScheduleByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	// Convert model.ScheduleResponse to dto.ScheduleResponse
	dtoSchedule := dto.ScheduleResponseFromScheduleResponse(schedule)

	c.JSON(http.StatusOK, gin.H{
		"data": dtoSchedule,
	})
}

// GetSchedulesByClassID handles GET /schedules/class/:class_id
func (h *ScheduleHandler) GetSchedulesByClassID(c *gin.Context) {
	classID, err := strconv.Atoi(c.Param("class_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	schedules, err := h.service.GetSchedulesByClassID(c.Request.Context(), classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model.ScheduleResponse to dto.ScheduleResponse
	dtoSchedules := dto.ScheduleResponseListFromModel(schedules)

	c.JSON(http.StatusOK, gin.H{
		"data": dtoSchedules,
	})
}

// CreateSchedule handles POST /schedules
func (h *ScheduleHandler) CreateSchedule(c *gin.Context) {
	var req dto.ScheduleCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	schedule, err := h.service.CreateSchedule(c.Request.Context(), modelReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to DTO
	dtoSchedule := dto.ScheduleResponseFromModel(schedule)

	c.JSON(http.StatusCreated, gin.H{
		"data":    dtoSchedule,
		"message": "Schedule created successfully",
	})
}

// UpdateSchedule handles PUT /schedules/:id
func (h *ScheduleHandler) UpdateSchedule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	var req dto.ScheduleUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert DTO to model
	modelReq := req.ToModel()

	schedule, err := h.service.UpdateSchedule(c.Request.Context(), id, modelReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Convert model to DTO
	dtoSchedule := dto.ScheduleResponseFromModel(schedule)

	c.JSON(http.StatusOK, gin.H{
		"data":    dtoSchedule,
		"message": "Schedule updated successfully",
	})
}

// DeleteSchedule handles DELETE /schedules/:id
func (h *ScheduleHandler) DeleteSchedule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	err = h.service.DeleteSchedule(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Schedule deleted successfully",
	})
}
