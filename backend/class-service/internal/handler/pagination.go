package handler

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

// PaginationParams contains pagination information
type PaginationParams struct {
	Page      int
	PageSize  int
	Offset    int
	IsPagined bool
}

// ParsePaginationParams extracts pagination parameters from the request
func ParsePaginationParams(c *gin.Context) PaginationParams {
	// Default values
	page, pageSize := 1, 10
	isPagined := false

	// Parse page parameter
	if c.Query("page") != "" {
		isPagined = true
		if p, err := strconv.Atoi(c.Query("page")); err == nil && p > 0 {
			page = p
		}
	}

	// Parse pageSize parameter
	if c.Query("pageSize") != "" {
		isPagined = true
		if ps, err := strconv.Atoi(c.Query("pageSize")); err == nil && ps > 0 && ps <= 100 {
			pageSize = ps
		}
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	return PaginationParams{
		Page:      page,
		PageSize:  pageSize,
		Offset:    offset,
		IsPagined: isPagined,
	}
}

// CreatePaginatedResponse creates a standard paginated response format
func CreatePaginatedResponse(data interface{}, params PaginationParams, totalCount int) gin.H {
	// Calculate total pages
	totalPages := (totalCount + params.PageSize - 1) / params.PageSize
	if totalPages < 1 {
		totalPages = 1
	}

	return gin.H{
		"data":       data,
		"page":       params.Page,
		"pageSize":   params.PageSize,
		"totalItems": totalCount,
		"totalPages": totalPages,
	}
}
