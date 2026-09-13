FROM node:22-alpine AS build
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm run build

FROM caddy:2.9-alpine
WORKDIR /app
COPY Caddyfile ./Caddyfile
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["caddy", "run", "--config", "/app/Caddyfile", "--adapter", "caddyfile"]
