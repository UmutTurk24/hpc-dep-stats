#!/bin/bash

# Docker Testing Script for HPC Resource Dashboard
set -e

echo "🐳 Testing Docker Configuration..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Test 1: Build development image
echo "Building development Docker image..."
if docker build -f Dockerfile.dev -t hpc-dashboard:dev .; then
    print_status "Development image built successfully"
else
    print_error "Failed to build development image"
    exit 1
fi

# Test 2: Build production image
echo "Building production Docker image..."
if docker build -f Dockerfile -t hpc-dashboard:prod .; then
    print_status "Production image built successfully"
else
    print_error "Failed to build production image"
    exit 1
fi

# Test 3: Test development container
echo "Testing development container..."
DEV_CONTAINER=$(docker run -d -p 3000:3000 hpc-dashboard:dev)
sleep 10

if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    print_status "Development container is running and accessible"
else
    print_error "Development container is not accessible"
    docker logs $DEV_CONTAINER
    docker stop $DEV_CONTAINER
    exit 1
fi

docker stop $DEV_CONTAINER
docker rm $DEV_CONTAINER

# Test 4: Test production container
echo "Testing production container..."
PROD_CONTAINER=$(docker run -d -p 8080:8080 hpc-dashboard:prod)
sleep 10

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    print_status "Production container health endpoint is working"
else
    print_error "Production container health endpoint failed"
    docker logs $PROD_CONTAINER
    docker stop $PROD_CONTAINER
    exit 1
fi

# Test main page
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    print_status "Production container main page is accessible"
else
    print_error "Production container main page failed"
    docker logs $PROD_CONTAINER
    docker stop $PROD_CONTAINER
    exit 1
fi

# Test response time
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8080/)
if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    print_status "Response time is acceptable: ${RESPONSE_TIME}s"
else
    print_warning "Response time is slow: ${RESPONSE_TIME}s"
fi

docker stop $PROD_CONTAINER
docker rm $PROD_CONTAINER

# Test 5: Test docker-compose
echo "Testing docker-compose configuration..."
if docker-compose --profile prod up -d; then
    print_status "Docker-compose started successfully"
    sleep 30
    
    if curl -f http://localhost:8080/health > /dev/null 2>&1; then
        print_status "Docker-compose service is healthy"
    else
        print_error "Docker-compose service is not healthy"
        docker-compose --profile prod logs
        docker-compose --profile prod down
        exit 1
    fi
    
    docker-compose --profile prod down
else
    print_error "Failed to start docker-compose"
    exit 1
fi

# Test 6: Image size check
echo "Checking image sizes..."
DEV_SIZE=$(docker images hpc-dashboard:dev --format "{{.Size}}")
PROD_SIZE=$(docker images hpc-dashboard:prod --format "{{.Size}}")

print_status "Development image size: $DEV_SIZE"
print_status "Production image size: $PROD_SIZE"

# Test 7: Security scan
echo "Running basic security checks..."
if command -v trivy &> /dev/null; then
    echo "Running Trivy security scan..."
    trivy image hpc-dashboard:prod --severity HIGH,CRITICAL --exit-code 0 || print_warning "Security vulnerabilities found (non-blocking)"
else
    print_warning "Trivy not installed, skipping security scan"
fi

print_status "All Docker tests completed successfully! 🎉"


