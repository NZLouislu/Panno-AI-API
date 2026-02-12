# Multi-environment Dockerfile for Panno-AI (Next.js + Python/OpenCV)
FROM node:18-slim

# 1. Install Python, Pip and OpenCV system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2. Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# 3. Install Node.js dependencies
COPY package*.json ./
RUN npm install

# 4. Copy application code
COPY . .

# 5. Build Next.js application
ENV NODE_ENV production
ENV PORT 7860
RUN npm run build

# 6. Expose HF Space default port
EXPOSE 7860

# 7. Start the unified application
CMD ["npm", "start"]
