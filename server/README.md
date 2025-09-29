# Employee Management API

## Setup

1. Copy environment variables:

```bash
copy .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Run migrations and start dev server:

```bash
npm run migrate
npm run dev
```

The API will be available at `http://localhost:8080`.

Seeded admin credentials:
- Email: `admin@example.com`
- Password: `admin123`

## Scripts
- `npm run dev` – start in watch mode
- `npm run build` – build TypeScript
- `npm run start` – start compiled server
- `npm run migrate` – create tables and seed default user
- `npm test` – run tests

## Endpoints
- `POST /api/auth/login`
- `GET /api/employees?q=`
- `POST /api/employees`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`