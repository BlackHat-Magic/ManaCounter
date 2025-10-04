# build step
FROM node:24.8.0-alpine3.21 AS assets

WORKDIR /build

COPY package*.json .
RUN npm ci

COPY templates/ ./templates
COPY static/js ./static/js
COPY static/css ./static/css

RUN mkdir -p static/dist

RUN npx @tailwindcss/cli \
    -i ./static/css/main.css \
    -o ./static/dist/main.css \
    --minify

# runtime
FROM python:3.13.7-slim-bookworm

RUN apt-get update && \
    apt-get upgrade && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=assets /build/static/dist/main.css ./static/dist/main.css

EXPOSE 8000

CMD ["python", "-m", "gunicorn", "-w", "2", "-b", "0.0.0.0:8000", "app:app"]