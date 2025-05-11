#!/bin/bash

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${MAGENTA}==========================================\033[0m"
echo -e "${MAGENTA}      STOPPING ALL SERVICES             \033[0m"
echo -e "${MAGENTA}==========================================\033[0m"

services=("member-service" "staff-service" "payment-service" "facility-service" "class-service")

for service in "${services[@]}"; do
    echo -e "${BLUE}===\033[0m ${CYAN}Stopping $service\033[0m ${BLUE}===\033[0m"
    if [ -d "$service" ]; then
        cd "$service"
        if docker-compose down &> /dev/null; then
            echo -e "${GREEN}✓ $service stopped successfully\033[0m"
        else
            echo -e "${YELLOW}→ $service might already be stopped\033[0m"
        fi
        cd ..
    else
        echo -e "${YELLOW}→ $service directory not found\033[0m"
    fi
done

echo -e "${GREEN}All services stopped\033[0m"
