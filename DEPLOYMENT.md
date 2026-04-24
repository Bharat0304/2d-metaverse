# Deployment Guide for Zep Metaverse

## Overview

This project is a Turborepo monorepo with the following services:
- **Frontend**: Next.js app (port 3000)
- **Client**: Vite/React app (port 5173)  
- **API**: Express HTTP server (port 4000)
- **WebSocket**: WebSocket server (port 8080)
- **Database**: PostgreSQL (port 5432)

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Database connection string
- JWT secrets
- Discord bot tokens (if using)
- NextAuth configuration

### 2. Local Deployment

Build and run all services:
```bash
./deploy.sh
```

Or manually:
```bash
# Build all apps
pnpm run build

# Start with Docker Compose
docker-compose up --build -d
```

### 3. Access Your Apps

- **Frontend**: http://localhost:3000
- **Client App**: http://localhost:5173
- **API**: http://localhost:4000
- **WebSocket**: ws://localhost:8080

## Production Deployment

### Option 1: Vercel (Recommended for Frontend)

1. Deploy frontend to Vercel:
   ```bash
   cd apps/frontend
   vercel --prod
   ```

2. Update environment variables in Vercel dashboard with your production API URLs

### Option 2: Docker Cloud Services

For full-stack deployment:

1. **DigitalOcean App Platform**:
   - Use the provided Docker Compose configuration
   - Set up managed PostgreSQL database
   - Deploy all containers

2. **AWS ECS**:
   - Push Docker images to ECR
   - Deploy using ECS with Fargate
   - Use RDS for PostgreSQL

3. **Google Cloud Run**:
   - Containerize each service
   - Deploy to Cloud Run
   - Use Cloud SQL for database

### Option 3: Traditional VPS

1. **Server Setup**:
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy**:
   ```bash
   git clone <your-repo>
   cd zep
   cp .env.example .env
   # Edit .env with production values
   ./deploy.sh
   ```

## Environment Variables

### Required for all environments:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `NODE_ENV`: Set to `production`

### Frontend specific:
- `NEXTAUTH_SECRET`: Next.js authentication secret
- `NEXTAUTH_URL`: Your deployed frontend URL
- `NEXT_PUBLIC_API_URL`: API server URL
- `NEXT_PUBLIC_WS_URL`: WebSocket server URL

### Optional:
- `DISCORD_BOT_TOKEN`: Discord bot token
- `DISCORD_CLIENT_ID`: Discord application ID
- `DISCORD_CLIENT_SECRET`: Discord application secret

## Database Setup

### Local Development
```bash
# Start PostgreSQL
docker-compose up postgres -d

# Run migrations (if you have them)
cd packages/db
pnpm run migrate
```

### Production
- Use managed PostgreSQL service (recommended)
- Or self-hosted PostgreSQL on your server
- Update `DATABASE_URL` accordingly

## Monitoring

Check service status:
```bash
docker-compose ps
docker-compose logs -f
```

Health checks:
```bash
curl http://localhost:4000  # API
curl http://localhost:3000  # Frontend
curl http://localhost:5173  # Client
```

## Troubleshooting

### Common Issues:

1. **Port conflicts**: Ensure ports 3000, 4000, 5173, 8080, 5432 are available
2. **Database connection**: Verify DATABASE_URL is correct and database is running
3. **Build failures**: Check `pnpm run build` works locally first
4. **Permission issues**: Ensure Docker has proper permissions

### Reset Everything:
```bash
docker-compose down -v
docker system prune -f
./deploy.sh
```

## Security Notes

- Change all default secrets and passwords
- Use HTTPS in production
- Set up proper CORS origins
- Configure firewall rules
- Regular security updates
