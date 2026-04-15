# ─────────────────────────────────────────────────────────────
#  MAX - Multi-Agent eXecutor
#  Dockerfile for full-stack deployment
# ─────────────────────────────────────────────────────────────

# ─── Stage 1: Backend ───────────────────────────────────────
FROM python:3.11-slim as backend

WORKDIR /app/backend

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PYTHONUNBUFFERED=1
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ─── Stage 2: Frontend ─────────────────────────────────────
FROM node:18-alpine as frontend

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/src ./src
COPY frontend/index.html ./
COPY frontend/vite.config.js ./

RUN npm run build

# ─── Stage 3: Production ────────────────────────────────────
FROM nginx:alpine

COPY --from=frontend /app/frontend/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
