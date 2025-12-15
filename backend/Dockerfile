# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY nest-cli.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Python + pdfplumber for PDF parsing
ENV PIP_BREAK_SYSTEM_PACKAGES=1
RUN apk add --no-cache python3 py3-pip py3-pillow && \
  pip3 install --no-cache-dir --break-system-packages pdfplumber

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

# Create uploads directory and reports subdirectory
RUN mkdir -p uploads/reports

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "dist/main.js"]
