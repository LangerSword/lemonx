# lemonx CLI

The `lemonx` CLI package is an npm package that generates CircleCI configuration for integrating with lemon.test.

## Package Info

| Property | Value |
|---|---|
| **Name** | `lemonx` |
| **Version** | 0.2.0 |
| **Source** | `lemonx-pkg/` |
| **Binary** | `lemonx` |
| **Build Tool** | esbuild |

## Installation

```bash
npx lemonx init
```

No global installation needed — `npx` handles it automatically.

## Commands

### `init [dir]`

Generates a `.circleci/config.yml` file in the specified directory (defaults to current directory).

**Usage**:
```bash
# Initialize current directory
npx lemonx init

# Initialize a specific directory
npx lemonx init /path/to/my/repo
```

**What it does**:
1. Validates the target directory exists
2. Creates `.circleci/` directory if needed
3. Checks if a lemonx config already exists (skips if found)
4. Writes the CircleCI config with three jobs

**Generated Config Includes**:
- `ai-test-loop` job — runs the full generate + run + fix cycle
- `ai-generate-tests` job — generates tests only
- `ai-run-tests` job — runs existing tests only
- Branch filter: ignores `main` branch

**After Running**:
1. Open `.circleci/config.yml`
2. Replace `<namespace>/<resource-class>` with your CircleCI runner resource class
3. Commit and push to trigger the AI test loop

## Safety Checks

- **Directory validation**: Exits with error if the target directory doesn't exist
- **Duplicate detection**: Skips if the config already contains lemonx integration
- **Existing config warning**: Warns if a `.circleci/config.yml` already exists

## Building from Source

```bash
cd lemonx-pkg
npm install
npm run build
```

Output: `lemonx-pkg/dist/cli/index.js`

## Publishing

```bash
cd lemonx-pkg
npm publish
```

The `prepublishOnly` script runs `npm run build` automatically.
