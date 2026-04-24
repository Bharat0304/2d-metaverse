FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY ../../package.json ../../pnpm-lock.yaml ./
COPY ../../packages/db/package.json ../../packages/db/

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .
COPY ../../packages/db ../../packages/db

# Build the application
RUN pnpm run build

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "dist/index.js"]
