# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Set the environment variable to force IPv4
# This is the cleanest way to fix the EAI_AGAIN/DNS timeout errors
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Copy ONLY package files first
COPY package.json package-lock.json ./

# 'npm ci' is stricter and cleaner than 'npm install'. 
# It deletes existing node_modules (if any) and installs exactly what's in package-lock.json.
# It is also generally lighter on memory.
RUN npm ci

# Copy the rest of the application
# (Since we added .dockerignore, this won't overwrite node_modules with local junk)
COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Add this line to copy your custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]