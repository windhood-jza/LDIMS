# 使用 Docker Compose 部署 LDIMS 项目到生产环境指南

本文档将指导你如何使用 Docker Compose 在 Docker Desktop (用于本地模拟生产或小型部署) 或生产服务器上配置、构建和运行 LDIMS 项目的各个服务，重点关注生产环境的稳定性、安全性和性能。

## 1. 前提条件

- 确保你的目标服务器上已安装并运行 **Docker Engine** 和 **Docker Compose**。
- 后端 Python 脚本的依赖已导出到 `LDIMS/backend/requirements.txt` 文件。
  - 生成方法：进入 `LDIMS/backend/`，激活 `venv`，运行 `pip freeze > requirements.txt`。
- **SSL 证书**: 为你的域名准备好 SSL 证书和私钥文件 (例如 `fullchain.pem` 和 `privkey.pem`)。推荐使用 Let's Encrypt 或其他受信任的证书颁发机构。

## 2. 项目结构与 Docker 文件位置

- `LDIMS/docker-compose.yml`: Docker Compose 的主配置文件。
- `LDIMS/.frontend.env.prod`: (新增) 存储前端生产环境所需的环境变量 (特别是构建时变量)。
- `LDIMS/.backend.env.prod`: (新增) 存储后端和 Worker 服务生产环境所需的环境变量。
- `LDIMS/frontend/Dockerfile`: 用于构建前端 Vue 应用的 Docker 镜像。
- `LDIMS/frontend/.dockerignore`: 忽略前端构建不需要的文件。
- `LDIMS/frontend/nginx.prod.conf`: **生产环境专用**的 Nginx 配置文件 (用于 HTTPS 和安全头)。
- `LDIMS/backend/Dockerfile`: 用于构建后端 Node.js/Express 应用的 Docker 镜像。
- `LDIMS/backend/.dockerignore`: 忽略后端构建不需要的文件。
- `LDIMS/db_sql/init.sql`: (可选) 数据库初始化脚本。
- `LDIMS/ssl_certs/`: (新增建议) 存放 SSL 证书文件的目录，例如 `LDIMS/ssl_certs/fullchain.pem` 和 `LDIMS/ssl_certs/privkey.pem`。**此目录不应提交到版本控制库中。**

## 3. 为前端应用创建生产 Dockerfile (`LDIMS/frontend/Dockerfile`)

```dockerfile
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
RUN npm ci

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

# Copy built assets from the builder stage\'s dist directory
COPY --from=builder /app/dist .

# Nginx will listen on 80 and 443 as per nginx.prod.conf
# Ports are exposed in docker-compose.yml
EXPOSE 80
EXPOSE 443

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
```

**`LDIMS/frontend/.dockerignore` (内容基本不变):**

```
node_modules
dist
.git
.gitignore
.vscode
npm-debug.log
*.local
# any other development-specific files
```

**创建生产用 Nginx 配置文件 `LDIMS/frontend/nginx.prod.conf`:**

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com; # 替换为你的域名

    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name your_domain.com www.your_domain.com; # 替换为你的域名

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/fullchain.pem;   # 证书路径 (将在 docker-compose 中挂载)
    ssl_certificate_key /etc/nginx/ssl/privkey.pem; # 私钥路径 (将在 docker-compose 中挂载)

    # SSL Optimizations & Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers \'EECDH+AESGCM:EDH+AESGCM:AES256+EECDH:AES256+EDH\'; # Modern ciphers
    ssl_ecdh_curve secp384r1;
    ssl_session_timeout  10m;
    ssl_session_cache shared:SSL:10m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;
    # resolver 8.8.8.8 8.8.4.4 valid=300s; # Uncomment if your server can\'t resolve OCSP responders
    # resolver_timeout 5s;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "same-origin" always;

    root /usr/share/nginx/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:${BACKEND_PORT_CONTAINER:-3000}; # 后端服务名和端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        # Add more proxy settings if needed, e.g., for timeouts
        # proxy_connect_timeout 60s;
        # proxy_send_timeout 60s;
        # proxy_read_timeout 60s;
    }

    # Optional: Custom error pages
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html; # Ensure you have a 50x.html page
    }

    # Optional: Logging
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
}
```

**注意:** `your_domain.com` 和 `BACKEND_PORT_CONTAINER` 需要替换为实际值。SSL 证书路径 `/etc/nginx/ssl/` 是容器内的路径，将在 `docker-compose.yml` 中通过卷挂载。

## 4. 为后端应用 (及 Worker) 创建生产 Dockerfile (`LDIMS/backend/Dockerfile`)

```dockerfile
FROM node:20-bullseye

