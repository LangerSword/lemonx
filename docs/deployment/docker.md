# Docker Setup

lemon.test provides two Docker Compose configurations for different deployment modes.

## docker-compose.runner.yml (Recommended)

The machine runner setup. Starts Redis and the CircleCI runner agent.

### Services

#### Redis

```yaml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
  volumes:
    - redis_data:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

- Redis 7 Alpine for minimal footprint
- Port 6379 exposed for debugging
- Persistent data volume
- Health check ensures app waits for Redis

#### Runner

```yaml
runner:
  build:
    context: .
    dockerfile: Dockerfile.runner
  depends_on:
    redis:
      condition: service_healthy
  environment:
    - CIRCLECI_RUNNER_NAME=${CIRCLECI_RUNNER_NAME:-lemon-runner}
    - CIRCLECI_RUNNER_API_AUTH_TOKEN=${CIRCLECI_RUNNER_API_AUTH_TOKEN}
    - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
    - CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - GITHUB_TOKEN=${GITHUB_TOKEN}
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock
```

- Custom Dockerfile based on `circleci/runner-agent:machine-3`
- Docker socket mounted for Docker-in-Docker support
- All environment variables passed from `.env`

### Volumes

```yaml
volumes:
  redis_data:
```

Named volume for Redis persistence across container restarts.

---

## docker-compose.yml (Webhook Mode)

The webhook server setup. Starts Redis, the app (direct execution), and the webhook server.

### Services

#### Redis

Same configuration as the runner setup.

#### App

```yaml
app:
  build: .
  depends_on:
    redis:
      condition: service_healthy
  environment:
    - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
    - CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - WEBHOOK_PORT=3456
    - WEBHOOK_SECRET=${WEBHOOK_SECRET}
  ports:
    - "3456:3456"
  volumes:
    - ./target-repo:/app/target-repo
  command: ["npx", "tsx", "src/index.ts"]
```

- Runs `src/index.ts` directly
- Mounts `./target-repo` for testing local repositories
- Port 3456 exposed (though not used in direct mode)

#### Webhook

```yaml
webhook:
  build: .
  depends_on:
    redis:
      condition: service_healthy
  environment:
    - CLOUDFLARE_ACCOUNT_ID=${CLOUDFLARE_ACCOUNT_ID}
    - CLOUDFLARE_API_KEY=${CLOUDFLARE_API_KEY}
    - REDIS_HOST=redis
    - REDIS_PORT=6379
    - WEBHOOK_PORT=3456
    - WEBHOOK_SECRET=${WEBHOOK_SECRET}
  ports:
    - "3456:3456"
  command: ["npx", "tsx", "src/webhook-server.ts"]
```

- Runs `src/webhook-server.ts` (Express server)
- Port 3456 exposed for receiving webhooks
- Same image as app, different entry command

---

## Dockerfiles

### Dockerfile (App/Webhook)

```dockerfile
FROM node:22-alpine
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
CMD ["npx", "tsx", "src/index.ts"]
```

- Node.js 22 Alpine base
- Git installed for potential repo operations
- Dependencies installed with `npm ci` for reproducibility
- Source code copied (no build step — uses tsx at runtime)

### Dockerfile.runner

```dockerfile
FROM circleci/runner-agent:machine-3
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git \
    && rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g tsx
USER circleci
WORKDIR /home/circleci/lemon
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
```

- Based on official CircleCI runner agent image
- Node.js 22 installed via NodeSource
- tsx installed globally
- Runs as `circleci` user (security best practice)
- lemon.test source code included

---

## Building Images

### App Image

```bash
docker build -t lemon-test:app .
```

### Runner Image

```bash
docker build -f Dockerfile.runner -t lemon-test:runner .
```

### Using Docker Compose

```bash
# Runner mode
docker compose -f docker-compose.runner.yml build

# Webhook mode
docker compose build
```

---

## Running

### Runner Mode

```bash
docker compose -f docker-compose.runner.yml up -d
```

### Webhook Mode

```bash
docker compose up -d
```

This starts all three services (Redis, app, webhook).

---

## Debugging

### View Logs

```bash
# All services
docker compose -f docker-compose.runner.yml logs -f

# Specific service
docker compose -f docker-compose.runner.yml logs -f runner
```

### Access Redis

```bash
docker compose -f docker-compose.runner.yml exec redis redis-cli
```

### Access Runner Shell

```bash
docker compose -f docker-compose.runner.yml exec runner bash
```

### Inspect Redis Keys

```bash
docker compose -f docker-compose.runner.yml exec redis redis-cli
> KEYS *
> GET test_results:<uuid>
> KEYS code_patches:*
```

---

## Production Considerations

### Resource Limits

Add resource constraints to your Docker Compose:

```yaml
services:
  runner:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
        reservations:
          cpus: '2'
          memory: 4G
```

### Logging

Configure Docker logging to prevent disk fill:

```yaml
services:
  runner:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### Security

- Never commit `.env` files
- Use Docker secrets for sensitive values in production
- Keep the runner image updated with `docker compose pull`
- Restrict Docker socket access to trusted users only
