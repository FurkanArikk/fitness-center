package handler

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/FurkanArikk/fitness-center/backend/class-service/internal/model"
)

// GetClasses handles the request to get all classes
func (h *Handler) GetClasses(c *gin.Context) {
	active := c.Query("active")

	query := "SELECT * FROM classes"
	if active == "true" {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY class_name"

	rows, err := h.DB.Query(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch classes"})
		return
	}
	defer rows.Close()

	var classes []model.Class
	for rows.Next() {
		var class model.Class
		if err := rows.Scan(
			&class.ClassID, &class.ClassName, &class.Description,
			&class.Duration, &class.Capacity, &class.Difficulty,
			&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan class"})
			return
		}
		classes = append(classes, class)
	}

	c.JSON(http.StatusOK, classes)
}

// GetClassByID handles the request to get a specific class
func (h *Handler) GetClassByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	var class model.Class
	err = h.DB.QueryRow("SELECT * FROM classes WHERE class_id = $1", id).Scan(
		&class.ClassID, &class.ClassName, &class.Description,
		&class.Duration, &class.Capacity, &class.Difficulty,
		&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch class"})
		return
	}

	c.JSON(http.StatusOK, class)
}

// CreateClass handles the request to create a new class
func (h *Handler) CreateClass(c *gin.Context) {
	var req model.ClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		INSERT INTO classes (class_name, description, duration, capacity, difficulty, is_active)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING class_id, created_at, updated_at
	`

	var class model.Class
	class.ClassName = req.ClassName
	class.Description = req.Description
	class.Duration = req.Duration
	class.Capacity = req.Capacity
	class.Difficulty = req.Difficulty
	class.IsActive = req.IsActive

	err := h.DB.QueryRow(
		query,
		class.ClassName, class.Description, class.Duration,
		class.Capacity, class.Difficulty, class.IsActive,
	).Scan(&class.ClassID, &class.CreatedAt, &class.UpdatedAt)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create class"})
		return
	}

	c.JSON(http.StatusCreated, class)
}

// UpdateClass handles the request to update an existing class
func (h *Handler) UpdateClass(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	var req model.ClassRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	query := `
		UPDATE classes
		SET class_name = $1, description = $2, duration = $3, 
			capacity = $4, difficulty = $5, is_active = $6, updated_at = NOW()
		WHERE class_id = $7
		RETURNING *
	`

	var class model.Class
	err = h.DB.QueryRow(
		query,
		req.ClassName, req.Description, req.Duration,
		req.Capacity, req.Difficulty, req.IsActive, id,
	).Scan(
		&class.ClassID, &class.ClassName, &class.Description,
		&class.Duration, &class.Capacity, &class.Difficulty,
		&class.IsActive, &class.CreatedAt, &class.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update class"})
		return
	}

	c.JSON(http.StatusOK, class)
}

// DeleteClass handles the request to delete a class
func (h *Handler) DeleteClass(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid class ID"})
		return
	}

	// Check if class is used in any schedule
	var count int
	err = h.DB.QueryRow("SELECT COUNT(*) FROM class_schedule WHERE class_id = $1", id).Scan(&count)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check class dependencies"})
		return
	}

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Cannot delete class that is used in schedules"})
		return
	}

	result, err := h.DB.Exec("DELETE FROM classes WHERE class_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete class"})
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Class not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Class deleted successfully"})
}
