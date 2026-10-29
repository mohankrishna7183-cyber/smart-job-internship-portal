# Orbit — Smart Job & Internship Portal

A full-stack job portal MVP for candidates, recruiters, and administrators. The frontend is React + Vite; the REST API is Express + MongoDB/Mongoose.

## Features

- Candidate and recruiter registration, JWT sign-in, and protected dashboards.
- Server-enforced role authorization; public registration cannot create admin accounts.
- Job listings with debounced keyword/location search, job type, sorting, salary bounds, and pagination.
- Job detail pages and candidate applications with status tracking.
- Recruiter job publishing, listing close/reopen/archive controls, and application status management. Archiving preserves application history.
- Admin platform metrics, member search, and role management.
- Responsive layouts, loading/error states, and a persisted light/dark theme preference.
- Helmet, CORS allow-listing, rate limits, password hashing, input validation, and centralized API errors.

## Requirements

- Node.js 20 or newer and npm.
- MongoDB locally or a MongoDB Atlas connection string.

## Run locally

1. Copy `server/.env.example` to `server/.env`.
2. Set `MONGODB_URI` and replace `JWT_SECRET` with a long, random value. Set `CLIENT_URL` to the URL serving the frontend.
3. Install dependencies from the project root:

   ```sh
   npm install
   ```

4. Start MongoDB, then start the API and frontend:

   ```sh
   npm run dev
   ```

   The frontend is at `http://localhost:5173`; the API is at `http://localhost:5000/api`.
5. Register a candidate or recruiter account. To create the first administrator, use the protected bootstrap script below.

To configure the frontend API URL, set `VITE_API_URL` in a `client/.env` file (for example, `VITE_API_URL=https://api.example.com/api`).

## First administrator

Set `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` in the environment, then run:

```sh
npm run seed:admin -w server
```

The script creates an administrator only when that email does not already exist. It never demotes or changes an existing account.

## API overview

All successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "..." }`. Authenticated requests use `Authorization: Bearer <token>`.

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public (candidate/recruiter) |
| POST | `/api/auth/login` | Public |
| GET/PATCH | `/api/auth/me`, `/api/auth/profile` | Signed in |
| GET | `/api/jobs` | Public; supports search, filters, sort, page, and limit |
| GET | `/api/jobs/:id` | Public |
| GET/POST | `/api/jobs/mine`, `/api/jobs` | Recruiter/admin |
| PATCH/DELETE | `/api/jobs/:id` | Listing owner/admin; DELETE archives the listing and preserves applications |
| POST/GET | `/api/applications` | Candidate to apply; signed-in users to view their role-scoped applications |
| PATCH | `/api/applications/:id/status` | Listing owner/admin |
| GET | `/api/admin/overview`, `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/:id/role` | Admin |
| GET | `/api/health` | Public |

Job-listing query parameters include `search`, `location`, `company`, `skill`, `type`, `experience`, `salaryMin`, `salaryMax`, `sort` (`newest`, `oldest`, `salary_high`, `salary_low`), `page`, and `limit` (maximum 50).

## Test with Postman

Import [`postman/Orbit.postman_collection.json`](./postman/Orbit.postman_collection.json), set the `baseUrl` collection variable, then register/login and copy the returned token to `token`. The collection includes health, authentication, search, applications, recruiter, and admin requests.

## Production and deployment notes

- Deploy the client as a static Vite site and the API as a Node.js service. Configure the client’s `VITE_API_URL` to the deployed API URL.
- Configure `MONGODB_URI`, a unique high-entropy `JWT_SECRET` (at least 32 characters), `CLIENT_URL`, `NODE_ENV=production`, and `PORT` in the API host’s secret/environment settings; never commit `.env` files.
- The API allows browser requests only from the configured `CLIENT_URL`. Configure TLS and HTTPS at the hosting platform or reverse proxy.
- The API health check is `GET /api/health`.
- Run `npm run build` at the root before deploying the client.

## Current MVP boundaries

Resume documents are represented by a validated URL; this MVP does not upload files. Email notifications, saved jobs, recommendations, and chart visualizations need corresponding delivery/storage or analytics services before production use.
