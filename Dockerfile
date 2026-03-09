FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Install frontend dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy front-end source and build it
COPY index.html vite.config.js ./
COPY src/ ./src/
COPY public/ ./public/
RUN npm run build

# Backend Builder / Runner
FROM node:20-alpine AS final
WORKDIR /app

# Copy built frontend
COPY --from=frontend-builder /app/dist ./dist

# Install backend dependencies
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev

# Copy backend source
COPY server/ ./

# Expose the API and Web server port
EXPOSE 3000

# Run the server
CMD ["node", "server.js"]
