# Quick Commit Guide

## 🚀 Interactive Commit (Recommended)

Use commitizen for an interactive commit experience:

```bash
bun run commit
```

This will prompt you through:
1. **Type** - Select commit type (feat, fix, docs, etc.)
2. **Scope** - Optional scope (api, service, etc.)
3. **Subject** - Short description
4. **Body** - Longer description (optional)
5. **Breaking changes** - If applicable
6. **Issues** - Reference issues (optional)

### Example Session:
```
? Select the type of change that you're committing: feat
? What is the scope of this change (e.g. component or file name): api
? Write a short, imperative tense description: add fishing endpoint
? Provide a longer description: (press enter to skip)
? Are there any breaking changes? No
? Does this change affect any open issues? No
```

Result: `feat(api): add fishing endpoint`

## ✍️ Manual Commit

If you prefer to write commits manually:

```bash
git commit -m "type(scope): subject"
```

**Examples:**
```bash
git commit -m "feat: add fishing system"
git commit -m "fix(inventory): correct cap calculation"
git commit -m "docs: update readme"
git commit -m "chore: update dependencies"
```

## 🔍 Validate Commits

### Check Last Commit
```bash
bun run commitlint:last
```

### Check Commit Message Format
```bash
echo "feat: add new feature" | bun run commitlint --stdin
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `bun run commit` | Interactive commit with commitizen |
| `bun run commit:retry` | Retry last commit with commitizen |
| `bun run commitlint:last` | Validate last commit message |

## 📋 Commit Types

| Type | When to Use | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add user authentication` |
| `fix` | Bug fix | `fix: resolve login issue` |
| `docs` | Documentation | `docs: update api guide` |
| `style` | Formatting | `style: format with biome` |
| `refactor` | Code restructure | `refactor: extract service` |
| `perf` | Performance | `perf: optimize queries` |
| `test` | Tests | `test: add unit tests` |
| `chore` | Maintenance | `chore: update deps` |
| `ci` | CI/CD | `ci: add workflow` |
| `build` | Build system | `build: update config` |
| `revert` | Revert commit | `revert: revert feature` |

## 🎯 Quick Tips

### Good Commits ✅
```bash
feat: add fishing endpoint
fix(inventory): correct cap calculation
docs: update token extraction guide
refactor(service): extract http client
test(controller): add item tests
```

### Bad Commits ❌
```bash
Update files          # Missing type
feat: Added feature   # Past tense, capitalized
fix: bug fix          # Too vague
FIX: resolve issue    # Wrong case
feat: Fix bug.        # Wrong type, period
```

## 🔄 Workflow

### Standard Workflow
```bash
# 1. Make changes
git add .

# 2. Interactive commit
bun run commit

# 3. Push
git push
```

### Quick Workflow (if you know the format)
```bash
# 1. Make changes
git add .

# 2. Manual commit
git commit -m "feat: add new feature"

# 3. Push
git push
```

## 🆘 Troubleshooting

### Commit Rejected
If your commit is rejected:

1. **Check the error message** - It will tell you what's wrong
2. **Fix the message** - Use `git commit --amend` to edit
3. **Use interactive mode** - Run `bun run commit` for guidance

### Amend Last Commit
```bash
git commit --amend
```

### Retry with Commitizen
```bash
bun run commit:retry
```

### Bypass Validation (Emergency Only)
```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Bypassing validation may cause CI to fail!

## 📚 Full Documentation

For detailed information, see:
- [COMMIT_CONVENTION.md](.github/COMMIT_CONVENTION.md) - Complete guide
- [Conventional Commits](https://www.conventionalcommits.org/) - Specification

---

**Quick Start:** Just run `bun run commit` and follow the prompts! 🎉
