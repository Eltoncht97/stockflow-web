# StockFlow Web

## Communication

- Communicate with me in clear, intermediate-level English.
- Keep explanations concise and direct.
- Code, comments, commits, documentation, and PRs must be in English.
- User-facing UI text must be in Spanish.

## Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query for server state
- React state for local UI state
- React Hook Form + Zod for forms
- Vitest + React Testing Library
- Playwright for E2E

Use `pnpm`.

Do not add dependencies without approval.

## Architecture

- Mobile first.
- Corporate admin dashboard style.
- Cards/lists on mobile, tables on desktop when appropriate.
- Desktop navigation: sidebar.
- Mobile navigation: Sheet/Drawer.
- Support light and dark themes.
- Accessibility is required.
- Prefer simple feature-oriented code.
- Avoid premature abstractions.
- Do not add Redux or Zustand unless there is a demonstrated need.

## API

The frontend consumes the separate `stockflow-api`.

- Use `NEXT_PUBLIC_API_URL`.
- Never hardcode API URLs.
- Centralize API communication in a typed `lib/api` layer.
- Use TanStack Query for queries, mutations, caching, and invalidation.
- The backend remains the source of truth for business rules.
- Authentication is currently out of scope.

## Forms and Errors

- Use React Hook Form + Zod.
- Frontend validation is for UX; backend validation remains authoritative.
- Handle API errors consistently.
- User-facing errors must be in Spanish.
- Never expose raw technical errors.

## Testing

Testing is part of every ticket.

- Use Vitest for unit tests.
- Use React Testing Library for component behavior.
- Use Playwright for important user workflows.
- Prefer accessible selectors.
- Test relevant loading, empty, success, and error states.
- Do not chase 100% coverage.

## Tools

- Use Context7 when current library documentation is needed.
- Use the Playwright CLI skill for browser inspection and E2E work.
- Use installed skills when relevant, but do not invoke them unnecessarily.

## Agent Workflow

Every implementation ticket follows:

1. Implementer
2. Tester
3. Reviewer
4. Fixes
5. Final verification

Use subagents when available.

Do not let multiple agents modify the same files concurrently.

### Implementer
- Inspect relevant code first.
- Implement only the ticket scope.
- Keep the solution simple.
- Do not silently add backend requirements.

### Tester
- Review the implementation independently.
- Add or improve relevant tests.
- Look for regressions and edge cases.
- Use Playwright for user-facing workflows.

### Reviewer
- Review the final diff independently.
- By default, do not modify code.
- Check correctness, accessibility, responsive behavior, complexity, error handling, and missing tests.
- Classify findings by severity.

## Workflow

Before non-trivial changes, show a short plan.

Avoid unrelated refactors.

Before considering a ticket complete, run:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Run relevant Playwright tests for user-facing changes.

## Git

- Use feature branches.
- Prefer one ticket per branch.
- Use Conventional Commits.
- Do not push, merge, or open PRs unless explicitly requested.

## Scope

This is an educational and portfolio project.

Prefer professional, simple solutions over enterprise-level overengineering.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
