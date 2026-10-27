# CairoPulse AI

A full-stack event discovery and smart itinerary planning platform. The initial setup provides a React frontend, an Express API, and PostgreSQL database running together with Docker Compose.

## Requirements

- Docker Desktop
- Git

## Start the project

1. Copy `.env.example` to `.env` and replace the example secrets.
2. Run `docker compose up --build` from the project root.
3. Open `http://localhost:5173` for the frontend.
4. Open `http://localhost:5000/api/health` to confirm the API and database are available.

## Services

| Service | Address | Purpose |
| --- | --- | --- |
| Frontend | http://localhost:5173 | React and Tailwind UI |
| Backend | http://localhost:5000 | Express REST API |
| Database | localhost:5432 | PostgreSQL database |

## Useful commands

```bash
docker compose up --build
docker compose down
docker compose logs -f backend
docker compose ps
```

## Registration

Open `http://localhost:5173/register` to create an account. The API validates the input, hashes the password, saves the user in PostgreSQL, and starts a session using an HTTP-only cookie. Successful registration opens `/welcome`.

Useful API routes:

- `POST /api/auth/register` — create an account. Body: `name`, `email`, `password`, `confirmPassword`.
- `GET /api/auth/me` — return the signed-in user for the current session.

Run the registration integration check with `docker compose exec backend npm run test:registration`.

Never commit `.env`. Set a unique `JWT_SECRET` of at least 32 characters and replace the example database password before deploying.
