# Repository Guidelines

## Project Structure & Module Organization
- `backend/` is the NestJS API. Core code lives in `backend/src/` with feature modules in `backend/src/modules/`, entities in `backend/src/entities/`, shared utilities in `backend/src/common/`, and migrations in `backend/src/migrations/`.
- `frontend/` is the Next.js 14 app. Routes and UI are in `frontend/app/`, reusable components in `frontend/app/components/`, and static assets in `frontend/public/`.
- `docs/` holds architecture and feature docs; `observability/` contains Prometheus/Grafana configs; `scripts/` contains helper scripts.

## Build, Test, and Development Commands
- `make dev` starts Docker dev services with hot reload.
- `make start` / `make stop` controls production-like Docker services.
- `make test`, `make test-backend`, `make test-frontend`, `make test-e2e` run test suites.
- `make lint` / `make format` run Biome linting and formatting.
- Local (no Docker):
  - `cd backend && npm run start:dev` and `cd frontend && npm run dev`.
  - `cd backend && npm run migration:run` to apply DB migrations.

## Coding Style & Naming Conventions
- TypeScript throughout; follow Biome formatting (`make lint`, `make format`).
- Naming: `camelCase` variables/functions, `PascalCase` classes/types, `UPPER_SNAKE_CASE` constants.
- Prefer `const`, avoid `any`, keep functions small and focused.

## Testing Guidelines
- Jest is used for backend and frontend.
- Backend tests: `backend/@tests/unit/` and `backend/@tests/e2e/` with `*.spec.ts` naming.
- Frontend tests generally use `*.test.tsx`. Storybook stories use `*.stories.tsx` in `frontend/app/stories/`.
- Coverage goals: backend 80%+, frontend 70%+. Run `npm run test:cov` in `backend/` for coverage reports.

## Commit & Pull Request Guidelines
- Commit messages follow Conventional Commits: `feat(scope): message` (e.g., `fix(auth): handle token expiry`). Keep subject ≤72 chars and use imperative mood.
- PRs should have a clear title, link related issues, and include screenshots/GIFs for UI changes. Keep PRs focused and ensure tests, lint, and format checks pass.

## Security & Configuration
- Copy env templates: `.env.example`, `backend/.env.example`, and `frontend/.env.local.example`.
- Store secrets in `.env` files; never commit credentials.
