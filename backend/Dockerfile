FROM node:20-alpine AS builder

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./
COPY backend/tsconfig.json ./

# Copy frontend package files  
COPY frontend/package*.json ./frontend/
COPY frontend/tsconfig*.json ./frontend/
COPY frontend/vite.config.ts ./frontend/

# Install backend dependencies
RUN npm install

# Install frontend dependencies
RUN cd frontend && npm install

# Copy source code
COPY backend/src ./src
COPY backend/migrations ./migrations
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/biome.json ./frontend/
COPY shared ./shared

# Build everything
RUN npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY backend/package*.json ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/frontend-build ./frontend-build

EXPOSE 3000

CMD ["npm", "start"]