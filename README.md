# 🌀 Vortex



### **A pixel-perfect multiplayer world where your avatar is always live.**
*Like Gather Town or ZEP — but built for real gamers.*

Vortex is a cutting-edge, real-time 2D metaverse platform designed for immersive virtual interactions. Built with a focus on performance, scalability, and seamless user experience, Vortex allows users to explore dynamic spaces, interact with others through proximity-based communication, and customize their virtual presence.

---

### 📊 Live Stats
| Online Now | Worlds Live | Avg Ping | Max Rank |
| :--- | :--- | :--- | :--- |
| **24,891** | **183** | **8ms** | **LV.99** |

---


## ✨ Features

- **Real-time Multiplayer**: Powered by WebSockets for low-latency player movement and interactions.
- **Proximity-Based Interaction**: Experience natural social interactions where users can see and talk to those nearby.
- **Dynamic Virtual Spaces**: Create and join custom rooms with unique maps and layouts.
- **Integrated Authentication**: Secure sign-in using NextAuth with support for Google and other providers.
- **Immersive 2D Graphics**: Built using the Phaser game engine for smooth, responsive visuals.
- **Robust Backend**: A scalable microservices architecture featuring dedicated HTTP and WebSocket servers.

## 🛠️ Tech Stack

Vortex leverages a modern, full-stack technologies to deliver a premium experience:

- **Frontend**: [Next.js](https://nextjs.org/), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Game Engine**: [Phaser 3](https://phaser.io/)
- **Real-time Networking**: [Socket.io](https://socket.io/), [Colyseus.js](https://colyseus.io/)
- **Communication**: [PeerJS](https://peerjs.com/) (WebRTC) for proximity voice/video
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Monorepo Management**: [Turborepo](https://turbo.build/repo)
- **Deployment**: AWS, Render, Docker

## 📂 Project Structure

This project is a monorepo managed by Turborepo:

```text
.
├── apps
│   ├── frontend     # Next.js web application
│   ├── http         # REST API for metadata and room management
│   ├── ws           # WebSocket server for real-time state
│   └── client       # Phaser-based game client logic
├── packages
│   ├── db           # Shared Prisma schema and database client
│   ├── ui           # Shared React component library
│   ├── eslint-config # Shared linting configuration
│   └── typescript-config # Shared TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x recommended)
- [pnpm](https://pnpm.io/) (v9.x)
- [Docker](https://www.docker.com/) (optional, for local database)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/vortex.git
   cd vortex
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Set up Environment Variables**:
   Create `.env` files in `apps/http`, `apps/ws`, and `apps/frontend` based on the provided `.env.example` files.

4. **Initialize the Database**:
   ```bash
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push
   ```

5. **Run in Development Mode**:
   From the root directory:
   ```bash
   pnpm dev
   ```

## 🚢 Deployment

Vortex is designed to be easily deployable using Docker.

- Use `docker-compose.yml` to spin up the entire stack locally or in production.
- Scripts for AWS and DigitalOcean deployment are available in the root: `deploy-backend-aws.sh`, `deploy-backend-docean.sh`.



