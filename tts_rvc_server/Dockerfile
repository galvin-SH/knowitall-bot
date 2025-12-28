# =============================================================================
# TTS+RVC Server Dockerfile
# Requires the base image: cuda-python:12.8-py312
#
# Build base first:  docker build -f Dockerfile.base -t cuda-python:12.8-py312 .
# Then build this:   docker build -t tts-rvc-server .
# Run with GPU:      docker run --gpus all -p 5050:5050 \
#                      -v ./models:/app/models \
#                      -v ./hubert_base.pt:/app/hubert_base.pt \
#                      -v ./rmvpe.pt:/app/rmvpe.pt \
#                      -v ./voice_config.json:/app/voice_config.json \
#                      tts-rvc-server
# =============================================================================

# -----------------------------------------------------------------------------
# Build Stage: Install Python dependencies
# -----------------------------------------------------------------------------
FROM cuda-python:12.8-py312 AS build

WORKDIR /app

# Copy dependency files first (for better layer caching)
COPY uv.lock pyproject.toml ./

# Install dependencies (without the project itself)
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --no-install-project --no-dev

# Copy application code
COPY server.py ./
COPY voice_config.example.json ./

# Install the project
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev

# -----------------------------------------------------------------------------
# Runtime Stage: Minimal runtime with just the venv
# -----------------------------------------------------------------------------
FROM cuda-python:12.8-py312 AS runtime

# Create non-root user for security
RUN groupadd -g 1001 appgroup && \
    useradd -u 1001 -g appgroup -m -d /app -s /bin/false appuser

WORKDIR /app

# Copy the virtual environment from build stage
COPY --from=build --chown=appuser:appgroup /app/.venv ./.venv
COPY --from=build --chown=appuser:appgroup /app/server.py ./
COPY --from=build --chown=appuser:appgroup /app/voice_config.example.json ./

# Create directories for mounted volumes
RUN mkdir -p /app/models /app/output && chown -R appuser:appgroup /app

# Add venv to PATH
ENV PATH="/app/.venv/bin:$PATH"

USER appuser

EXPOSE 5050

# Health check using Python (more reliable than curl)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5050/health')" || exit 1

# Run the FastAPI application
CMD ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "5050"]
