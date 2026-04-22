# EduAchieve (New Project)

This is a clean rewrite of the existing FSD project with:

- consistent backend API (`/api/auth`, `/api/projects`)
- integrated frontend + backend in one runnable app
- same color/theme direction (orange + beige + navy)
- reliable local file data store (no MongoDB dependency)
- multipage frontend (home, auth, explore, submit, detail, profile, settings, notifications, student records)

## Run

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
copy .env.example .env
```

3. Start app:

```bash
npm start
```

4. Open:

http://localhost:5055

5. Verify you are running the new app (not FINAL-FSD):

http://localhost:5055/api/health

## API Surface

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/projects`
- `GET /api/projects/search?q=...`
- `GET /api/projects/suggestions?q=...`
- `GET /api/projects/batches`
- `GET /api/projects/:id`
- `POST /api/projects` (auth)
- `PUT /api/projects/:id` (auth + owner)
- `DELETE /api/projects/:id` (auth + owner)