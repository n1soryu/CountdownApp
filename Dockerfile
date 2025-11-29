# Stage 1: Build
# Switched from alpine to slim to fix "Exit handler never called" npm crash
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# 1. We are on node:20-slim (Debian), so the default npm is stable.
# 2. We removed 'npm install -g npm@latest' which was causing DNS timeouts (EAI_AGAIN).
# 3. We do NOT set NODE_ENV=production here yet, because we need 'vite' (a devDependency) to build.
RUN npm install

# Copy the rest of the app code
COPY . .

# Build the app (Vite)
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy the build output from the previous stage
# Note: Ensure your vite config outputs to 'dist'. If it outputs to 'build', change this path.
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
