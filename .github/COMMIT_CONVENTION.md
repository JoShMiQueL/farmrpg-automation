# Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## 📋 Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## 🎯 Type

Must be one of the following:

| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(api): add fishing endpoint` |
| **fix** | Bug fix | `fix(inventory): correct cap calculation` |
| **docs** | Documentation changes | `docs: update token extraction guide` |
| **style** | Code style changes (formatting, etc.) | `style: format with biome` |
| **refactor** | Code refactoring | `refactor(service): extract http client` |
| **perf** | Performance improvements | `perf(api): optimize database queries` |
| **test** | Test changes | `test: add inventory controller tests` |
| **chore** | Maintenance tasks | `chore: update dependencies` |
| **ci** | CI/CD changes | `ci: add github actions workflows` |
| **build** | Build system changes | `build: update bun version` |
| **revert** | Revert previous commit | `revert: revert "feat: add feature"` |

## 🔍 Scope (Optional)

The scope provides additional context about which part of the codebase is affected:

- `api` - API endpoints
- `service` - Service layer
- `controller` - Controllers
- `model` - Data models
- `client` - Client/frontend
- `server` - Server/backend
- `inventory` - Inventory feature
- `fishing` - Fishing feature
- `items` - Items feature
- `player` - Player stats feature

## 📝 Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 100 characters

## 📄 Body (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 100 characters per line

## 🔗 Footer (Optional)

Reference issues, breaking changes, or other metadata:
- **Breaking Changes:** `BREAKING CHANGE: description`
- **Issue References:** `Fixes #123`, `Closes #456`

## 🚀 Quick Start

Write commits using the conventional format:

```bash
git commit -m "type(scope): subject"
```

Commits are automatically validated by commitlint via git hooks.

## ✅ Valid Examples

```bash
# Simple commits
feat: add fishing system
fix: resolve inventory bug
docs: update api documentation
chore: update dependencies

# With scope
feat(api): add fishing endpoint
fix(inventory): correct cap calculation
refactor(service): improve error handling

# With body
feat(api): add fishing endpoint

Add new endpoint to catch fish at different locations.
Includes bait management and streak tracking.
Returns fish data with updated player stats.

# With footer
fix(inventory): correct cap calculation

The inventory cap was not being respected when buying items.
Now properly checks available space before purchase.

Fixes #123

# Breaking change
feat(api): change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case
```

## ❌ Invalid Examples

```bash
add fishing system          # Missing type
feature: add fishing system # Wrong type
feat: Add fishing system    # Capitalized subject
feat: added fishing system  # Past tense
feat: add fishing system.   # Period at end
fix: bug fix                # Too vague
feat: adding fishing system # Not imperative
```

## 🛠️ Enforcement

Commit messages are validated using:
- **commitlint** - Validates format on commit
- **Husky** - Runs commitlint via git hooks
- **GitHub Actions** - Validates PR titles and commits

### Bypass (Emergency Only)

```bash
git commit --no-verify -m "your message"
```

⚠️ **Warning:** Bypassing validation may cause CI to fail!

## 🎓 Best Practices

1. **Keep commits atomic** - One logical change per commit
2. **Write clear subjects** - Should complete: "This commit will..."
3. **Use the body** - Explain why, not what (code shows what)
4. **Reference issues** - Link to relevant issues/PRs
5. **Be consistent** - Follow the convention strictly

## 📖 Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [Commitlint Documentation](https://commitlint.js.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)

---

**Last Updated:** 2025-10-03  
**Enforced by:** commitlint + Husky + GitHub Actions
