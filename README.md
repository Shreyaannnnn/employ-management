Employee Data Management

Live Frontend: `https://employ-management-gamma.vercel.app/` 
Live Backend: `https://employ-management-fmtx.onrender.com` 

Overview
- Frontend: Next.js (TypeScript)
- Backend: Express (TypeScript), SQLite via better-sqlite3, Zod, JWT, Helmet, Rate limiting
- Tests: Jest + Supertest (backend)

Repository Structure
```
client/  # Next.js app
server/  # Express API
```

Environment Variables
- Server (`server/.env`)
```
PORT=8080
JWT_SECRET=please-change-me
JWT_EXPIRES_IN=1d
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=admin123
SQLITE_PATH=./data/employees.db
FRONTEND_URL=http://localhost:3000
```

- Client (`client/.env.local`)
```
NEXT_PUBLIC_API_BASE=http://localhost:8080
```

Local Development
1) Backend
```
cd server
npm install
npm run migrate
npm run dev
```
API at http://localhost:8080. Seeded admin: admin@example.com / admin123

2) Frontend
```
cd client
npm install
npm run dev
```
App at http://localhost:3000

API Summary (base: `${API_BASE}/api`)
- POST /auth/login -> { token }
- GET /employees?q=NAME
- POST /employees
- PUT /employees/:id
- DELETE /employees/:id

Deployment Notes
- Backend: Node 20+, build `npm run build`, start `npm start`. Set server/.env on your host and ensure `FRONTEND_URL` matches your client origin. Migrations run at startup.
- Frontend: Set `NEXT_PUBLIC_API_BASE` to backend URL.

Update Live Links
Replace the two URLs at the top of this file after deployment.

