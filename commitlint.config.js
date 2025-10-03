/**
 * Commitlint configuration
 * Enforces Conventional Commits specification
 * @see https://www.conventionalcommits.org/
 * @see .github/COMMIT_CONVENTION.md
 */

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "chore",
        "ci",
        "build",
        "revert",
      ],
    ],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
    "subject-empty": [2, "never"],
    "subject-max-length": [2, "always", 100],
    "type-empty": [2, "never"],
    "type-case": [2, "always", "lower-case"],
    "scope-empty": [0],
    "scope-case": [2, "always", "lower-case"],
    "body-max-line-length": [2, "always", 100],
    "footer-max-line-length": [2, "always", 100],
  },
};
