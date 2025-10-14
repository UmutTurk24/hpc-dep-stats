#!/bin/bash

# Kubernetes Testing Script for HPC Resource Dashboard
set -e

echo "☸️  Testing Kubernetes Configuration..."

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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we can connect to a cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi

print_status "Connected to Kubernetes cluster"

# Test 1: Validate YAML files
echo "Validating Kubernetes YAML files..."
for file in k8s/*.yaml; do
    if kubectl apply --dry-run=client -f "$file" > /dev/null 2>&1; then
        print_status "Validated: $(basename "$file")"
    else
        print_error "Invalid YAML: $(basename "$file")"
        exit 1
    fi
done

# Test 2: Create namespace
echo "Creating namespace..."
if kubectl apply -f k8s/namespace.yaml; then
    print_status "Namespace created successfully"
else
    print_error "Failed to create namespace"
    exit 1
fi

# Test 3: Apply ConfigMap
echo "Applying ConfigMap..."
if kubectl apply -f k8s/configmap.yaml; then
    print_status "ConfigMap applied successfully"
else
    print_error "Failed to apply ConfigMap"
    exit 1
fi

# Test 4: Apply Deployment
echo "Applying Deployment..."
if kubectl apply -f k8s/deployment.yaml; then
    print_status "Deployment applied successfully"
else
    print_error "Failed to apply Deployment"
    exit 1
fi

# Test 5: Apply Service
echo "Applying Service..."
if kubectl apply -f k8s/service.yaml; then
    print_status "Service applied successfully"
else
    print_error "Failed to apply Service"
    exit 1
fi

# Test 6: Wait for deployment to be ready
echo "Waiting for deployment to be ready..."
if kubectl wait --for=condition=available --timeout=300s deployment/hpc-dashboard -n hpc-dashboard; then
    print_status "Deployment is ready"
else
    print_error "Deployment failed to become ready"
    kubectl describe deployment hpc-dashboard -n hpc-dashboard
    kubectl logs -l app=hpc-dashboard -n hpc-dashboard
    exit 1
fi

# Test 7: Check pod status
echo "Checking pod status..."
PODS=$(kubectl get pods -l app=hpc-dashboard -n hpc-dashboard --no-headers | wc -l)
READY_PODS=$(kubectl get pods -l app=hpc-dashboard -n hpc-dashboard --no-headers | grep "Running" | wc -l)

if [ "$PODS" -gt 0 ] && [ "$READY_PODS" -eq "$PODS" ]; then
    print_status "All pods are running ($READY_PODS/$PODS)"
else
    print_error "Not all pods are running ($READY_PODS/$PODS)"
    kubectl get pods -l app=hpc-dashboard -n hpc-dashboard
    exit 1
fi

# Test 8: Port forward and test application
echo "Testing application via port forward..."
kubectl port-forward -n hpc-dashboard service/hpc-dashboard-service 8080:80 &
PORT_FORWARD_PID=$!

# Wait for port forward to be ready
sleep 5

# Test health endpoint
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    print_status "Application health endpoint is working"
else
    print_error "Application health endpoint failed"
    kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi

# Test main page
if curl -f http://localhost:8080/ > /dev/null 2>&1; then
    print_status "Application main page is accessible"
else
    print_error "Application main page failed"
    kill $PORT_FORWARD_PID 2>/dev/null || true
    exit 1
fi

# Clean up port forward
kill $PORT_FORWARD_PID 2>/dev/null || true

# Test 9: Test HPA (if metrics server is available)
echo "Testing Horizontal Pod Autoscaler..."
if kubectl apply -f k8s/hpa.yaml; then
    print_status "HPA applied successfully"
    
    # Check if HPA is working
    sleep 10
    HPA_STATUS=$(kubectl get hpa hpc-dashboard-hpa -n hpc-dashboard --no-headers | awk '{print $4}')
    if [ "$HPA_STATUS" = "<unknown>" ] || [ "$HPA_STATUS" = "0%" ]; then
        print_warning "HPA is not receiving metrics (metrics server may not be installed)"
    else
        print_status "HPA is working: $HPA_STATUS"
    fi
else
    print_warning "HPA failed to apply (metrics server may not be available)"
fi

# Test 10: Resource usage check
echo "Checking resource usage..."
kubectl top pods -l app=hpc-dashboard -n hpc-dashboard || print_warning "Metrics not available (metrics server not installed)"

# Test 11: Cleanup (optional)
read -p "Do you want to clean up the test resources? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Cleaning up test resources..."
    kubectl delete -f k8s/ --ignore-not-found=true
    print_status "Cleanup completed"
else
    print_status "Test resources left running for manual inspection"
    echo "To clean up later, run: kubectl delete -f k8s/"
fi

print_status "All Kubernetes tests completed successfully! 🎉"


