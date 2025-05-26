package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

// DateOnly is a custom date type that marshals as YYYY-MM-DD
type DateOnly struct {
	time.Time
}

// NewDateOnly creates a new DateOnly from time.Time
func NewDateOnly(t time.Time) DateOnly {
	return DateOnly{t}
}

// MarshalJSON implements JSON marshal for DateOnly
func (d DateOnly) MarshalJSON() ([]byte, error) {
	if d.Time.IsZero() {
		return []byte(`null`), nil
	}
	return json.Marshal(d.Time.Format("2006-01-02"))
}

// UnmarshalJSON implements JSON unmarshal for DateOnly
func (d *DateOnly) UnmarshalJSON(data []byte) error {
	var s string
	if err := json.Unmarshal(data, &s); err != nil {
		return err
	}

	if s == "0001-01-01" || s == "" {
		d.Time = time.Time{}
		return nil
	}

	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		// Try parsing as RFC3339 for backward compatibility
		t, err = time.Parse(time.RFC3339, s)
		if err != nil {
			return err
		}
	}
	d.Time = t
	return nil
}

// Value implements driver.Valuer for database storage
func (d DateOnly) Value() (driver.Value, error) {
	if d.Time.IsZero() {
		return nil, nil
	}
	return d.Time, nil
}

// Scan implements sql.Scanner for database retrieval
func (d *DateOnly) Scan(value interface{}) error {
	if value == nil {
		d.Time = time.Time{}
		return nil
	}

	switch v := value.(type) {
	case time.Time:
		d.Time = v
	case []byte:
		t, err := time.Parse("2006-01-02", string(v))
		if err != nil {
			return err
		}
		d.Time = t
	case string:
		t, err := time.Parse("2006-01-02", v)
		if err != nil {
			return err
		}
		d.Time = t
	default:
		return fmt.Errorf("cannot scan %T into DateOnly", value)
	}
	return nil
}

// Before checks if this date is before another DateOnly date
func (d DateOnly) Before(other DateOnly) bool {
	return d.Time.Before(other.Time)
}

// After checks if this date is after another DateOnly date
func (d DateOnly) After(other DateOnly) bool {
	return d.Time.After(other.Time)
}

// Equal checks if this date is equal to another DateOnly date
func (d DateOnly) Equal(other DateOnly) bool {
	return d.Time.Equal(other.Time)
}

// String returns the string representation of the date
func (d DateOnly) String() string {
	if d.Time.IsZero() {
		return "0001-01-01"
	}
	return d.Time.Format("2006-01-02")
}
