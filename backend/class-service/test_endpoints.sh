#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Service configuration
BASE_URL="http://localhost:8005"
API_BASE="${BASE_URL}/api/v1"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to print test headers
print_test_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# Function to print test results
print_result() {
    local test_name="$1"
    local expected_code="$2"
    local actual_code="$3"
    local response="$4"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$expected_code" -eq "$actual_code" ]; then
        echo -e "${GREEN}✓ PASS${NC} - $test_name (Expected: $expected_code, Got: $actual_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} - $test_name (Expected: $expected_code, Got: $actual_code)"
        echo -e "${YELLOW}Response: $response${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
}

# Function to make HTTP request and test response
test_endpoint() {
    local method="$1"
    local endpoint="$2"
    local expected_code="$3"
    local test_name="$4"
    local data="$5"
    
    if [ "$method" = "POST" ] || [ "$method" = "PUT" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$endpoint")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n -1)
    
    print_result "$test_name" "$expected_code" "$http_code" "$response_body"
    
    # Return response body for further use
    echo "$response_body"
}

# Function to extract ID from JSON response
extract_id() {
    echo "$1" | grep -o '"class_id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_schedule_id() {
    echo "$1" | grep -o '"schedule_id":[0-9]*' | cut -d':' -f2 | head -1
}

extract_booking_id() {
    echo "$1" | grep -o '"booking_id":[0-9]*' | cut -d':' -f2 | head -1
}

# Function to wait for service to be ready
wait_for_service() {
    echo -e "${YELLOW}Waiting for service to be ready...${NC}"
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$BASE_URL/health" > /dev/null 2>&1; then
            echo -e "${GREEN}Service is ready!${NC}"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "\n${RED}Service failed to start within timeout${NC}"
    exit 1
}

# Main test execution
main() {
    echo -e "${CYAN}Class Service API Test Suite${NC}"
    echo -e "${CYAN}=============================${NC}"
    
    # Wait for service
    wait_for_service
    
    # Health check test
    print_test_header "HEALTH CHECK TESTS"
    test_endpoint "GET" "$BASE_URL/health" 200 "Health check"
    
    # Class endpoint tests
    print_test_header "CLASS ENDPOINT TESTS"
    
    # Get all classes (should be empty initially or have sample data)
    test_endpoint "GET" "$API_BASE/classes" 200 "Get all classes"
    
    # Get active classes only
    test_endpoint "GET" "$API_BASE/classes?active=true" 200 "Get active classes"
    
    # Get non-existent class
    test_endpoint "GET" "$API_BASE/classes/999" 404 "Get non-existent class"
    
    # Create a new class
    class_data='{
        "class_name": "Test Yoga",
        "description": "A test yoga class for API testing",
        "duration": 60,
        "capacity": 20,
        "difficulty": "Beginner",
        "is_active": true
    }'
    class_response=$(test_endpoint "POST" "$API_BASE/classes" 201 "Create new class" "$class_data")
    class_id=$(extract_id "$class_response")
    
    # Create another class for testing
    class_data2='{
        "class_name": "Test HIIT",
        "description": "A test HIIT class for API testing",
        "duration": 45,
        "capacity": 15,
        "difficulty": "Advanced",
        "is_active": true
    }'
    class_response2=$(test_endpoint "POST" "$API_BASE/classes" 201 "Create second class" "$class_data2")
    class_id2=$(extract_id "$class_response2")
    
    # Test invalid class creation
    invalid_class_data='{
        "class_name": "",
        "description": "Invalid class",
        "duration": 0,
        "capacity": 0,
        "difficulty": "Invalid",
        "is_active": true
    }'
    test_endpoint "POST" "$API_BASE/classes" 400 "Create invalid class" "$invalid_class_data"
    
    if [ -n "$class_id" ]; then
        # Get the created class
        test_endpoint "GET" "$API_BASE/classes/$class_id" 200 "Get created class"
        
        # Update the class
        update_class_data='{
            "class_name": "Updated Test Yoga",
            "description": "An updated test yoga class",
            "duration": 75,
            "capacity": 25,
            "difficulty": "Intermediate",
            "is_active": true
        }'
        test_endpoint "PUT" "$API_BASE/classes/$class_id" 200 "Update class" "$update_class_data"
        
        # Test invalid class update
        test_endpoint "PUT" "$API_BASE/classes/999" 404 "Update non-existent class" "$update_class_data"
    fi
    
    # Schedule endpoint tests
    print_test_header "SCHEDULE ENDPOINT TESTS"
    
    # Get all schedules
    test_endpoint "GET" "$API_BASE/schedules" 200 "Get all schedules"
    
    # Get active schedules only
    test_endpoint "GET" "$API_BASE/schedules?status=active" 200 "Get active schedules"
    
    # Get non-existent schedule
    test_endpoint "GET" "$API_BASE/schedules/999" 404 "Get non-existent schedule"
    
    if [ -n "$class_id" ]; then
        # Create a new schedule
        schedule_data="{
            \"class_id\": $class_id,
            \"trainer_id\": 1,
            \"room_id\": 1,
            \"start_time\": \"08:00:00\",
            \"end_time\": \"09:00:00\",
            \"day_of_week\": \"Monday\",
            \"status\": \"active\"
        }"
        schedule_response=$(test_endpoint "POST" "$API_BASE/schedules" 201 "Create new schedule" "$schedule_data")
        schedule_id=$(extract_schedule_id "$schedule_response")
        
        # Test invalid schedule creation (non-existent class)
        invalid_schedule_data='{
            "class_id": 999,
            "trainer_id": 1,
            "room_id": 1,
            "start_time": "10:00:00",
            "end_time": "11:00:00",
            "day_of_week": "Tuesday",
            "status": "active"
        }'
        test_endpoint "POST" "$API_BASE/schedules" 400 "Create schedule with invalid class" "$invalid_schedule_data"
        
        # Get schedules for a class
        test_endpoint "GET" "$API_BASE/schedules/class/$class_id" 200 "Get schedules for class"
        
        if [ -n "$schedule_id" ]; then
            # Get the created schedule
            test_endpoint "GET" "$API_BASE/schedules/$schedule_id" 200 "Get created schedule"
            
            # Update the schedule
            update_schedule_data="{
                \"class_id\": $class_id,
                \"trainer_id\": 2,
                \"room_id\": 2,
                \"start_time\": \"09:00:00\",
                \"end_time\": \"10:00:00\",
                \"day_of_week\": \"Tuesday\",
                \"status\": \"active\"
            }"
            test_endpoint "PUT" "$API_BASE/schedules/$schedule_id" 200 "Update schedule" "$update_schedule_data"
        fi
    fi
    
    # Booking endpoint tests
    print_test_header "BOOKING ENDPOINT TESTS"
    
    # Get all bookings
    test_endpoint "GET" "$API_BASE/bookings" 200 "Get all bookings"
    
    # Get bookings with status filter
    test_endpoint "GET" "$API_BASE/bookings?status=booked" 200 "Get booked bookings"
    
    # Get bookings with date filter
    today=$(date +%Y-%m-%d)
    test_endpoint "GET" "$API_BASE/bookings?date=$today" 200 "Get bookings by date"
    
    # Get non-existent booking
    test_endpoint "GET" "$API_BASE/bookings/999" 404 "Get non-existent booking"
    
    if [ -n "$schedule_id" ]; then
        # Create a new booking
        booking_date=$(date -u +%Y-%m-%dT%H:%M:%SZ)
        booking_data="{
            \"schedule_id\": $schedule_id,
            \"member_id\": 1,
            \"booking_date\": \"$booking_date\"
        }"
        booking_response=$(test_endpoint "POST" "$API_BASE/bookings" 201 "Create new booking" "$booking_data")
        booking_id=$(extract_booking_id "$booking_response")
        
        # Test duplicate booking (same member, same schedule)
        test_endpoint "POST" "$API_BASE/bookings" 409 "Create duplicate booking" "$booking_data"
        
        # Test invalid booking creation
        invalid_booking_data='{
            "schedule_id": 999,
            "member_id": 1,
            "booking_date": "2023-12-25T10:00:00Z"
        }'
        test_endpoint "POST" "$API_BASE/bookings" 400 "Create booking with invalid schedule" "$invalid_booking_data"
        
        if [ -n "$booking_id" ]; then
            # Get the created booking
            test_endpoint "GET" "$API_BASE/bookings/$booking_id" 200 "Get created booking"
            
            # Update booking status to attended
            status_update_data='{
                "attendance_status": "attended"
            }'
            test_endpoint "PUT" "$API_BASE/bookings/$booking_id/status" 200 "Update booking status to attended" "$status_update_data"
            
            # Add feedback to booking
            feedback_data='{
                "rating": 5,
                "comment": "Great class! Really enjoyed it."
            }'
            test_endpoint "POST" "$API_BASE/bookings/$booking_id/feedback" 200 "Add feedback to booking" "$feedback_data"
            
            # Test invalid feedback (booking not attended - create new booking first)
            booking_data2="{
                \"schedule_id\": $schedule_id,
                \"member_id\": 2,
                \"booking_date\": \"$booking_date\"
            }"
            booking_response2=$(test_endpoint "POST" "$API_BASE/bookings" 201 "Create second booking" "$booking_data2")
            booking_id2=$(extract_booking_id "$booking_response2")
            
            if [ -n "$booking_id2" ]; then
                test_endpoint "POST" "$API_BASE/bookings/$booking_id2/feedback" 400 "Add feedback to non-attended booking" "$feedback_data"
                
                # Test cancel booking
                test_endpoint "DELETE" "$API_BASE/bookings/$booking_id2" 200 "Cancel booking"
                
                # Test cancel already cancelled booking
                test_endpoint "DELETE" "$API_BASE/bookings/$booking_id2" 400 "Cancel already cancelled booking"
            fi
            
            # Test invalid status update
            invalid_status_data='{
                "attendance_status": "invalid_status"
            }'
            test_endpoint "PUT" "$API_BASE/bookings/$booking_id/status" 400 "Update booking with invalid status" "$invalid_status_data"
        fi
    fi
    
    # Cleanup tests
    print_test_header "CLEANUP TESTS"
    
    # Try to delete schedule (should fail if it has bookings)
    if [ -n "$schedule_id" ]; then
        test_endpoint "DELETE" "$API_BASE/schedules/$schedule_id" 409 "Delete schedule with bookings"
    fi
    
    # Try to delete class (should fail if it has schedules)
    if [ -n "$class_id" ]; then
        test_endpoint "DELETE" "$API_BASE/classes/$class_id" 409 "Delete class with schedules"
    fi
    
    # Delete non-existent resources
    test_endpoint "DELETE" "$API_BASE/bookings/999" 404 "Delete non-existent booking"
    test_endpoint "DELETE" "$API_BASE/schedules/999" 404 "Delete non-existent schedule"
    test_endpoint "DELETE" "$API_BASE/classes/999" 404 "Delete non-existent class"
    
    # Test invalid IDs
    test_endpoint "GET" "$API_BASE/classes/invalid" 400 "Get class with invalid ID"
    test_endpoint "GET" "$API_BASE/schedules/invalid" 400 "Get schedule with invalid ID"
    test_endpoint "GET" "$API_BASE/bookings/invalid" 400 "Get booking with invalid ID"
    
    # Final results
    print_test_header "TEST SUMMARY"
    echo -e "${CYAN}Total Tests: $TOTAL_TESTS${NC}"
    echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
    echo -e "${RED}Failed: $FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "\n${RED}❌ Some tests failed. Please check the output above.${NC}"
        exit 1
    fi
}

# Check if service URL is provided as argument
if [ $# -eq 1 ]; then
    BASE_URL="$1"
    API_BASE="${BASE_URL}/api/v1"
fi

# Run the tests
main
