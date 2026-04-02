# Machine Runner

The CircleCI Machine Runner is the recommended way to run lemon.test. Your code never leaves your infrastructure.

## How It Works

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Git Push   │────▶│  CircleCI    │────▶│  Your Machine    │
│  (any repo)  │     │  Cloud       │     │  Runner          │
└─────────────┘     └──────────────┘     └────────┬─────────┘
                                                   │
                                      ┌────────────▼──────────┐
                                      │  lemon.test           │
                                      │  - Generate tests     │
                                      │  - Run tests          │
                                      │  - Fix failures       │
                                      │  - Iterate            │
                                      └───────────────────────┘
```

## Prerequisites

- CircleCI account with machine runner access
- Docker + Docker Compose installed on the runner machine
- Minimum 4GB RAM, 2 CPU cores recommended

## Setup

### Step 1: Create Namespace

A namespace groups your resource classes:

```bash
circleci namespace create <your-org> --org-id <your-org-id>
```

Skip this if you already have a namespace.

### Step 2: Create Resource Class

A resource class defines the compute capacity:

```bash
circleci runner resource-class create <your-org>/lemon-runner "AI test runner" --generate-token
```

This outputs a token. Save it — you'll need it in the next step.

### Step 3: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_KEY=your-api-key
CIRCLECI_RUNNER_NAME=lemon-runner
CIRCLECI_RUNNER_API_AUTH_TOKEN=<token-from-step-2>
GITHUB_TOKEN=your-github-token  # optional, for auto PR creation
```

### Step 4: Start the Runner

```bash
docker compose -f docker-compose.runner.yml up -d
```

This starts two containers:

**Redis** (`redis:7-alpine`):
- Port 6379
- Health check every 5 seconds
- Persistent data volume

**Runner** (custom Dockerfile):
- Based on `circleci/runner-agent:machine-3`
- Node.js 22, git, tsx pre-installed
- lemon.test source code mounted
- Connects to CircleCI and waits for jobs

### Step 5: Verify

Check the runner is online:

```bash
docker compose -f docker-compose.runner.yml logs runner
```

You should see the runner agent connecting to CircleCI.

## Initialize Target Repos

For each repository you want to test:

```bash
npx lemonx init /path/to/repo
```

Then open `.circleci/config.yml` and replace `<namespace>/<resource-class>` with your actual resource class.

## Running the Runner in Production

### Recommended Setup

- Run on a dedicated machine or VM
- Use systemd to manage the Docker Compose service
- Monitor Redis memory usage
- Set up log rotation for Docker containers

### Systemd Service

```ini
[Unit]
Description=Lemon Test Machine Runner
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/lemon
ExecStart=/usr/bin/docker compose -f docker-compose.runner.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.runner.yml down

[Install]
WantedBy=multi-user.target
```

## Troubleshooting

### Runner Not Connecting

1. Verify the token is correct in `.env`
2. Check the CircleCI dashboard for runner status
3. Check logs: `docker compose -f docker-compose.runner.yml logs runner`

### Redis Connection Issues

1. Verify `REDIS_HOST=redis` (Docker Compose service name)
2. Check Redis is healthy: `docker compose -f docker-compose.runner.yml exec redis redis-cli ping`

### Out of Memory

The AI agents can be memory-intensive. Consider:
- Increasing the machine's RAM
- Reducing `MAX_ITERATIONS`
- Limiting the number of files discovered per test type
