#!/bin/bash

# Deployment script for Zep Metaverse

echo "🚀 Starting deployment..."

# Build all applications
echo "📦 Building all applications..."
pnpm run build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start new containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ API server is running on port 4000"
else
    echo "❌ API server failed to start"
    exit 1
fi

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on port 3000"
else
    echo "❌ Frontend failed to start"
    exit 1
fi

if curl -f http://localhost:5173 > /dev/null 2>&1; then
    echo "✅ Client app is running on port 5173"
else
    echo "❌ Client app failed to start"
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🎮 Client App: http://localhost:5173"
echo "🔧 API: http://localhost:4000"
echo "🌐 WebSocket: ws://localhost:8080"
