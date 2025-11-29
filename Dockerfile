# Stage 1: Build
# Switched from alpine to slim to fix "Exit handler never called" npm crash
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# 1. Force IPv4 at the Node.js level using NODE_OPTIONS (Correct fix for Node 20+)
# 2. This prevents EAI_AGAIN/DNS errors without breaking npm config syntax
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# 1. registry=http: Bypass SSL handshake latency
# 2. strict-ssl=false: Prevent cert errors
# 3. Retries: Handle temporary network blips
RUN npm config set registry http://registry.npmjs.org/ && \
    npm config set strict-ssl false && \
    npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
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