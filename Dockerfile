# Stage 1: Build
# Switched from alpine to slim to fix "Exit handler never called" npm crash
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# 1. Set registry to HTTP to bypass potential SSL handshake hangs (common cause of stalls)
# 2. Disable strict SSL to prevent certificate verification hangs
# 3. Use verbose logging so we can see progress instead of a silent freeze
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm install --verbose

# Copy the rest of the app code
COPY . .

# Build the app (Vite)
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build output from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]