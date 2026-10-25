# StockFlow Web

Frontend for the StockFlow inventory management system. It uses Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## Requirements

- Node.js 22.22.2+, 24.15.0+, or 26.0.0+
- pnpm 12
- A running `stockflow-api` instance

## Setup

Install dependencies:

```bash
pnpm install
```

Copy the environment example and set the backend URL:

```bash
cp .env.example .env.local
```

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev`: start the development server.
- `pnpm lint`: run ESLint.
- `pnpm test`: run Vitest and React Testing Library tests.
- `pnpm test:watch`: run unit and component tests in watch mode.
- `pnpm test:e2e`: run Playwright tests.
- `pnpm build`: create a production build.

Install Playwright browsers before the first E2E run:

```bash
pnpm exec playwright install
```

## Project structure

- `src/app`: routes and global styles.
- `src/components`: shared layout and UI components.
- `src/features`: feature-oriented UI and logic.
- `src/lib/api`: typed backend communication.
- `src/lib/query`: TanStack Query configuration.
- `src/providers`: application-wide providers.
- `tests/e2e`: important browser workflows.

Authentication and inventory business modules are outside the current foundation scope.
