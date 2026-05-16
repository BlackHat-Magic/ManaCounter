FROM node:23-alpine3.22 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY static/ ./static/
RUN npx @tailwindcss/cli -i ./static/css/main.css -o ./static/dist/main.css --minify

FROM nginx:1.31.0-alpine
COPY --from=builder /app/static /usr/share/nginx/html/static
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
