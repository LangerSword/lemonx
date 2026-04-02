# Getting Started

## Prerequisites

- **Docker + Docker Compose** — for running the machine runner and Redis
- **CircleCI account** with machine runner access
- **Cloudflare Workers AI credentials** — for the AI agents
- **GitHub token** (optional) — for automatic PR creation

## Step 1: Create a CircleCI Machine Runner

You need a namespace and resource class for your organization:

```bash
# Create namespace (skip if you already have one)
circleci namespace create <your-org> --org-id <your-org-id>

# Create resource class and get the token
circleci runner resource-class create <your-org>/lemon-runner "AI test runner" --generate-token
```

Save the resource class token — you'll need it in the next step.

## Step 2: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Cloudflare Workers AI (for AI agents)
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_KEY=your-api-key

# Redis (internal state)
REDIS_HOST=redis
REDIS_PORT=6379

# CircleCI Machine Runner
CIRCLECI_RUNNER_NAME=lemon-runner
CIRCLECI_RUNNER_API_AUTH_TOKEN=<token-from-step-1>

# GitHub (for PR creation, optional)
GITHUB_TOKEN=your-github-token
```

## Step 3: Start the Runner

```bash
docker compose -f docker-compose.runner.yml up -d
```

This starts two containers:
- **Redis** — state management for agent communication
- **Runner** — extends `circleci/runner-agent:machine-3` with Node.js, git, and lemon.test source code

The runner immediately connects to CircleCI and waits for jobs.

## Step 4: Set Up Your Target Repository

```bash
npx lemonx init /path/to/your/repo
```

This generates `.circleci/config.yml` in your target repo. Open it and replace `<namespace>/<resource-class>` with your actual resource class (e.g., `my-org/lemon-runner`).

## Step 5: Push and Watch It Work

```bash
git add .circleci/config.yml
git commit -m "Add lemon.test AI testing"
git push origin feature/my-branch
```

CircleCI will:
1. Route the job to your machine runner
2. The runner executes the AI test-fix loop directly on your code
3. CircleCI receives the results and passes/fails the pipeline

## What Happens Next

When a push triggers the pipeline:

1. **Discovery** — AI agents scan your source files (up to 5 for unit tests, 5 for integration, 3 for E2E)
2. **Generation** — Tests are written to `src/__tests__/`, `tests/integration/`, and `tests/e2e/`
3. **Execution** — Tests run via vitest, results stored in Redis
4. **Fixing** — Failed tests are analyzed and source code is patched
5. **Iteration** — Steps 3-4 repeat up to 5 times
6. **Report** — Results returned to CircleCI, pipeline passes or fails

## Next Steps

- Read about the [architecture](/architecture/overview) to understand how agents work
- Explore the [API reference](/reference/agents) for detailed tool and agent documentation
- Learn about [deployment options](/deployment/machine-runner) for production setups
