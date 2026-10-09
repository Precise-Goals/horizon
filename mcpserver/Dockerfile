# ==============================================================================
# Horizon MCP Server — Multi-Stage Production Dockerfile for Render Free Tier
# ==============================================================================
FROM python:3.11-slim as builder

WORKDIR /app

# Install build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Final lightweight production image
FROM python:3.11-slim

WORKDIR /app

# Non-root user for security
RUN useradd -m -u 1000 horizon
USER horizon

# Copy installed packages from builder
COPY --from=builder /root/.local /home/horizon/.local
ENV PATH=/home/horizon/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1
ENV PORT=10000

# Copy application source code
COPY --chown=horizon:horizon . .

# Render exposes PORT env var
EXPOSE $PORT

# Healthcheck for uptime monitors
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Launch uvicorn ASGI server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]
