# Use a lightweight Python base image
FROM python:3.12-slim

# Install uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy dependency definition files
COPY pyproject.toml uv.lock ./

# Install project dependencies without the project itself to cache the layer
RUN uv sync --frozen --no-install-project --no-dev

# Copy the remaining project files
COPY . .

# Sync the project itself (if applicable) and place executables in the path
RUN uv sync --frozen --no-dev
ENV PATH="/app/.venv/bin:$PATH"

# Run the FastAPI application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
