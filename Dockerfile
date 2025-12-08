FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Install and build backend dependencies
WORKDIR /app/backend
RUN npm install --production=false

# Build backend
RUN npm run build

# Set working directory back to app root
WORKDIR /app

# Expose port
EXPOSE 3001

# Start the backend
CMD ["node", "backend/dist/main.js"]
