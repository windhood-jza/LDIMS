FROM node:20-bookworm

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

# 替换为清华大学的 Debian Bookworm 软件源
RUN echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm main non-free contrib" > /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-updates main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian/ bookworm-backports main non-free contrib" >> /etc/apt/sources.list && \
    echo "deb https://mirrors.tuna.tsinghua.edu.cn/debian-security/ bookworm-security main non-free contrib" >> /etc/apt/sources.list

# Install Python, pip, and essential build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-dev build-essential ca-certificates apt-utils && \
    # Add common dependencies for PaddlePaddle and OpenCV
    apt-get install -y --no-install-recommends libgl1-mesa-glx libglib2.0-0 libsm6 libxext6 libxrender-dev libgomp1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Configure pip to use Tsinghua University mirror (备用方案，默认注释掉)
# RUN pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
# RUN pip3 config set global.extra-index-url https://pypi.org/simple

# Upgrade pip and setuptools
RUN pip3 install --break-system-packages --upgrade pip setuptools wheel

# Install markitdown, using official PyPI as an extra index if not found in Tsinghua mirror
# 如果主要依赖官方源，这里的extra-index-url可能需要调整或移除，取决于markitdown在官方源的情况
# 鉴于之前是特定安装，保留此处的处理方式，但主要依赖安装会走官方源
RUN pip3 install --break-system-packages --no-cache-dir --extra-index-url https://pypi.org/simple/ 'markitdown[pdf,docx]'

# Copy Python requirements file
COPY --chown=nodejs:nodejs backend/requirements.txt ./

# Install Python dependencies from official PyPI
RUN pip3 install --break-system-packages --no-cache-dir -r requirements.txt
# 备用方案: Install Python dependencies using Tsinghua mirror if official PyPI fails
# RUN pip3 install --break-system-packages --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# Explicitly install/reinstall paddlepaddle first, then paddleocr
# Using versions from the initial requirements.txt. These might need adjustment based on the new requirements.txt or further compatibility checks.
RUN pip3 install --break-system-packages --no-cache-dir paddlepaddle==3.0.0
RUN pip3 install --break-system-packages --no-cache-dir paddleocr==2.10.0
# 备用方案 (清华源):
# RUN pip3 install --break-system-packages --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple paddlepaddle==3.0.0
# RUN pip3 install --break-system-packages --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple paddleocr==2.10.0

# Ensure NumPy is pinned to a compatible version (1.x) as a final step
# 注意：如果新的 requirements.txt 中已包含 numpy，此步骤可能需要调整或移除
# RUN pip3 install --break-system-packages --no-cache-dir numpy==1.26.4
# 备用方案 (清华源):
# RUN pip3 install --break-system-packages --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple numpy==1.26.4

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