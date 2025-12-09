# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies for both apps
RUN npm ci --prefix backend
RUN npm ci --prefix frontend

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build frontend with API proxy baked in
ARG API_PORT=3001
ENV API_PORT=${API_PORT}
ARG API_PROXY_TARGET=http://127.0.0.1:${API_PORT}
ENV API_PROXY_TARGET=${API_PROXY_TARGET}
ENV NEXT_PUBLIC_API_URL=/api/v1
RUN npm run build --prefix frontend

# Build backend
RUN npm run build --prefix backend

# Runtime image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=3001
ENV HOSTNAME=0.0.0.0

# Backend runtime files
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package*.json ./backend/

# Frontend standalone output
COPY --from=builder /app/frontend/.next/standalone ./frontend
COPY --from=builder /app/frontend/.next/static ./frontend/.next/static
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/package*.json ./frontend/

# Startup script to run both servers
COPY scripts/start.sh ./scripts/start.sh
RUN chmod +x ./scripts/start.sh

EXPOSE 3000

CMD ["./scripts/start.sh"]
