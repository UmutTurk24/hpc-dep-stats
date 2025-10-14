#!/bin/bash

# Local Testing Script for HPC Resource Dashboard (without Docker)
set -e

echo "🧪 Testing HPC Resource Dashboard Locally..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or later is required. Current version: $(node --version)"
    exit 1
fi

print_status "Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "npm version: $(npm --version)"

# Test 1: Install dependencies
echo "Installing dependencies..."
if npm ci; then
    print_status "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Test 2: Run linting
echo "Running ESLint..."
if npm run lint; then
    print_status "ESLint passed"
else
    print_error "ESLint failed"
    exit 1
fi

# Test 3: TypeScript check
echo "Running TypeScript check..."
if npx tsc --noEmit; then
    print_status "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Test 4: Build application
echo "Building application..."
if npm run build; then
    print_status "Application built successfully"
else
    print_error "Build failed"
    exit 1
fi

# Test 5: Check build output
if [ -d "dist" ]; then
    print_status "Build output directory exists"
    
    # Check for essential files
    if [ -f "dist/index.html" ]; then
        print_status "index.html generated"
    else
        print_error "index.html not found in build output"
        exit 1
    fi
    
    if [ -f "dist/assets/index.js" ] || [ -f "dist/assets/index.css" ]; then
        print_status "Assets generated"
    else
        print_warning "Assets not found in expected location"
    fi
else
    print_error "Build output directory not found"
    exit 1
fi

# Test 6: Test development server (background)
echo "Starting development server for testing..."
npm run dev &
DEV_PID=$!

# Wait for server to start
sleep 10

# Test if server is running
if curl -f http://localhost:3000/ > /dev/null 2>&1; then
    print_status "Development server is running and accessible"
    
    # Test if the application loads
    RESPONSE=$(curl -s http://localhost:3000/)
    if echo "$RESPONSE" | grep -q "HPC Resource Dashboard"; then
        print_status "Application loads correctly"
    else
        print_error "Application failed to load properly"
        kill $DEV_PID 2>/dev/null || true
        exit 1
    fi
    
    # Test response time
    RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:3000/)
    if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l 2>/dev/null || echo "1") )); then
        print_status "Response time is acceptable: ${RESPONSE_TIME}s"
    else
        print_warning "Response time is slow: ${RESPONSE_TIME}s"
    fi
    
else
    print_error "Development server is not accessible"
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

# Test 7: Test persistence functionality
echo "Testing persistence functionality..."
# This would require a browser automation tool like Puppeteer or Playwright
# For now, we'll just check if the persistence utilities are built correctly
if grep -q "localStorage" dist/assets/*.js 2>/dev/null; then
    print_status "Persistence code is included in build"
else
    print_warning "Persistence code not found in build (may be minified)"
fi

# Test 8: Security check
echo "Running security audit..."
if npm audit --audit-level=moderate; then
    print_status "No high-severity vulnerabilities found"
else
    print_warning "Security vulnerabilities found (check output above)"
fi

# Test 9: Bundle size check
echo "Checking bundle size..."
if [ -f "dist/assets/index.js" ]; then
    BUNDLE_SIZE=$(du -h dist/assets/index.js | cut -f1)
    print_status "Bundle size: $BUNDLE_SIZE"
    
    # Check if bundle is reasonable size (less than 1MB)
    BUNDLE_SIZE_BYTES=$(stat -f%z dist/assets/index.js 2>/dev/null || stat -c%s dist/assets/index.js 2>/dev/null || echo "0")
    if [ "$BUNDLE_SIZE_BYTES" -lt 1048576 ]; then
        print_status "Bundle size is reasonable"
    else
        print_warning "Bundle size is large: $BUNDLE_SIZE"
    fi
fi

# Cleanup
echo "Stopping development server..."
kill $DEV_PID 2>/dev/null || true
sleep 2

# Test 10: Test production preview
echo "Testing production preview..."
npm run preview &
PREVIEW_PID=$!
sleep 5

if curl -f http://localhost:4173/ > /dev/null 2>&1; then
    print_status "Production preview is working"
    
    # Test production build
    RESPONSE=$(curl -s http://localhost:4173/)
    if echo "$RESPONSE" | grep -q "HPC Resource Dashboard"; then
        print_status "Production build loads correctly"
    else
        print_error "Production build failed to load properly"
        kill $PREVIEW_PID 2>/dev/null || true
        exit 1
    fi
else
    print_error "Production preview is not accessible"
    kill $PREVIEW_PID 2>/dev/null || true
    exit 1
fi

# Cleanup
kill $PREVIEW_PID 2>/dev/null || true

# Test 11: File structure check
echo "Checking project structure..."
REQUIRED_FILES=(
    "package.json"
    "vite.config.ts"
    "tailwind.config.js"
    "tsconfig.json"
    "src/main.tsx"
    "src/App.tsx"
    "src/index.css"
    "Dockerfile"
    "docker-compose.yml"
    ".github/workflows/ci.yml"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_status "Found: $file"
    else
        print_error "Missing: $file"
        exit 1
    fi
done

# Test 12: Environment check
echo "Checking environment..."
print_info "Operating System: $(uname -s)"
print_info "Architecture: $(uname -m)"
print_info "Shell: $SHELL"
print_info "Working Directory: $(pwd)"

# Summary
echo ""
print_status "All local tests completed successfully! 🎉"
echo ""
print_info "To run the application:"
print_info "  Development: npm run dev"
print_info "  Production:  npm run build && npm run preview"
echo ""
print_info "To test with Docker (when available):"
print_info "  Development: docker-compose --profile dev up"
print_info "  Production:  docker-compose --profile prod up"
