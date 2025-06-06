package dto

import "time"

// DateOnly represents a date in YYYY-MM-DD format only
type DateOnly time.Time

// MarshalJSON converts DateOnly to YYYY-MM-DD format
func (d DateOnly) MarshalJSON() ([]byte, error) {
	dateValue := time.Time(d)
	if dateValue.IsZero() {
		return []byte(`""`), nil
	}
	return []byte(`"` + dateValue.Format("2006-01-02") + `"`), nil
}

// UnmarshalJSON parses YYYY-MM-DD format into DateOnly
func (d *DateOnly) UnmarshalJSON(data []byte) error {
	// Remove quotes from JSON string
	dateStr := string(data[1 : len(data)-1])
	if dateStr == "" {
		*d = DateOnly(time.Time{})
		return nil
	}

	parsedDate, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return err
	}
	*d = DateOnly(parsedDate)
	return nil
}

// TimeOnly represents a time in HH:MM:SS format only
type TimeOnly time.Time

// MarshalJSON converts TimeOnly to HH:MM:SS format
func (t TimeOnly) MarshalJSON() ([]byte, error) {
	timeValue := time.Time(t)
	if timeValue.IsZero() {
		return []byte(`""`), nil
	}
	return []byte(`"` + timeValue.Format("15:04:05") + `"`), nil
}

// UnmarshalJSON parses HH:MM:SS format into TimeOnly
func (t *TimeOnly) UnmarshalJSON(data []byte) error {
	// Remove quotes from JSON string
	timeStr := string(data[1 : len(data)-1])
	if timeStr == "" {
		*t = TimeOnly(time.Time{})
		return nil
	}

	// Parse time with today's date
	today := time.Now().Format("2006-01-02")
	parsedTime, err := time.Parse("2006-01-02 15:04:05", today+" "+timeStr)
	if err != nil {
		return err
	}
	*t = TimeOnly(parsedTime)
	return nil
}
