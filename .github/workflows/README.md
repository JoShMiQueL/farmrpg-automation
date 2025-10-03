# GitHub Actions Workflows

This directory contains GitHub Actions workflows for continuous integration and automation.

## 📋 Workflows

### 1. CI (`ci.yml`)
**Triggers:** Push to `main`/`develop`, Pull Requests

Runs comprehensive checks on every push and PR:

- **Lint & Format Check** - Validates code style using Biome
- **TypeScript Type Check** - Ensures type safety across the codebase
- **Run Tests** - Executes all unit tests with coverage reporting
- **All Checks Passed** - Final validation that all jobs succeeded

All jobs must pass for the workflow to succeed.

### 2. PR Checks (`pr-checks.yml`)
**Triggers:** Pull Request events (opened, synchronize, reopened)

Additional validation for pull requests:

- **PR Information** - Displays PR details
- **Validate PR** - Checks for:
  - Merge conflicts
  - Conventional commit messages
  - File change consistency (e.g., lock file updates)
- **Bundle Size Check** - Monitors client build size and warns if >5MB

### 3. Security & Dependencies (`security.yml`)
**Triggers:** 
- Weekly schedule (Mondays at 9:00 AM UTC)
- Manual dispatch
- Changes to dependency files

Security and dependency management:

- **Dependency Review** - Reviews dependency changes in PRs
- **Security Audit** - Checks for outdated dependencies
- **CodeQL Analysis** - Static code analysis for security vulnerabilities

### 4. Auto Label (`auto-label.yml`)
**Triggers:** Pull Requests and Issues opened

Automatically labels PRs and issues:

- **File-based Labels** - Labels based on changed files (server, client, tests, etc.)
- **PR Size Labels** - Adds size labels (xs, s, m, l, xl)
- **Conventional Commits** - Validates PR title follows conventional commits
- **Issue Labels** - Auto-labels issues based on keywords (bug, enhancement, etc.)

### 5. Auto Assign (`auto-assign.yml`)
**Triggers:** Pull Requests and Issues opened

Automatic assignment and welcoming:

- **Auto-assign PR** - Assigns PR to the author
- **Welcome Comment on PR** - Posts helpful checklist for new PRs
- **Welcome Comment on Issue** - Posts helpful message for new issues

### 6. Stale (`stale.yml`)
**Triggers:** Daily at 1:00 AM UTC, Manual dispatch

Manages stale issues and PRs:

- **Issues** - Marked stale after 30 days, closed after 7 more days
- **Pull Requests** - Marked stale after 45 days, closed after 14 more days
- **Exemptions** - Pinned, security, bug, and enhancement labels are exempt

### 7. Auto Merge (`pr-auto-merge.yml`)
**Triggers:** PR reviews, check suite completion, PR labeled

Automatically merges PRs:

- **Auto-merge** - Merges PRs labeled with `automerge` or `dependencies`
- **Squash Merge** - Uses squash merge method
- **Safety Checks** - Only merges if all checks pass

### 8. Release Drafter (`release-drafter.yml`)
**Triggers:** Push to `main`, Pull Requests

Automatically drafts releases:

- **Categorizes Changes** - Groups changes by type (features, fixes, etc.)
- **Version Management** - Suggests version based on labels
- **Changelog Generation** - Creates formatted changelog

### 9. Code Review (`code-review.yml`)
**Triggers:** Pull Requests (opened, synchronize, reopened)

Automated code review assistance:

- **Biome Check** - Runs Biome and comments issues on PR
- **Test Coverage** - Comments test coverage results
- **PR Metrics** - Displays PR statistics (files changed, lines added/deleted)

## 🚀 Usage

### Running Workflows Locally

You can test most checks locally before pushing:

```bash
# Lint and format check
bun run ci

# Type check
bun run typecheck

# Run tests
bun run test

# Build client
bun run build:client
```

### Manual Workflow Dispatch

The **Security & Dependencies** workflow can be triggered manually:

1. Go to **Actions** tab in GitHub
2. Select **Security & Dependencies**
3. Click **Run workflow**

## 📊 Status Badges

Add these badges to your README to show CI status:

```markdown
![CI](https://github.com/JoShMiQueL/farmrpg-automation/workflows/CI/badge.svg)
![Security](https://github.com/JoShMiQueL/farmrpg-automation/workflows/Security%20%26%20Dependencies/badge.svg)
```

## 🔧 Configuration

### Bun Version
All workflows use the latest Bun version via `oven-sh/setup-bun@v2`.

### Caching
Dependencies are cached automatically by the setup-bun action for faster builds.

### Artifacts
Build artifacts from the client are retained for 7 days and can be downloaded from the Actions tab.

## 📝 Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test changes
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Revert previous commit

**Examples:**
```
feat(api): add fishing endpoint
fix(inventory): correct cap calculation
docs: update token extraction guide
ci: add GitHub Actions workflows
```

## 🛡️ Security

### CodeQL
CodeQL scans the codebase for security vulnerabilities and coding errors. Results are available in the **Security** tab.

### Dependency Review
Automatically reviews dependency changes in PRs to identify security risks.

## 🔄 Workflow Updates

To update workflows:

1. Create a new branch
2. Modify workflow files in `.github/workflows/`
3. Test changes by creating a PR
4. Merge once validated

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Bun CI/CD Guide](https://bun.sh/guides/runtime/cicd)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [CodeQL Documentation](https://codeql.github.com/docs/)

---

**Last Updated:** 2025-10-03
