# CareerBridge — Full Stack Job Portal

A responsive React, Express, and MongoDB job portal. Candidates can discover roles and track applications; employers can publish jobs and manage applicants from a role-specific dashboard.

## Requirements

- Node.js 18+ and npm
- MongoDB Community Server or a MongoDB Atlas connection string

## Run locally (Windows PowerShell)

1. Start MongoDB locally, or create a MongoDB Atlas cluster and copy its Node.js connection string. In Atlas, create a database user and allow your current IP address under **Network Access**. Do not commit the connection string or share it publicly.
2. In a backend terminal:

   ```powershell
   cd .\backend
   if (-not (Test-Path .env)) { Copy-Item .env.example .env }
   # Set MONGO_URI to your local MongoDB URI or Atlas connection string.
   # Set JWT_SECRET to a random secret with at least 32 characters.
   npm install
   npm run dev
   ```

3. In a second terminal, from the project root:

   ```powershell
   cd .\frontend
   npm install
   npm run dev
   ```

4. Confirm the backend reports a successful database connection, then open http://localhost:5173. The API health check is http://localhost:5000/api/health.

To add sample vacancies after MongoDB is connected, open another backend terminal and run:

```powershell
cd .\backend
npm run seed:jobs
```

## Roles and features

- Register or log in as a candidate or employer; passwords are bcrypt-hashed and sessions use JWT.
- Candidates can search and browse jobs, apply, view application statuses, and withdraw applications while they are still applied.
- Employers can post, close, and delete job listings, review applicants, and move applications through the available status workflow.
- The authenticated dashboard sidebar provides role-specific navigation for applications, job management, applicant review, and profile details.
- The public job board shows 50 vacancies per page and supports loading additional results.
- `npm run seed:jobs` in the backend adds 120 clearly labeled sample vacancies for development. It creates a reserved `.invalid` sample employer and is safe to rerun; these are not verified real job openings.
- Job search parameters: `search`, `location`, `type`, `skill`, `minSalary`, `sort`, `page`, `limit`.

## Main endpoints

`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

`GET /api/jobs`, `GET /api/jobs/mine`, `GET /api/jobs/:id`, `POST /api/jobs`, `PUT /api/jobs/:id`, `PATCH /api/jobs/:id/close`, `DELETE /api/jobs/:id`, `GET /api/jobs/:id/stats`

`POST /api/jobs/:id/apply`, `GET /api/jobs/:id/applications`, `GET /api/applications/my`, `PATCH /api/applications/:id/status`, `DELETE /api/applications/:id`

## Notes

- Protected requests require an `Authorization: Bearer <token>` header.
- API errors return JSON in the form `{ "message": "..." }`.
- `postman/Job-Portal.postman_collection.json` provides a starter collection. Set `baseUrl` to `http://localhost:5000/api` and add a token after login for protected routes.
