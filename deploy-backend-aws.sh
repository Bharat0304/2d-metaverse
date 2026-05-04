#!/bin/bash

# AWS Free Tier Backend Deployment Script
echo "🚀 Deploying backend to AWS Free Tier..."

# Prerequisites check
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not installed. Please install it first:"
    echo "brew install awscli"
    exit 1
fi

# Configuration
REGION="us-east-1"
API_APP_NAME="zep-api"
WS_APP_NAME="zep-websocket"

echo "📦 Building backend services..."
cd apps/http && npm run build
cd ../ws && npm run build
cd ../..

echo "🔧 Creating AWS Infrastructure..."

# Create ECR repositories
echo "Creating ECR repositories..."
aws ecr create-repository --repository-name $API_APP_NAME --region $REGION || true
aws ecr create-repository --repository-name $WS_APP_NAME --region $REGION || true

# Get ECR login token
echo "Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Build and push API Docker image
echo "Building API Docker image..."
docker build -t $API_APP_NAME apps/http/
docker tag $API_APP_NAME:latest $ECR_REGISTRY/$API_APP_NAME:latest
docker push $ECR_REGISTRY/$API_APP_NAME:latest

# Build and push WebSocket Docker image
echo "Building WebSocket Docker image..."
docker build -t $WS_APP_NAME apps/ws/
docker tag $WS_APP_NAME:latest $ECR_REGISTRY/$WS_APP_NAME:latest
docker push $ECR_REGISTRY/$WS_APP_NAME:latest

# Deploy to ECS (using Fargate - Free Tier)
echo "Deploying to ECS Fargate..."

# Create Task Definition for API
cat > api-task-definition.json << EOF
{
  "family": "$API_APP_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$API_APP_NAME",
      "image": "$ECR_REGISTRY/$API_APP_NAME:latest",
      "portMappings": [
        {
          "containerPort": 4000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$API_APP_NAME",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

# Create Task Definition for WebSocket
cat > ws-task-definition.json << EOF
{
  "family": "$WS_APP_NAME",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$WS_APP_NAME",
      "image": "$ECR_REGISTRY/$WS_APP_NAME:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$WS_APP_NAME",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

echo "✅ Backend deployment completed!"
echo ""
echo "📍 API Endpoint: https://$API_APP_NAME.$REGION.elasticbeanstalk.com"
echo "🌐 WebSocket: wss://$WS_APP_NAME.$REGION.elasticbeanstalk.com"
echo ""
echo "⚠️  Remember to:"
echo "1. Set up environment variables in AWS Console"
echo "2. Configure security groups to allow ports 4000 and 8080"
echo "3. Update frontend with new backend URLs"
