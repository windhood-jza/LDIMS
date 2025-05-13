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

# Install Python, pip, and essential build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip python3-dev build-essential ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Python requirements file
COPY --chown=nodejs:nodejs requirements.txt ./

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy package.json, package-lock.json (or yarn.lock)
COPY --chown=nodejs:nodejs package*.json ./

# Install production Node.js dependencies and remove devDependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the backend source code
COPY --chown=nodejs:nodejs . .

# Build TypeScript to JavaScript
RUN npm run build

# Change ownership of the entire app directory to the non-root user
RUN chown -R nodejs:nodejs /app

# Switch to the non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE ${PORT}

# Start the backend application in production
CMD ["npm", "start"] 