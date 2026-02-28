# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

activist.org is a full-stack platform: Nuxt 4 (Vue 3 / TypeScript) frontend, Django 6 (Python) backend, and PostgreSQL 15 database. All three services run via Docker Compose. See `README.md` for the full tech stack.

### Starting the development environment

```bash
docker compose --env-file .env.dev up --build -d
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/v1/schema/swagger-ui/
- Admin panel: http://localhost:8000/admin
- Default credentials: `admin` / `admin`

### Docker volume mount caveat (important)

The frontend Docker container mounts `./frontend:/app` and runs as root inside Alpine. This means `.nuxt/` and `node_modules/` files created by the container will be owned by root and contain musl-platform native bindings. To run frontend lint/test commands locally (outside Docker), you must:

1. Stop the frontend container: `docker compose --env-file .env.dev stop frontend`
2. Remove root-owned artifacts: `sudo rm -rf frontend/node_modules frontend/.nuxt`
3. Reinstall: `cd frontend && yarn install`
4. Run your local commands (lint, test, etc.)
5. Restart the container: `docker compose --env-file .env.dev start frontend`

### Lint commands

- **Backend**: `cd backend && uv run ruff check .` and `uv run ruff format --check .`
- **Frontend**: `cd frontend && yarn lint` and `yarn format`

### Test commands

- **Backend** (must run inside Docker): `docker exec django_backend uv run pytest`
- **Frontend** (must run on host with gnu bindings): `cd frontend && yarn test --silent`

### Notes

- Backend tests require the `db` and `backend` containers to be running.
- Frontend Vitest tests run on the host, not in Docker. Ensure `node_modules` has glibc/gnu native bindings (not musl).
- The pre-commit tool is `prek` (Python package in dev dependencies). Run `prek run --all-files` to check all hooks.
- Node.js 24 and Yarn 4.12.0 (via Corepack) are required for the frontend.
- Python >=3.12 and `uv` are required for the backend.
