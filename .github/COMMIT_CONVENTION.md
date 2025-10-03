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

**Examples:**
```
feat(api): add new endpoint
fix(inventory): resolve cap issue
refactor(service): improve error handling
```

## 📝 Subject

- Use imperative, present tense: "add" not "added" nor "adds"
- Don't capitalize first letter
- No period (.) at the end
- Maximum 100 characters

**Good:**
```
feat: add fishing system
fix: resolve inventory cap bug
docs: update readme
```

**Bad:**
```
feat: Added fishing system  ❌ (past tense, capitalized)
fix: Resolves inventory cap bug.  ❌ (wrong tense, period)
docs: Updated the README file  ❌ (past tense, capitalized)
```

## 📄 Body (Optional)

- Use imperative, present tense
- Include motivation for the change
- Contrast with previous behavior
- Wrap at 100 characters per line

**Example:**
```
feat(api): add fishing endpoint

Add new endpoint to catch fish at different locations.
The endpoint accepts locationId and baitAmount parameters.
Returns fish data along with updated player stats.
```

## 🔗 Footer (Optional)

Reference issues, breaking changes, or other metadata:

**Breaking Changes:**
```
feat(api): change response format

BREAKING CHANGE: API now returns data in new format
```

**Issue References:**
```
fix(inventory): correct cap calculation

Fixes #123
Closes #456
```

## ✅ Valid Examples

### Simple commits
```bash
feat: add fishing system
fix: resolve inventory bug
docs: update api documentation
style: format code with biome
refactor: extract http client
perf: optimize database queries
test: add controller tests
chore: update dependencies
ci: add github actions
build: update bun to v1.2
```

### With scope
```bash
feat(api): add fishing endpoint
fix(inventory): correct cap calculation
docs(readme): add installation guide
refactor(service): improve error handling
test(controller): add item controller tests
```

### With body
```bash
feat(api): add fishing endpoint

Add new endpoint to catch fish at different locations.
Includes bait management and streak tracking.
Returns fish data with updated player stats.
```

### With footer
```bash
fix(inventory): correct cap calculation

The inventory cap was not being respected when buying items.
Now properly checks available space before purchase.

Fixes #123
```

### Breaking change
```bash
feat(api): change response format

BREAKING CHANGE: API responses now use camelCase instead of snake_case
```

## ❌ Invalid Examples

```bash
# Missing type
add fishing system  ❌

# Wrong type
feature: add fishing system  ❌

# Capitalized subject
feat: Add fishing system  ❌

# Past tense
feat: added fishing system  ❌

# Period at end
feat: add fishing system.  ❌

# Too vague
fix: bug fix  ❌

# Not imperative
feat: adding fishing system  ❌
```

## 🛠️ Enforcement

Commit messages are validated using:

1. **commitlint** - Validates format on commit
2. **Husky** - Runs commitlint via git hooks
3. **GitHub Actions** - Validates PR titles and commits

### Local Validation

Test your commit message:
```bash
echo "feat: add new feature" | bunx commitlint
```

### Bypass (Not Recommended)

In rare cases, you can bypass the hook:
```bash
git commit --no-verify -m "your message"
```

**Warning:** This is discouraged and may cause CI to fail!

## 📚 Tools & Helpers

### Commitizen (Optional)

Install commitizen for interactive commit messages:

```bash
bun add -D commitizen cz-conventional-changelog
```

Then commit with:
```bash
bunx cz
```

### VS Code Extension

Install "Conventional Commits" extension for VS Code:
- Extension ID: `vivaxy.vscode-conventional-commits`

### Git Aliases

Add to your `.gitconfig`:

```ini
[alias]
  cf = "!f() { git commit -m \"feat: $1\"; }; f"
  cx = "!f() { git commit -m \"fix: $1\"; }; f"
  cd = "!f() { git commit -m \"docs: $1\"; }; f"
  cc = "!f() { git commit -m \"chore: $1\"; }; f"
```

Usage:
```bash
git cf "add new feature"  # Creates: feat: add new feature
git cx "resolve bug"      # Creates: fix: resolve bug
```

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

## 🆘 Need Help?

If you're unsure about your commit message:

1. Check this guide
2. Look at recent commits in the repository
3. Ask in PR comments
4. Use commitizen for interactive help

---

**Last Updated:** 2025-10-03  
**Enforced by:** commitlint + Husky + GitHub Actions
