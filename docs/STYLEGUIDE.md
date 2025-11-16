# Polar-EQ – Code Style Guide (JavaScript & TypeScript)

> **Version**: 1.0
>
> **Languages**: JavaScript (Node.js, ESM), TypeScript
>
> **Applies To**: Backend services, scripts, utilities, shared modules
>
> **Purpose**: Provide a consistent, clean, scalable, and readable coding standard.

## 1. General Principles

- Prefer TypeScript for new -development; use JavaScript for lightweight scripts.

- Use ES Modules (`import` / `export`) everywhere.

- Maintain `strict` typing (`strict`, `noImplicitAny`, etc.).

- Prioritize readability over cleverness.

- Consistency is more important than personal preference.

- Code should be:

  - Predictable (no hidden side effects)

  - Modular

  - Testable

  - Self-documenting

## 2. Naming Conventions
### 2.1 Variables (local, block, function)

- Use camelCase for all local variables.

- Use descriptive, intention-revealing names.

- Temporary variables may use `tmp` or `temp`.

```ts
let retryCount = 0;
const requestId = "abc123";
let tmpResult: string | null = null;
```

# 2.2 Constants

- Use ALL_CAPS_SNAKE_CASE for:

  - Module-level constants

  - Configuration-like constants

  - Values that do not change

```ts
export const API_VERSION = "v1";
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 5000;
```

# 2.3 Functions

- Use camelCase with verb-first names.

```ts
function getUserById(id: string) {}
function calculateTotal(price: number, tax: number) {}
```

Boolean-returning functions use `is`, `has`, `should`, `can`.

```ts
function isAuthorized(user: User) {}
function hasPermission(user: User, perm: string) {}
```

# 2.4 Classes, Types, Interfaces, Enums

- PascalCase for:

  - Classes

  - Interfaces

  - Type aliases

  - Enums

```ts
class UserService {}
interface UserPayload {}
type UserId = string;
enum LogLevel {
  Info = "info",
  Error = "error",
}
```

## 2.5 Private and Internal Members
### TypeScript Private Fields:

```ts
class Cache {
  private store = new Map<string, string>();
}
```

### JavaScript Private Fields:

```ts
class Cache {
  #store = new Map();
}
```

### Conventionally Private (JS or TS):

```ts
class LegacyCache {
  _store = {};
}
```

## 2.6 Module Scope & API Visibility

- Internal-only values use an `_underscore` prefix.

- Exported values must be intentionally designed and named.

```ts
const _poolLimit = 10; // internal

export const MAX_POOL_SIZE = 50; // public
```

## 2.7 Environment Variables

- Always ALL_CAPS_SNAKE_CASE.

```bash
DATABASE_URL="postgres://..."
NODE_ENV="production"
```

Use through:

```ts
const DATABASE_URL = process.env.DATABASE_URL;
```

## 3. File & Folder Structure
### 3.1 File Naming

- Use kebab-case.

- One component/module per file.

Examples:

```pgsql
user-service.ts
http-error.ts
get-user.handler.ts
```

## 3.2 Folder Layout (Recommended)
```pgsql
src/
  config/
  domain/
    user/
      user.entity.ts
      user.repository.ts
      user.service.ts
  infrastructure/
    db/
    http/
  api/
    routes/
    handlers/
  utils/
tests/
  unit/
  integration/
```

## 4. Functions & Async Code

- Prefer async/await over `.then()`.

- Avoid top-level await in libraries; wrap in initialization functions.

```ts
async function fetchUser(id: string): Promise<User> {
  return db.getUser(id);
}
```

## 5. Error Handling

- Always throw `Error` objects or subclasses.

```ts
class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "HttpError";
  }
}
```

- Wrap asynchronous errors cleanly:

```ts
try {
  const user = await fetchUser(id);
} catch (err) {
  logger.error({ err }, "User fetch failed");
  throw err;
}
```

## 6. Comments & Documentation

- Comment why, not what.

```ts
// Retry only transient network failures
async function fetchWithRetry(...) {}
```

- Use JSDoc/TSDoc for public APIs:

```ts
/**
 * Fetches a user by ID.
 */
export async function getUserById(id: string): Promise<User> { ... }
```

## 7. Linting & Formatting

Use:

- ESLint for correctness + conventions

- Prettier for formatting

Required scripts:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write ."
  }
}
```

> Run `npm run lint:fix` before committing.

# 8. Code Examples
## 8.1 Before (JavaScript)

```js
var x = 10;
function FOO(ID) { return db.find({ ID }); }
class user_service {
  constructor() { this.Cache = {}; }
}
```

## 8.2 After (JavaScript)
```js
const MAX_RETRY_COUNT = 10;

function getUser(id) {
  return db.find({ id });
}

class UserService {
  constructor() {
    this._cache = {};
  }

  add(user) {
    this._cache[user.id] = user;
  }
}
```

## 8.3 Before (TypeScript)

```ts
export async function handler(req, res) {
  let u = await db.getUser(req.params.id);
  if (!u) res.status(404).send("no user");
  else res.send(u);
}
```

## 8.4 After (TypeScript)

```ts
export async function getUserHandler(req: Request, res: Response) {
  const userId = req.params.id;
  const user = await getUserById(userId);

  if (!user) return res.status(404).json({ message: "User not found" });

  return res.json(user);
}
```

## 9. Summary Table
| Concept | Convention | Example |
| ------- | ---------- | ------- |
| Local variables | camelCase | `userName` |
| Temp variables | `tmp*` | `tmpResult` |
| Constants | ALL_CAPS | `MAX_SIZE` |
| Functions | camelCase (verb-first) | `getUser()` |
| Classes/Types/Interfaces | PascalCase | `UserService` |
| Private TS fields | `private` or `#field` | `private store` |
| Private JS convention | `_field` | `_cache` |
| Module-internal | `_prefix` | `_limit` |
| Env vars | ALL_CAPS | `DATABASE_URL` |
