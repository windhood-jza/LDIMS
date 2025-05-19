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

# 调试：打印环境变量
RUN echo "---> Dockerfile: VITE_API_BASE_URL in Docker build is: $VITE_API_BASE_URL"
RUN echo "---> Dockerfile: NODE_ENV in Docker build is: $NODE_ENV"

# 1. 复制所有 package.json 和 lock 文件到对应目录结构
# COPY package.json ./ # 根目录没有 package.json，如果项目不是 workspace 则不需要此行
COPY packages/types/package.json ./packages/types/
COPY frontend/package.json ./frontend/
COPY frontend/package-lock.json ./frontend/

# 2. 构建 @ldims/types
COPY packages/types/ ./packages/types/
RUN cd packages/types && npm ci --include=dev && npm run build

# 3. 安装前端依赖
COPY frontend/ ./frontend/
RUN cd frontend && npm ci --include=dev

# 4. 构建前端应用
RUN cd frontend && npm run build

# 构建完成，静态资源在 /app/frontend/dist
# 不需要第二阶段 Nginx 镜像 