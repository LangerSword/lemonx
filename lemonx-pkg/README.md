# lemonx

> Your codebase. Zero blind spots.

CLI tool that generates CircleCI config to integrate with the lemon.test AI testing platform.

## What This Does

`lemonx` is a thin client that generates `.circleci/config.yml` for your target repository. The actual AI agents (test generation, execution, self-healing) run in Docker containers via the [lemon.test](https://github.com/your-org/lemon) platform.

## Quick Start

```bash
# Generate CircleCI config in your target repo
npx lemonx init /path/to/your/repo
```

## How It Works

1. **`npx lemonx init`** generates a CircleCI config in your target repo with a webhook secret
2. You add the secret and your webhook URL to CircleCI project settings
3. When you push to any branch (not main), CircleCI sends a webhook to your lemon.test server
4. The lemon.test Docker containers receive the webhook and run the full test-fix loop:
   - Generate vitest unit, integration, and E2E tests
   - Run the tests and collect results
   - Automatically fix any failures
   - Repeat until all tests pass or max iterations reached

## Commands

| Command | Description |
|---|---|
| `npx lemonx init [dir]` | Generate CircleCI config with AI test integration |

## Setup

### 1. Initialize your repo

```bash
npx lemonx init /path/to/your/repo
```

This creates `.circleci/config.yml` and prints a webhook secret.

### 2. Configure CircleCI

In your CircleCI project settings, add:

| Variable | Value |
|---|---|
| `LEMON_WEBHOOK_URL` | Your lemon.test webhook URL |
| `LEMON_WEBHOOK_SECRET` | The secret printed by `npx lemonx init` |

### 3. Run the lemon.test platform

The AI agents run in Docker — see the [lemon.test repo](https://github.com/your-org/lemon) for setup:

```bash
# Clone the lemon.test platform
git clone https://github.com/your-org/lemon
cd lemon

# Start everything (Redis + app + webhook)
docker compose up
```

### 4. Push code

Push to any branch (not main) and CircleCI will trigger the AI test loop automatically.

## Available Workflows

| Workflow | What it does |
|---|---|
| `ai-test-loop` | Full generate + run + fix cycle for unit, integration, and E2E tests (default) |
| `ai-generate-tests` | Generate unit tests only |
| `ai-generate-integration-tests` | Generate integration tests only |
| `ai-generate-e2e-tests` | Generate E2E tests only |
| `ai-run-tests` | Run existing tests only |

## Architecture

```
Your Repo (GitHub)
       │
       │ push
       ▼
  CircleCI CI/CD
       │
       │ webhook
       ▼
lemon.test Docker (your machine/server)
  ├── Redis (state)
  ├── app container (local mode)
  └── webhook container (receives CircleCI triggers)
       │
       ├── testGeneratorAgent (unit tests)
       ├── integrationGeneratorAgent (integration tests)
       ├── e2eGeneratorAgent (E2E tests)
       ├── executorAgent (runs vitest)
       └── editorAgent (fixes failures)
```

The `lemonx` npm package only generates CircleCI config — all AI agents and the webhook server run in Docker.

## License

Open Source
