---
layout: home

hero:
  name: lemon.test
  text: Your codebase. Zero blind spots.
  tagline: An agentic AI testing platform that autonomously generates, executes, and fixes unit, integration, and E2E tests for TypeScript/JavaScript codebases.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: How It Works
      link: /guide/how-it-works
    - theme: alt
      text: View on GitHub
      link: https://github.com/berzi/lemon

features:
  - icon: 🧠
    title: AI-Powered Test Generation
    details: Specialized agents read your source code and autonomously write comprehensive vitest unit, integration, and E2E tests — no manual test writing required.
  - icon: 🔁
    title: Self-Healing Test Loop
    details: Tests run, failures are analyzed, and the editor agent applies source code fixes automatically. The loop iterates until everything passes.
  - icon: 🏗️
    title: CircleCI Machine Runner
    details: Runs directly on your own infrastructure via CircleCI machine runners. No webhooks, no tunnels, no external servers. Push to any branch and it just works.
  - icon: 📋
    title: Full Auditability
    details: Every test result, code analysis, and patch flows through Redis as an event log. Full traceability across every iteration and agent decision.
---

## Quick Start

Get up and running in minutes:

```bash
# 1. Start the CircleCI machine runner
docker compose -f docker-compose.runner.yml up -d

# 2. Initialize your target repository
npx lemonx init /path/to/your/repo

# 3. Push to any branch and watch it work
git push origin feature/my-branch
```

## How It Works

```
┌─────────────────┐
│  Your Repo      │
│  (GitHub)       │
└────────┬────────┘
         │ push
         ▼
┌─────────────────┐
│  CircleCI Cloud │
│  (assigns job)  │
└────────┬────────┘
         │ routes to your runner
         ▼
┌─────────────────────────────────────┐
│        Your Machine Runner          │
│                                     │
│  ┌───────────┐  ┌───────────────┐   │
│  │  Runner   │  │    Redis      │   │
│  │  Agent    │  │  (state/log)  │   │
│  └─────┬─────┘  └───────┬───────┘   │
│        │                │           │
│        ▼                ▼           │
│  ┌───────────────────────────┐      │
│  │       AI Agents           │      │
│  │                           │      │
│  │  testGeneratorAgent       │      │
│  │  integrationGeneratorAgent│      │
│  │  e2eGeneratorAgent        │      │
│  │  executorAgent            │      │
│  │  editorAgent              │      │
│  └───────────────────────────┘      │
│                                     │
│  Generate → Run → Fix → Repeat     │
└─────────────────────────────────────┘
```

## Key Concepts

| Concept | Description |
|---|---|
| **Agents** | Five specialized AI agents powered by Mastra, each with a distinct role in the test lifecycle |
| **Tools** | Purpose-built file I/O, Redis operations, and test runner tools that agents use to interact with your codebase |
| **Workflows** | Choose from `ai-test-loop` (full cycle), `ai-generate-tests`, or `ai-run-tests` |
| **Runner** | CircleCI Machine Runner 3 running on Docker — your code never leaves your infrastructure |

## Available Workflows

| Workflow | What it does |
|---|---|
| `ai-test-loop` | Full generate + run + fix cycle for unit, integration, and E2E tests |
| `ai-generate-tests` | Generate unit tests only |
| `ai-run-tests` | Run existing tests only |

## Tech Stack

- **AI Framework** — Mastra (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`)
- **LLM** — Cloudflare Workers AI (Llama 3.3 70B)
- **Test Framework** — vitest
- **State** — Redis (ioredis) + LibSQL (agent memory)
- **Runtime** — TypeScript, tsx, Node.js
- **CI/CD** — CircleCI Machine Runner 3 on Docker

## Explore the Docs

| Section | What you'll find |
|---|---|
| [Guide](/guide/getting-started) | Getting started, quick start, and how the platform works |
| [Architecture](/architecture/overview) | Deep dive into agents, tools, control flow, and state management |
| [Reference](/reference/agents) | Agents API, tools API, entry points, and configuration |
| [Deployment](/deployment/machine-runner) | Machine runner setup, CircleCI integration, and Docker configuration |
