FROM node:20-bullseye

# Replace with your email
LABEL maintainer="your_email@example.com"
LABEL description="LDIMS Backend and Worker Service (Production)"

# Set environment variables for production
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV PORT=${PORT:-3000}

# Create a non-root user and group for running the application
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

WORKDIR /app

# 替换为清华大学的 Debian Bullseye 软件源
RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye main non-free contrib" > /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-updates main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bullseye-backports main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security/ bullseye-security main non-free contrib" >> /etc/apt/sources.list

# Install Python, pip, and essential build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-dev build-essential ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure pip to use Tsinghua University mirror
RUN pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple

# Upgrade pip and setuptools
RUN pip3 install --upgrade pip setuptools wheel

# Copy Python requirements file
COPY --chown=nodejs:nodejs backend/requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# 1. 复制 package.json 文件
# COPY --chown=nodejs:nodejs package.json ./: # 项目根目录没有 package.json，如果项目不是 workspace 则不需要此行
COPY --chown=nodejs:nodejs packages/types/package.json ./packages/types/
COPY --chown=nodejs:nodejs backend/package*.json ./backend/

# 2. 构建 @ldims/types
COPY --chown=nodejs:nodejs packages/types/ ./packages/types/
RUN cd packages/types && npm ci --include=dev && npm run build

# 3. 安装后端依赖并构建
COPY --chown=nodejs:nodejs backend/ ./backend/
RUN cd backend && npm ci --include=dev

# 4. 构建TypeScript
RUN cd backend && npm run build

# 5. 确保node_modules里能找到@ldims/types
# RUN mkdir -p ./backend/node_modules/@ldims && \
#     cp -R ./packages/types ./backend/node_modules/@ldims/

# Change ownership of the entire app directory to the non-root user
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# 工作目录改到backend
WORKDIR /app/backend

# Expose the port the app runs on
EXPOSE ${PORT}

# Start the backend application in production
CMD ["npm", "start"] 