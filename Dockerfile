# =============================================================================
# Discord Bot Dockerfile
# Lightweight Node.js container for the knowitall-bot
# =============================================================================

FROM node:22-slim

# Install dependencies for @discordjs/voice (native audio)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsodium-dev \
    python3 \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/

# Create non-root user
RUN groupadd -r botuser && useradd -r -g botuser botuser
RUN chown -R botuser:botuser /app
USER botuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD node -e "console.log('healthy')" || exit 1

CMD ["node", "src/index.js"]
