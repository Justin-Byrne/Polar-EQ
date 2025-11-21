# STYLEGUIDE

## 1. Spacing Rules for Symbols

Use **one or more spaces** before and after the following symbols unless specified otherwise.

### 1.1 Basic Arithmetic & Logical Symbols
- `+` Addition
- `-` Subtraction
- `*` Multiplication
- `/` Division
- `%` Modulo
- `<` Less than
- `>` Greater than
- `<=` Less than or equal
- `>=` Greater than or equal
- `=` Assignment
- `==` Loose equality
- `===` Strict equality
- `!=` Not equal
- `!==` Strict not equal
- `&&` Logical AND
- `||` Logical OR
- `??` Nullish coalescing
- `|` Bitwise OR
- `!` Logical NOT
- `?` Ternary conditional
- `=>` Arrow function

### 1.2 Grouping Symbols
- `(` `)` Parentheses — space before and after
- `{` `}` Braces — space before and after
- `[` `]` Brackets — space before and after

### 1.3 Commas
- `,` must have **one or more spaces after it**.

---

## 2. Regex-Based Spacing Rules

### 2.1 `LetterOrDigitOrUnderscore:`
```
[A-Za-z0-9_]:
```
Must have **one or more spaces after the colon**.

### 2.2 Comma Then Newlines
```
,[\r\n]+
```
This case is **ignored** — keep as-is.

---

## 3. Auxiliary Symbols (Ignored Cases)
The following patterns are exceptions and **do not require added spacing**:
- `++` unary plus
- `--` unary negation
- `);` closing paren + semicolon
- `};` closing brace + semicolon
- `];` closing bracket + semicolon
- `!.` NOT operator before dot
- `?.` optional chaining
- `).` closing parentheses then dot

---

## 4. Formatting Conventions

### 4.1 Block Formatting Style
Use **Allman-style formatting** (opening brace on a new line) for:
- Classes
- Functions
- Conditionals (`if`, `for`, `do`, `while`, `do while`)

### Example
```ts
function getUser ( )
{
    if ( condition )
    {
        // ...
    }
}
```

---

## 5. Naming Conventions

### 5.1 Variables & Constants
| Concept                  | Convention                 | Example         |
| ------------------------ | -------------------------- | --------------- |
| Local variables          | camelCase                  | `userName`      |
| Internal local variables | camelCase + `_` prefix     | `_user`         |
| Temp variables           | camelCase + `_` prefix     | `_tempValue`    |
| Constants                | ALL_CAPS                   | `MAX_SIZE`      |
| Env variables            | ALL_CAPS                   | `DATABASE_URL`  |

### 5.2 Functions & Methods
- Use **camelCase**, verb-first naming.
  Example: `getUser ( )`

### 5.3 Classes, Types, Interfaces
- Use **PascalCase**.
  Example: `UserService`

### 5.4 Private / Internal Fields
| Language/Context         | Convention     | Example         |
| ------------------------- | -------------- | ---------------- |
| Private TS fields         | `private` or `#` prefix | `private store` / `#cache` |
| Private JS (by convention) | `_` prefix     | `_cache`         |
| Module-internal           | `_prefix`      | `_limit`         |

---

## 6. Summary
This style guide enforces:
- Consistent spacing around operators and grouping symbols
- Allman-style block formatting
- Clear naming conventions for variables, functions, and classes
- Predictable exceptions for unary and structural symbols

This ensures readability, uniformity, and maintainable source code across all projects.

