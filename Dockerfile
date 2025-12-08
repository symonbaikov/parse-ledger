FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Build frontend
WORKDIR /app/frontend
RUN npm install --production=false
RUN npm run build

# Install dependencies for backend
WORKDIR /app/backend
RUN npm install --production=false

# Build backend
RUN npm run build

# Copy frontend build to backend public folder
RUN mkdir -p dist/public && cp -r /app/frontend/.next/standalone/public dist/public || true
RUN mkdir -p dist/public && cp -r /app/frontend/public dist/public || true

# Set working directory to backend
WORKDIR /app/backend

# Expose port
EXPOSE 3001

# Start the backend
CMD ["node", "dist/main.js"]
