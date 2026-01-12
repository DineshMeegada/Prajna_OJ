FROM python:3.10-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    curl \
    gnupg \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

COPY judge_env/requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy entrypoint
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Copy project
COPY . .

# Change to the project directory where manage.py is located
WORKDIR /app/OJ

ENTRYPOINT ["/app/entrypoint.sh"]
