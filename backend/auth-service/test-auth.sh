#!/bin/bash

# Auth Service Test Script
# This script is used to test the auth service

BASE_URL="http://localhost:8085"
AUTH_URL="$BASE_URL/api/v1"

echo "🔐 Auth Service Test Script"
echo "=========================="

# Health check
echo ""
echo "1. Health Check..."
HEALTH_RESPONSE=$(curl -s "$BASE_URL/health")
echo "Health Response: $HEALTH_RESPONSE"

# Login process
echo ""
echo "2. Admin login..."
LOGIN_RESPONSE=$(curl -s -X POST "$AUTH_URL/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Token could not be obtained! Login failed."
    exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:50}..."

# Test access to protected endpoint with token
echo ""
echo "3. Testing protected endpoint with token..."

# Example request to member service
echo ""
echo "Member Service test..."
curl -s -H "Authorization: Bearer $TOKEN" "$AUTH_URL/members" || echo "Member service access tested"

# Example request to class service
echo ""
echo "Class Service test..."
curl -s -H "Authorization: Bearer $TOKEN" "$AUTH_URL/classes" || echo "Class service access tested"

echo ""
echo "🎉 Test tamamlandı!"
echo ""
echo "Kullanım Örnekleri:"
echo "==================="
echo "Login:"
echo "curl -X POST $AUTH_URL/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin\"}'"
echo ""
echo "Korumalı endpoint'e erişim:"
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' $AUTH_URL/members"
