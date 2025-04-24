package handler

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// GetSchedules handles the request to get all schedules
func (h *Handler) GetSchedules(c *gin.Context) {
	status := c.Query("status")

	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
	`
	if status != "" {
		query += " WHERE s.status = $1"
	}
	query += " ORDER BY s.day_of_week, s.start_time"

	var rows *sql.Rows
	var err error

	if status != "" {
		rows, err = h.DB.Query(query, status)
	} else {
		rows, err = h.DB.Query(query)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}
	defer rows.Close()

	var schedules []model.ScheduleResponse
	for rows.Next() {
		var s model.ScheduleResponse
		if err := rows.Scan(
			&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
			&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
			&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan schedule"})
			return
		}
		schedules = append(schedules, s)
	}

	c.JSON(http.StatusOK, schedules)
}

// GetScheduleByID handles the request to get a specific schedule
func (h *Handler) GetScheduleByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
		WHERE s.schedule_id = $1
	`

	var s model.ScheduleResponse
	err = h.DB.QueryRow(query, id).Scan(
		&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
		&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
		&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedule"})
		return
	}

	c.JSON(http.StatusOK, s)
}

// GetSchedulesByClassID handles the request to get schedules for a specific class
func (h *Handler) GetSchedulesByClassID(c *gin.Context) {
	classID, err := strconv.Atoi(c.Param("classId"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	query := `
		SELECT s.*, c.class_name, c.duration
		FROM class_schedule s
		JOIN classes c ON s.class_id = c.class_id
		WHERE s.class_id = $1
		ORDER BY s.day_of_week, s.start_time
	`

	rows, err := h.DB.Query(query, classID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch schedules"})
		return
	}
	defer rows.Close()

	var schedules []model.ScheduleResponse
	for rows.Next() {
		var s model.ScheduleResponse
		if err := rows.Scan(
			&s.ScheduleID, &s.ClassID, &s.TrainerID, &s.RoomID,
			&s.StartTime, &s.EndTime, &s.DayOfWeek, &s.Status,
			&s.CreatedAt, &s.UpdatedAt, &s.ClassName, &s.ClassDuration,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan schedule"})
			return
		}
		schedules = append(schedules, s)
	}

	c.JSON(http.StatusOK, schedules)
}

// CreateSchedule handles the request to create a new schedule
func (h *Handler) CreateSchedule(c *gin.Context) {
	var req model.ScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if class exists and is active
	var isActive bool
	err := h.DB.QueryRow("SELECT is_active FROM classes WHERE class_id = $1", req.ClassID).Scan(&isActive)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Class not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check class"})
		return
	}

	if !isActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot schedule an inactive class"})
		return
	}

	// Default status to active if not provided
	if req.Status == "" {
		req.Status = "active"
	}

	query := `
		INSERT INTO class_schedule (class_id, trainer_id, room_id, start_time, end_time, day_of_week, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING schedule_id, created_at, updated_at
	`

	var schedule model.Schedule
	schedule.ClassID = req.ClassID
	schedule.TrainerID = req.TrainerID
	schedule.RoomID = req.RoomID
	schedule.StartTime = req.StartTime
	schedule.EndTime = req.EndTime
	schedule.DayOfWeek = req.DayOfWeek
	schedule.Status = req.Status

	err = h.DB.QueryRow(
		query,
		schedule.ClassID, schedule.TrainerID, schedule.RoomID,
		schedule.StartTime, schedule.EndTime, schedule.DayOfWeek, schedule.Status,
	).Scan(&schedule.ScheduleID, &schedule.CreatedAt, &schedule.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create schedule"})
		return
	}

	c.JSON(http.StatusCreated, schedule)
}

// UpdateSchedule handles the request to update an existing schedule
func (h *Handler) UpdateSchedule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	var req model.ScheduleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if class exists and is active
	var isActive bool
	err = h.DB.QueryRow("SELECT is_active FROM classes WHERE class_id = $1", req.ClassID).Scan(&isActive)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Class not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check class"})
		return
	}

	if !isActive {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot schedule an inactive class"})
		return
	}

	query := `
		UPDATE class_schedule
		SET class_id = $1, trainer_id = $2, room_id = $3,
			start_time = $4, end_time = $5, day_of_week = $6,
			status = $7, updated_at = NOW()
		WHERE schedule_id = $8
		RETURNING *
	`

	var schedule model.Schedule
	err = h.DB.QueryRow(
		query,
		req.ClassID, req.TrainerID, req.RoomID,
		req.StartTime, req.EndTime, req.DayOfWeek,
		req.Status, id,
	).Scan(
		&schedule.ScheduleID, &schedule.ClassID, &schedule.TrainerID,
		&schedule.RoomID, &schedule.StartTime, &schedule.EndTime,
		&schedule.DayOfWeek, &schedule.Status, &schedule.CreatedAt, &schedule.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update schedule"})
		return
	}

	c.JSON(http.StatusOK, schedule)
}

// DeleteSchedule handles the request to delete a schedule
func (h *Handler) DeleteSchedule(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid schedule ID"})
		return
	}

	// Check if there are any bookings for this schedule
	var count int
	err = h.DB.QueryRow("SELECT COUNT(*) FROM class_bookings WHERE schedule_id = $1", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check schedule dependencies"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete schedule with existing bookings"})
		return
	}

	result, err := h.DB.Exec("DELETE FROM class_schedule WHERE schedule_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete schedule"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Schedule not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Schedule deleted successfully"})
}
