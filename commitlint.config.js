// Commitlint configuration
// Enforces Conventional Commits specification
// https://www.conventionalcommits.org/

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum - allowed commit types
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation changes
        'style',    // Code style changes (formatting, etc.)
        'refactor', // Code refactoring
        'perf',     // Performance improvements
        'test',     // Test changes
        'chore',    // Maintenance tasks
        'ci',       // CI/CD changes
        'build',    // Build system changes
        'revert',   // Revert previous commit
      ],
    ],
    // Subject case - must be lowercase
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    // Subject must not be empty
    'subject-empty': [2, 'never'],
    // Subject max length
    'subject-max-length': [2, 'always', 100],
    // Type must not be empty
    'type-empty': [2, 'never'],
    // Type must be lowercase
    'type-case': [2, 'always', 'lower-case'],
    // Scope is optional
    'scope-empty': [0],
    // Scope must be lowercase if provided
    'scope-case': [2, 'always', 'lower-case'],
    // Body max line length
    'body-max-line-length': [2, 'always', 100],
    // Footer max line length
    'footer-max-line-length': [2, 'always', 100],
  },
};
