#!/bin/bash

# DigitalOcean Free Tier Backend Deployment Script
echo "🚀 Deploying backend to DigitalOcean..."

# Prerequisites check
if ! command -v doctl &> /dev/null; then
    echo "❌ DigitalOcean CLI not installed. Please install it first:"
    echo "brew install doctl"
    exit 1
fi

# Configuration
REGION="nyc1"
SIZE="s-1vcpu-1gb" # Free tier eligible
API_APP_NAME="zep-api"
WS_APP_NAME="zep-websocket"

echo "📦 Building backend services..."
cd apps/http && npm run build
cd ../ws && npm run build
cd ../..

echo "🔧 Creating DigitalOcean resources..."

# Create Docker registry
echo "Setting up Docker registry..."
doctl registry create || true

# Get registry info
REGISTRY=$(doctl registry get)
echo "Registry: $REGISTRY"

# Login to registry
echo "Logging into DigitalOcean registry..."
docker login -u $(doctl auth init) -p $(doctl auth token) $REGISTRY

# Build and push API Docker image
echo "Building API Docker image..."
docker build -t $REGISTRY/$API_APP_NAME:latest apps/http/
docker push $REGISTRY/$API_APP_NAME:latest

# Build and push WebSocket Docker image
echo "Building WebSocket Docker image..."
docker build -t $REGISTRY/$WS_APP_NAME:latest apps/ws/
docker push $REGISTRY/$WS_APP_NAME:latest

# Create App Platform apps
echo "Deploying to App Platform..."

# API App
cat > api-app-spec.yaml << EOF
name: $API_APP_NAME
services:
- name: api
  source_dir: /app
  dockerfile_path: /app/Dockerfile
  source:
    type: image
    image:
      registry_type: DOCKER_HUB
      registry: $REGISTRY
      repository: $API_APP_NAME
      tag: latest
  http_port: 4000
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: \${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "15"
  size: db-s-dev-database
EOF

# WebSocket App
cat > ws-app-spec.yaml << EOF
name: $WS_APP_NAME
services:
- name: websocket
  source_dir: /app
  dockerfile_path: /app/Dockerfile
  source:
    type: image
    image:
      registry_type: DOCKER_HUB
      registry: $REGISTRY
      repository: $WS_APP_NAME
      tag: latest
  http_port: 8080
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: \${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "15"
  size: db-s-dev-database
EOF

echo "Deploying API app..."
doctl apps create --spec api-app-spec.yaml

echo "Deploying WebSocket app..."
doctl apps create --spec ws-app-spec.yaml

echo "✅ Backend deployment completed!"
echo ""
echo "⏳ Waiting for deployment to complete..."
sleep 30

# Get deployed URLs
API_URL=$(doctl apps list --format "{{.Spec.Name}},{{.LiveURL}}" | grep $API_APP_NAME | cut -d',' -f2)
WS_URL=$(doctl apps list --format "{{.Spec.Name}},{{.LiveURL}}" | grep $WS_APP_NAME | cut -d',' -f2)

echo ""
echo "📍 API Endpoint: https://$API_URL"
echo "🌐 WebSocket: wss://$WS_URL"
echo ""
echo "⚠️  Remember to:"
echo "1. Set environment variables in DigitalOcean App Platform"
echo "2. Configure CORS for your frontend domain"
echo "3. Update frontend with new backend URLs"
