# JS / TypeScript Universal Conventions

> Referenced on demand by `.cursor/rules/02-tech-stack.mdc`. Apply ONLY when the project's stack is JS / TypeScript. Ignore for other languages.

### Language
- TypeScript in **strict mode** (`"strict": true` + `"noUncheckedIndexedAccess": true`).
- `const` and `let` only, never `var`.
- Prefer type inference; annotate only public APIs and exported types.
- No `any`. Use `unknown` + narrowing when the type is truly unknown.

### Components & modules (React / Next.js)
- Functional components + hooks only. No class components.
- **Named exports only.** No default exports (avoids rename drift and improves refactoring).
- Exception: Next.js page/layout/route files that require default exports by convention.

### File & folder naming
- Folders: `kebab-case`
- React components: `PascalCase.tsx`
- Hooks: `camelCase` starting with `use` (e.g. `useAuth.ts`)
- Utilities, types, constants: `kebab-case.ts` (e.g. `date-utils.ts`)

### Imports
Order (separate with a blank line):
1. React / Next / framework primitives
2. Third-party packages
3. Internal absolute imports (`@/…`)
4. Relative imports (`./`, `../`)

Alphabetical within each group. Prefer absolute paths with an `@/` alias over long relative chains. Avoid barrel files (`index.ts`) for leaf modules — they hurt tree-shaking and introduce circular imports.

### Style
- Early returns over nested `if`.
- Guard clauses first, happy path last.
- Destructure props at the top of the function.
- No magic numbers — extract to a named constant.
