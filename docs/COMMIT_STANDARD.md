# Conventional Commits Standard
## Format
<type>(scope): message

### Types
- feat: new feature
- fix: bug fix
- docs: documentation
- chore: maintenance

## Examples

### Feature commits:

- `"feat(auth): add password reset functionality"`
- `"feat(api): implement user profile endpoints"`
- `"feat: add dark mode toggle"`

### Bug fix commits:

- `"fix(login): resolve token expiration issue"`
- `"fix(cart): correct price calculation for discounts"`
- `"fix: prevent memory leak in event listeners"`

### Documentation commits:

- `"docs(readme): update installation instructions"`
- `"docs(api): add examples for authentication flow"`
- `"docs: fix typos in contributing guide"`

### Maintenance/chore commits:

- `"chore(deps): upgrade React to version 18.2"`
- `"chore(config): update ESLint rules"`
- `"chore: remove deprecated utility functions"`

## A few notes:

- The scope (in parentheses) is optional but helps clarify what part of the codebase is affected
- The message should be concise and use imperative mood ("add" not "added")
- Keep the first line under 72 characters when possible
