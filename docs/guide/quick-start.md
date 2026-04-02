# Quick Start

Get lemon.test running in under 5 minutes using the CircleCI Machine Runner approach.

## Prerequisites

- Docker + Docker Compose installed
- CircleCI account with machine runner access
- Cloudflare Workers AI account
- A TypeScript/JavaScript repository to test

## 1. Set Up the Machine Runner

Create a CircleCI namespace and resource class:

```bash
# Create namespace (skip if you already have one)
circleci namespace create <your-org> --org-id <your-org-id>

# Create resource class and get the token
circleci runner resource-class create <your-org>/lemon-runner "AI test runner" --generate-token
```

Save the resource class token — you'll need it in the next step.

## 2. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_KEY=your-api-key
CIRCLECI_RUNNER_NAME=lemon-runner
CIRCLECI_RUNNER_API_AUTH_TOKEN=<token-from-step-1>
GITHUB_TOKEN=your-github-token  # optional, for auto PR creation
```

## 3. Start the Runner

```bash
docker compose -f docker-compose.runner.yml up -d
```

This starts two containers:
- **Redis** — state management for agent communication
- **Runner** — CircleCI machine runner with lemon.test pre-installed

The runner connects to CircleCI and waits for jobs.

## 4. Initialize Your Target Repository

```bash
npx lemonx init /path/to/your/repo
```

This generates `.circleci/config.yml` in your target repo. Open it and replace `<namespace>/<resource-class>` with your actual resource class.

## 5. Push and Watch It Work

```bash
git add .circleci/config.yml
git commit -m "Add lemon.test AI testing"
git push origin feature/my-branch
```

CircleCI routes the job to your machine runner, which runs the full AI test-fix loop.

## What Happens

1. **Discovery** — AI scans source files (up to 5 for unit, 5 for integration, 3 for E2E)
2. **Generation** — Tests written to `src/__tests__/`, `tests/integration/`, `tests/e2e/`
3. **Execution** — Tests run via vitest, results stored in Redis
4. **Fixing** — Failed tests analyzed and source code patched
5. **Iteration** — Steps 3-4 repeat up to 5 times
6. **Report** — Results returned to CircleCI

## Next Steps

- Read [How It Works](/guide/how-it-works) to understand the agent pipeline
- Explore the [Architecture](/architecture/overview) for a deep dive
- Check the [Reference](/reference/agents) for API details
