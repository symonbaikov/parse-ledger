FROM node:20-alpine

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy backend and frontend
COPY backend ./backend
COPY frontend ./frontend

# Build frontend first
WORKDIR /app/frontend
RUN npm install --production=false
RUN npm run build

# Build backend
WORKDIR /app/backend
RUN npm install --production=false
RUN npm run build

# Copy frontend build to backend public folder
RUN mkdir -p dist/public && \
    cp -r /app/frontend/.next/standalone dist/public/.next 2>/dev/null || true && \
    cp -r /app/frontend/public dist/public/static 2>/dev/null || true

# Expose port
EXPOSE 3001

# Start the backend
CMD ["node", "dist/main.js"]
