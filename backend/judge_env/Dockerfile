FROM python:3.10-slim

# Install GCC (for C++) and other necessary tools
RUN apt-get update && \
    apt-get install -y g++ && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY judge_env/requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app/