LABEL maintainer="your_email@example.com" # 替换为你的邮箱
LABEL description="LDIMS Backend and Worker Service (Production)"

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV PORT=${BACKEND_PORT_CONTAINER:-3000} # 使用 docker-compose 传入的端口

# Create a non-root user and group for running the application
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

WORKDIR /app

# Install Python, pip, and essential build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-dev build-essential ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Python requirements file
COPY --chown=nodejs:nodejs requirements.txt ./

# Install Python dependencies
# Using --no-cache-dir for smaller image size
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy package.json, package-lock.json (or yarn.lock)
COPY --chown=nodejs:nodejs package*.json ./

# Install production Node.js dependencies and remove devDependencies
# npm ci is generally preferred for production if package-lock.json is solid.
# If using npm install, ensure devDependencies are pruned.
RUN npm ci --omit=dev && npm cache clean --force
# Or: RUN npm install --omit=dev && npm cache clean --force

# Copy the rest of the backend source code
COPY --chown=nodejs:nodejs . .

# Build TypeScript to JavaScript (should also copy python-scripts to dist)
RUN npm run build

# Change ownership of the entire app directory to the non-root user
# This is important if \'npm run build\' creates files owned by root
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE ${PORT}

# Default command to start the backend application in production
# Ensure \'npm start\' in your package.json points to a production-ready startup script (e.g., node dist/app.js)
CMD [\"npm\", \"start\"]
```

**`LDIMS/backend/.dockerignore` (内容基本不变，确保 `venv` 等被忽略):**

```
node_modules
dist
venv
.git
.gitignore
.vscode
npm-debug.log
uploads/* # Depending on strategy, dev uploads might be ignored
exports/* # Depending on strategy, dev exports might be ignored
*.local
# Test files, coverage reports etc.
test/
coverage/
```

**特别注意: MarkItDown 和 PaddleOCR 依赖 (生产环境)**

- 确保 `requirements.txt` 包含所有生产所需的 Python 包及其精确版本。
- PaddleOCR 的系统依赖 (如 `libGL.so.1`, `libjpeg-dev`) 必须在 `Dockerfile` 中通过 `apt-get install` 安装。仔细测试构建过程。
- PaddleOCR 模型文件会占用镜像空间或在运行时下载，考虑预先下载模型并打包到镜像中，或使用持久卷存储模型以避免重复下载。

## 5. 创建生产用 `docker-compose.yml` 文件 (`LDIMS/docker-compose.yml`)

```yaml
version: "3.8"

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args: # Pass build-time arguments to frontend Dockerfile
        - VITE_API_BASE_URL_BUILD=${VITE_API_BASE_URL_PROD}
        # - NODE_ENV_BUILD=${NODE_ENV} # Or directly set if always production
    container_name: ldims_frontend_prod
    ports:
      - "${FRONTEND_PORT_HTTP_HOST:-80}:80" # For HTTP to HTTPS redirect
      - "${FRONTEND_PORT_HTTPS_HOST:-443}:443" # For HTTPS
    volumes:
      - ./ssl_certs:/etc/nginx/ssl:ro # Mount SSL certificates (read-only)
    restart: always # Production setting
    networks:
      - ldims_network
    logging: # Production logging
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ldims_backend_prod
    # ports: # Typically, backend is not directly exposed in production, Nginx handles access
    #   - "${BACKEND_PORT_HOST:-3000}:${BACKEND_PORT_CONTAINER:-3000}"
    env_file: # Load backend-specific production environment variables
      - ./.backend.env.prod
    environment: # Override or set specific variables for the Docker environment
      - NODE_ENV=production # Ensures production mode
      - PORT=${BACKEND_PORT_CONTAINER:-3000} # Port from .backend.env.prod
      - DB_HOST=db
      - REDIS_HOST=redis
    volumes:
      - ldims_uploads_prod:/app/uploads
      - ldims_exports_prod:/app/exports
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm start # Production start command
    restart: always
    networks:
      - ldims_network
    logging: &default_logging # YAML anchor for reuse
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    deploy: # Resource limits (effective in Swarm mode, good practice to define)
      resources:
        limits:
          cpus: \'0.50\'
          memory: 512M
        reservations:
          cpus: \'0.25\'
          memory: 256M

  worker:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: ldims_worker_prod
    env_file: # Load backend-specific production environment variables (shared with backend)
      - ./.backend.env.prod
    environment: # Override or set specific variables for the Docker environment
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=redis
    volumes:
      - ldims_uploads_prod:/app/uploads
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:worker # Production worker start command
    restart: always
    networks:
      - ldims_network
    logging: *default_logging # Reuse logging config
    deploy: # Resource limits
      resources:
        limits:
          cpus: \'0.75\' # Worker might be more CPU intensive for OCR
          memory: 1G # OCR might need more memory
        reservations:
          cpus: \'0.30\'
          memory: 512M

  db: # Example for MySQL
    image: mysql:8.0
    container_name: ldims_db_prod
    # ports: # Not typically exposed directly in production. Access via backend or bastion host.
    #   - "${DB_PORT_HOST:-3306}:3306"
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD_PROD} # Use production-specific variables
      MYSQL_DATABASE: ${DB_NAME_PROD}
      MYSQL_USER: ${DB_USER_PROD}
      MYSQL_PASSWORD: ${DB_PASSWORD_PROD}
    volumes:
      - ldims_db_data_prod:/var/lib/mysql
      - ./db_sql:/docker-entrypoint-initdb.d:ro # Mount SQL read-only
    healthcheck:
      test:
        [
          "CMD",
          "mysqladmin",
          "ping",
          "-h",
          "localhost",
          "-u${DB_USER_PROD}",
          "-p${DB_PASSWORD_PROD}",
        ]
      interval: 20s
      timeout: 10s
      retries: 5
      start_period: 60s # Give DB more time to start before first healthcheck
    restart: always
    networks:
      - ldims_network
    logging: *default_logging
    # deploy: # Resource limits for DB
    #   resources:
    #     limits:
    #       cpus: \'1\'
    #       memory: 2G
    #     reservations:
    #       cpus: \'0.5\'
    #       memory: 1G

  redis:
    image: redis:7-alpine
    container_name: ldims_redis_prod
    # ports: # Not typically exposed directly
    #   - "${REDIS_PORT_HOST:-6379}:6379"
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD_PROD} # Enable AOF and password
    volumes:
      - ldims_redis_data_prod:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD_PROD}", "ping"]
      interval: 20s
      timeout: 10s
      retries: 5
      start_period: 30s
    restart: always
    networks:
      - ldims_network
    logging: *default_logging
    # deploy: # Resource limits for Redis
    #   resources:
    #     limits:
    #       cpus: \'0.5\'
    #       memory: 512M
    #     reservations:
    #       cpus: \'0.2\'
    #       memory: 256M

volumes:
  ldims_uploads_prod:
  ldims_exports_prod:
  ldims_db_data_prod:
  ldims_redis_data_prod:

networks:
  ldims_network:
    driver: bridge
    name: ldims_prod_network # Define a specific network name
```

**关键生产变更:**

- `restart: always` for all services.
- Backend/DB/Redis 不直接暴露端口到主机，由前端 Nginx (或专用负载均衡器) 处理入口流量。
- 为服务 (如 `ldims_backend_prod`) 添加了 `deploy.resources` 部分作为资源限制的示例 (这在 Docker Swarm 中直接生效，对于普通 `docker-compose up` 也是良好实践的提示，但实际限制可能需依赖宿主机 cgroups 或其他工具)。
- 为 Redis 添加了密码保护和持久化 (`--appendonly yes --requirepass`)。
- 为数据库和 Redis 的环境变量使用了 `_PROD` 后缀，以强调在各自的 `.env.prod` 文件中应有生产专用配置。
- 更长的 `healthcheck` 和 `start_period` 以适应生产环境可能较慢的启动。
- 配置了 Docker 日志驱动和选项。
- 定义了自定义网络名 `ldims_prod_network`.

## 6. 配置生产环境变量

现在，你需要为前端和后端分别创建生产环境的 `.env` 文件。这些文件包含敏感信息，**绝不能提交到版本控制系统 (Git)**。

**`LDIMS/.frontend.env.prod` (前端生产环境变量 - 主要用于构建时):**

```env
# Frontend Build-time Environment Variables (Production)
NODE_ENV=production
VITE_APP_TITLE=LDIMS Production
VITE_API_BASE_URL_PROD=https://your_domain.com/api/v1 # 生产环境中前端访问后端API的绝对路径
# Add any other VITE_ prefixed variables needed by the frontend build
```

**`LDIMS/.backend.env.prod` (后端及 Worker 生产环境变量):**

```env
# Backend and Worker Environment Variables (Production)
NODE_ENV=production
TZ=Asia/Shanghai # 或者服务器所在时区

# Backend (Container port, not typically exposed directly on host in prod)
BACKEND_PORT_CONTAINER=3000

# Database Configuration (MySQL - Production)
DB_DIALECT=mysql
DB_NAME_PROD=ldims_production_db
DB_USER_PROD=ldims_prod_user
DB_PASSWORD_PROD=A_VERY_STRONG_UNIQUE_PASSWORD_FOR_DB_PROD # CHANGE THIS
DB_ROOT_PASSWORD_PROD=ANOTHER_VERY_STRONG_UNIQUE_PASSWORD_FOR_ROOT_PROD # CHANGE THIS

# Redis Configuration (Production)
REDIS_PORT=6379 # Port Redis listens on inside the container
REDIS_PASSWORD_PROD=A_VERY_STRONG_UNIQUE_PASSWORD_FOR_REDIS_PROD # CHANGE THIS

# JWT Configuration for Backend (Production)
JWT_SECRET=YOUR_ULTRA_SECURE_AND_RANDOM_JWT_SECRET_KEY_PROD # CHANGE THIS
JWT_EXPIRES_IN=1h # Shorter expiration for production tokens might be safer

# Python Executable Path for Backend
PYTHON_EXECUTABLE_PATH=python3

# Add any other production-specific API keys, service URLs for backend/worker
# EXAMPLE_API_KEY=your_production_api_key
```

**极度重要:**

- **为所有 `_PROD` 后缀的密码和密钥生成强大、唯一的随机值。**
- 这两个 `.env.prod` 文件包含敏感信息，绝不能提交到版本控制系统 (Git)。 使用服务器上的安全机制管理这些文件，或考虑使用 Docker secrets、HashiCorp Vault 等 secrets 管理工具。

## 7. 数据库初始化 (`LDIMS/db_sql/init.sql`)

- 生产环境的数据库初始化脚本应仅包含必要的表结构创建 (DDL)，可能不包含或少量包含基础数据。
- 确保 `init.sql` 是幂等的 (即多次运行不会产生错误或副作用)。
- 在 `docker-compose.yml` 中，数据库初始化卷已配置为只读 (`:ro`)，这是一个良好的安全实践。

## 7.1. 关键：核查 MySQL 配置

在继续构建和运行之前，请务必完成以下 MySQL 配置核查步骤，以确保数据库服务能够按预期工作：

1.  **核查 `docker-compose.yml` 中的 `db` 服务定义**:

    - 确保 `db` 服务的 `image` 字段使用的是 MySQL 镜像，例如 `mysql:8.0`。
    - 确认 `environment` 变量 (如 `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`) 指向的是你在 `.backend.env.prod` 文件中为 MySQL 定义的生产环境变量 (例如 `${DB_ROOT_PASSWORD_PROD}` 等)。
    - 检查 `volumes` 部分，确保数据库数据持久化到正确的卷 (例如 `ldims_db_data_prod:/var/lib/mysql`)，并且初始化脚本目录已挂载 (例如 `./db_sql:/docker-entrypoint-initdb.d:ro`)。

2.  **核查 `.backend.env.prod` 文件中的环境变量**:

    - 确保在 `LDIMS/.backend.env.prod` 中存在并正确设置了以下针对 MySQL 生产环境的变量 (注意 `_PROD` 后缀和实际值)：
      - `DB_DIALECT=mysql` (如果你的应用代码依赖此变量)
      - `DB_NAME_PROD` (例如 `ldims_production_db`)
      - `DB_USER_PROD` (例如 `ldims_prod_user`)
      - `DB_PASSWORD_PROD` (替换为你的强密码)
      - `DB_ROOT_PASSWORD_PROD` (替换为你的强密码)
    - 确保这些变量名与 `docker-compose.yml` 中 `db` 服务的 `environment` 部分引用的变量名一致。

3.  **核查后端应用的数据库驱动**: (此项应在开发阶段已确认)

    - 确认 `LDIMS/backend/package.json` 文件的 `dependencies` 部分包含 `mysql2` 包 (例如 `"mysql2": "^3.14.0"`)。
    - 如果后端代码 (例如 Sequelize 配置) 依赖 `DB_DIALECT` 环境变量来选择数据库驱动，确保其能正确识别 `mysql`。

4.  **核查数据库初始化脚本 (`LDIMS/db_sql/init.sql`)**:
    - 打开并检查 `init.sql` 文件，确保所有 SQL 语句均使用 MySQL 兼容语法。
    - 特别注意 `CREATE TABLE` 语句中的 `ENGINE=InnoDB` (推荐) 和字符集设置 (例如 `DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`)。
    - 确保脚本是幂等的，即多次执行不会导致错误。
    - 确认脚本中创建的表名、列名与你的后端应用代码 (例如 Sequelize 模型定义) 中的期望一致。

只有在完成并确认以上所有核查点后，才建议继续执行后续的构建和运行步骤。

## 7.2. 部署方式说明 (本地构建镜像)

由于你将在已安装 Docker Desktop 和 Docker Compose 的 Windows 机器上直接通过代码部署，并且这台机器可以访问到所有源代码，因此我们将采用本地构建 Docker 镜像的策略。这意味着 `docker-compose.yml` 文件中的服务会使用 `build:` 指令来指示 Docker Compose 在本地根据 `Dockerfile` 构建镜像。

**这种方式下，你不需要预先将镜像推送到外部 Docker 仓库或手动传输 `.tar` 文件。**

确保你的 Windows 机器上有项目代码的最新副本，以及所有必要的配置文件 (如生产版 `.env`、SSL 证书、数据库初始化脚本等)。

## 8. 构建和运行 (生产 - 本地构建)

1.  **准备 SSL 证书**: 将你的 `fullchain.pem` 和 `privkey.pem` 放入 `LDIMS/ssl_certs/` 目录。
2.  **准备 `.env` 文件**:
    - 在 `LDIMS/` 目录下创建并配置好生产用的 `.frontend.env.prod` 文件。
    - 在 `LDIMS/` 目录下创建并配置好生产用的 `.backend.env.prod` 文件。
3.  **准备 `docker-compose.yml`**:
    - 确认 `docker-compose.yml` 文件中的 `frontend` 服务在其 `build` 部分包含了 `args` 来传递构建时环境变量 (如 `VITE_API_BASE_URL_BUILD`)。
    - 确认 `backend` 和 `worker` 服务的 `env_file` 指令指向了 `.backend.env.prod`。
    - 确认 `frontend`, `backend`, `worker` 服务都包含 `build:` 指令，指向正确的上下文和 `Dockerfile`。
4.  **获取/更新代码**: 确保 `LDIMS/` 目录下的所有源代码 (`frontend/`, `backend/` 等) 是你希望部署的最新版本。

5.  **构建/重新构建生产镜像:**

    ```bash
    docker-compose -f docker-compose.yml build --no-cache frontend backend worker
    ```

    - `--no-cache` 确保每次都从头构建，以包含所有代码和配置的最新更改。在后续更新中，如果只想重新构建有变动的服务，可以去掉 `--no-cache` 或指定特定服务。

6.  **启动服务 (后台模式):**

    ```bash
    docker-compose -f docker-compose.yml up -d --remove-orphans
    ```

    _(`--remove-orphans` 用于清理旧版本服务不再需要的容器)_

7.  **验证服务状态:**
    ```bash
    docker-compose -f docker-compose.yml ps
    docker-compose -f docker-compose.yml logs -f frontend
    docker-compose -f docker-compose.yml logs -f backend
    ```
8.  **访问应用:** 通过 `https://your_domain.com` (或你在 Nginx 配置中设置的域名，并确保本地 DNS 或 hosts 文件正确解析) 访问。

**更新应用:**

1.  获取/更新项目源代码到 `LDIMS/` 目录。
2.  如有必要，修改 `.env` 或其他配置文件。
3.  重新构建有变动的服务的镜像:
    ```bash
    docker-compose -f docker-compose.yml build frontend backend worker # 只构建有变动的服务，或全部构建
    ```
4.  重新创建服务以应用新的镜像和配置:
    ```bash
    docker-compose -f docker-compose.yml up -d --remove-orphans
    ```

## 9. 生产环境运维与安全强化

- **HTTPS 强制**: 已在 `nginx.prod.conf` 中配置 HTTP 到 HTTPS 的重定向。
- **Secrets 管理**: 对于高度敏感的密码和 API 密钥，强烈建议使用 Docker secrets (适用于 Swarm 模式) 或外部 secrets 管理工具 (如 HashiCorp Vault, AWS Secrets Manager, Azure Key Vault) 而不是直接放在 `.frontend.env.prod` 或 `.backend.env.prod` 文件中。这些 `.env.prod` 文件可以用于非敏感配置或作为这些工具的输入源。
- **资源限制**: `docker-compose.yml` 中的 `deploy.resources` 部分为 Swarm 模式设计，但表明了为容器设置 CPU 和内存限制的重要性。在非 Swarm 环境中，你可能需要通过其他方式（如直接 Docker run 参数或 cgroup 配置）来实施这些限制。
- **日志管理**:
  - `docker-compose.yml` 中已配置 `json-file` 日志驱动和轮转。
  - 考虑将 Docker 日志转发到集中的日志管理系统 (如 ELK Stack, Grafana Loki, Splunk, Datadog) 以便分析和告警。
- **监控与告警**:
  - 监控容器的健康状况、资源使用率 (CPU, 内存, 网络,磁盘 I/O)。
  - 使用 Prometheus, Grafana, Datadog 等工具。
  - 设置关键指标的告警。
- **数据库备份与恢复**:
  - 为生产数据库 (`ldims_db_data_prod` 卷) 实施定期的、自动化的备份策略。
  - 测试恢复流程。
- **安全扫描与更新**:
  - 定期扫描 Docker 镜像以查找已知漏洞 (例如使用 Trivy, Clair)。
  - 及时更新基础镜像 (Node, Nginx, Python, OS) 和所有应用依赖。
- **防火墙**: 确保服务器防火墙只开放必要的端口 (如 80, 443)。
- **最小权限原则**:
  - 后端应用已配置为以非 root 用户 `nodejs` 运行。
  - 确保数据库用户权限最小化。
- **健康检查**: `docker-compose.yml` 中为 `db` 和 `redis` 配置了健康检查，可以为 `backend` 和 `worker` 也添加应用级别的健康检查端点。
- **Nginx 优化**:
  - 根据需要调整 Nginx worker 进程数和连接数。
  - 启用 Gzip 压缩。
  - 配置静态资源缓存策略。
- **停机维护**: 规划好停机维护窗口和流程。对于零停机部署，可能需要蓝绿部署或滚动更新策略 (通常借助 Kubernetes 或更高级的编排工具)。

## 10. (已整合) 部署到生产环境的额外考虑

本指南的各个部分已尽可能地融入了生产环境的考虑因素。核心思想是安全、稳定、可维护和可观测。

---

请仔细审查此生产环境部署方案，特别是安全相关的配置 (密码、密钥、SSL 证书、用户权限) 和资源分配。在实际部署前，务必在准生产环境中进行充分测试。
