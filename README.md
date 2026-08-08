# PKMNS Backend (NestJS)

Ambalnagar community portal API — NestJS + TypeORM + PostgreSQL.

## Setup

1. Ensure PostgreSQL is running and database `pkmns` exists (created automatically if you run the seed connect, or):

```bash
# Windows
"C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -c "CREATE DATABASE pkmns;"
```

2. Copy `.env` (already present) or set:

```
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=root
DB_DATABASE=pkmns
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
FRONTEND_URL=http://localhost:3000
```

3. Install & run:

```bash
npm install
npm run start:dev
```

API: `http://localhost:3001`

On first boot, admin users and service categories are seeded automatically.

### Default admin

- username: `mainadmin`
- password: `119313`
- email: `mathisurendhar@gmail.com`
