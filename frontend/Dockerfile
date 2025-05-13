# Stage 1: Build the Vue.js application
FROM node:20-alpine AS builder
LABEL stage=frontend-builder

WORKDIR /app

# Declare build arguments that can be passed from docker-compose.yml
ARG VITE_API_BASE_URL_BUILD
ARG NODE_ENV_BUILD=production # Default to production if not set

# Set them as environment variables for the build process
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL_BUILD}
ENV NODE_ENV=${NODE_ENV_BUILD}

COPY package*.json ./

# Install production dependencies and build tools needed for the build
# Using npm ci for deterministic builds if package-lock.json is present and reliable
RUN npm ci --include=dev

# Copy the rest of the application code
COPY . .

# Build the application for production
# Ensure your package.json build script creates a production-ready build
RUN npm run build

# Stage 2: Serve the application with Nginx (Production)
FROM nginx:1.25-alpine AS server
LABEL stage=frontend-server

# Remove default Nginx configuration
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom production Nginx configuration
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy built assets from the builder stage's dist directory
COPY --from=builder /app/dist .

# Nginx will listen on 80 and 443 as per nginx.prod.conf
# Ports are exposed in docker-compose.yml
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 