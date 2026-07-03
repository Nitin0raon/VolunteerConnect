# NGO Volunteer Platform — Complete Setup Guide

This guide starts from zero. Follow every step in order.

---

## 1. Prerequisites — Install Everything

### Python 3.11+
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install -y python3.11 python3.11-venv python3-pip

# macOS (with Homebrew)
brew install python@3.11

# Windows — download from https://www.python.org/downloads/
# ✅ Check "Add Python to PATH" during install
```

### PostgreSQL 15+
```bash
# Ubuntu/Debian
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# macOS
brew install postgresql@15
brew services start postgresql@15

# Windows — download from https://www.postgresql.org/download/windows/
```

### Redis 7+
```bash
# Ubuntu/Debian
sudo apt install -y redis-server
sudo systemctl start redis
sudo systemctl enable redis

# macOS
brew install redis
brew services start redis

# Windows — use WSL2 or download from https://github.com/microsoftarchive/redis/releases
```

---

## 2. Create the PostgreSQL Database

```bash
# Ubuntu/Debian — switch to postgres user
sudo -u postgres psql

# macOS / Windows (if psql is in PATH)
psql -U postgres
```

Inside the psql prompt:
```sql
CREATE DATABASE ngo_platform;
CREATE USER ngo_user WITH PASSWORD 'ngo_password';
GRANT ALL PRIVILEGES ON DATABASE ngo_platform TO ngo_user;
\q
```

---

## 3. Set Up the Project

```bash
# Clone / unzip the project into a folder
cd /path/to/backend

# Create a virtual environment
python3 -m venv venv

# Activate it
# Linux/macOS:
source venv/bin/activate
# Windows (CMD):
venv\Scripts\activate.bat
# Windows (PowerShell):
venv\Scripts\Activate.ps1
```

---

## 4. Install Python Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 5. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```env
SECRET_KEY=django-insecure-change-this-to-something-random-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL — match what you set in step 2
DB_NAME=ngo_platform
DB_USER=ngo_user
DB_PASSWORD=ngo_password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email — for development, emails print to console (no SMTP needed)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-gmail@gmail.com
EMAIL_HOST_PASSWORD=your-gmail-app-password
DEFAULT_FROM_EMAIL=NGO Platform <your-gmail@gmail.com>

FRONTEND_URL=http://localhost:3000
```

> **Note:** In development, `EMAIL_BACKEND` is set to `console` — emails print in the terminal.
> To use real SMTP, create a Gmail App Password: Google Account → Security → 2-Step Verification → App Passwords.

---

## 6. Create Log Directory

```bash
mkdir -p logs
```

---

## 7. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 8. Create a Superuser (Admin)

```bash
python manage.py createsuperuser
# Enter: email, first name, last name, password
# Role will be set to 'admin' automatically
```

---

## 9. Start the Development Server

```bash
python manage.py runserver
```

The API is now live at: **http://localhost:8000**

---

## 10. Verify Everything Works

```bash
# Health check — list programs (should return empty results)
curl http://localhost:8000/api/v1/programs/

# Should return 401 Unauthorized (correct — auth required)
```

---

## 11. Run the Test Suite

```bash
# Run all tests
python manage.py test tests --settings=config.settings.development -v 2

# Run only unit tests
python manage.py test tests.unit -v 2

# Run only API tests
python manage.py test tests.api -v 2
```

---

## 12. Deploy to Render and Vercel

### Backend — Render
1. Push your repository to GitHub.
2. Create a new Web Service in Render and connect the repository.
3. Use the existing `render.yaml` in the repo root.
4. Set the following environment variables in Render:
   - `DATABASE_URL` — your Neon DB URL
   - `REDIS_URL` — your Upstash Redis URL
   - `SECRET_KEY` — a secure Django secret key
   - `ALLOWED_HOSTS` — e.g. `your-render-service.onrender.com`
   - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USE_TLS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `DEFAULT_FROM_EMAIL`
   - `FRONTEND_URL` — your Vercel frontend URL
   - `CORS_ALLOWED_ORIGINS` — e.g. `https://your-frontend.vercel.app`
5. Confirm Render builds with:
   - `pip install -r requirements.txt`
   - `python manage.py collectstatic --no-input`
   - `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
6. After deploy, copy the Render service URL to use in the frontend `VITE_API_URL`.

### Frontend — Vercel
1. Create a new project in Vercel and connect the repository.
2. Select the `ngo-frontend` folder as the project root.
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL=https://<your-backend-url>/api/v1`
   - `NODE_ENV=production`
6. Deploy and verify the app loads and can call the backend API.

---

## API Reference

### Base URL
```
http://localhost:8000/api/v1/
```

### Authentication
All endpoints (except register/login) require:
```
Authorization: Bearer <access_token>
```

---

### Auth Endpoints

| Method | URL | Description | Auth Required |
|--------|-----|-------------|---------------|
| POST | `/auth/register/` | Register NGO or Volunteer | No |
| POST | `/auth/login/` | Login, get JWT tokens | No |
| POST | `/auth/logout/` | Blacklist refresh token | Yes |
| POST | `/auth/token/refresh/` | Refresh access token | No |
| GET | `/auth/me/` | Get current user profile | Yes |

**Register body:**
```json
{
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "volunteer",
  "password": "SecurePass123!",
  "password_confirm": "SecurePass123!"
}
```
> `role` must be `"ngo"` or `"volunteer"` — not `"admin"`

**Login body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

---

### NGO Endpoints

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| POST | `/ngos/profile/` | Create NGO profile | Yes | NGO |
| PATCH | `/ngos/profile/` | Update NGO profile | Yes | NGO |
| GET | `/ngos/profile/me/` | Get own NGO profile | Yes | NGO |
| GET | `/ngos/pending/` | List pending NGOs | Yes | Admin |
| POST | `/ngos/<id>/approve/` | Approve an NGO | Yes | Admin |
| POST | `/ngos/<id>/reject/` | Reject an NGO | Yes | Admin |
| GET | `/ngos/` | List approved NGOs | Yes | Any |
| GET | `/ngos/<id>/` | Get NGO detail | Yes | Any |

**Create NGO profile body:**
```json
{
  "organization_name": "Hope Foundation",
  "description": "We help underprivileged communities.",
  "website": "https://hopefoundation.org",
  "phone": "+91-9999999999",
  "address": "123 Main St, City"
}
```

**Reject body:**
```json
{ "reason": "Insufficient documentation provided." }
```

---

### Program Endpoints

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| GET | `/programs/` | List all programs | Yes | Any |
| POST | `/programs/` | Create program | Yes | Approved NGO |
| GET | `/programs/<id>/` | Get program detail | Yes | Any |
| PATCH | `/programs/<id>/` | Update program | Yes | Owner NGO |
| DELETE | `/programs/<id>/` | Delete program | Yes | Owner NGO |
| GET | `/programs/mine/` | My programs | Yes | NGO |
| GET | `/programs/<id>/participants/` | Program participants | Yes | Owner NGO |

**Create program body:**
```json
{
  "title": "Beach Cleanup Drive",
  "description": "Help clean the coastline.",
  "capacity": 30,
  "location": "Marine Beach, Chennai",
  "start_date": "2025-03-01",
  "end_date": "2025-03-02"
}
```

**Query params for listing:**
- `?search=beach` — search title/description
- `?status=active` — filter by status (active/completed/cancelled)
- `?ngo=1` — filter by NGO id
- `?page=2` — pagination
- `?ordering=-created_at` — sort

---

### Participation Endpoints

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| POST | `/participation/<program_id>/join/` | Join a program | Yes | Volunteer |
| POST | `/participation/<program_id>/leave/` | Leave a program | Yes | Volunteer |
| GET | `/participation/mine/` | My participations | Yes | Volunteer |

---

### Analytics Endpoints

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| GET | `/analytics/ngo-dashboard/` | NGO analytics | Yes | Approved NGO |
| GET | `/analytics/volunteer-dashboard/` | Volunteer analytics | Yes | Volunteer |

---

### Certificate Endpoints

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| POST | `/certificates/generate/<program_id>/<volunteer_id>/` | Generate certificate | Yes | Owner NGO |
| GET | `/certificates/mine/` | My certificates | Yes | Volunteer |
| GET | `/certificates/<id>/download/` | Download PDF | Yes | Volunteer/NGO |

---

### Activity Feed

| Method | URL | Description | Auth Required | Role |
|--------|-----|-------------|---------------|------|
| GET | `/activity/mine/` | My activity feed | Yes | Any |

---

## Standard Response Format

All endpoints return:

**Success:**
```json
{
  "success": true,
  "message": "Success",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "count": 42,
  "next": "http://localhost:8000/api/v1/programs/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": { "field": ["validation error"] },
  "status_code": 400
}
```

---

## Complete User Flow Example

```bash
# 1. Register an NGO
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"ngo@example.com","first_name":"Hope","last_name":"Foundation","role":"ngo","password":"SecurePass123!","password_confirm":"SecurePass123!"}'

# 2. Register a Volunteer
curl -X POST http://localhost:8000/api/v1/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"vol@example.com","first_name":"Jane","last_name":"Doe","role":"volunteer","password":"SecurePass123!","password_confirm":"SecurePass123!"}'

# 3. Login as Admin
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"AdminPass123!"}'
# Save the "access" token as ADMIN_TOKEN

# 4. Create NGO profile (login as NGO first to get NGO_TOKEN)
curl -X POST http://localhost:8000/api/v1/ngos/profile/ \
  -H "Authorization: Bearer $NGO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"organization_name":"Hope Foundation","description":"We help."}'
# Returns ngo profile id (e.g. 1)

# 5. Admin approves the NGO
curl -X POST http://localhost:8000/api/v1/ngos/1/approve/ \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 6. NGO creates a program
curl -X POST http://localhost:8000/api/v1/programs/ \
  -H "Authorization: Bearer $NGO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Beach Cleanup","description":"Coastal cleanup drive","capacity":10}'
# Returns program id (e.g. 1)

# 7. Volunteer joins the program
curl -X POST http://localhost:8000/api/v1/participation/1/join/ \
  -H "Authorization: Bearer $VOL_TOKEN"

# 8. NGO generates a certificate
curl -X POST http://localhost:8000/api/v1/certificates/generate/1/1/ \
  -H "Authorization: Bearer $NGO_TOKEN"

# 9. Volunteer downloads certificate
curl -X GET http://localhost:8000/api/v1/certificates/1/download/ \
  -H "Authorization: Bearer $VOL_TOKEN" \
  --output certificate.pdf
```

---

## Production Deployment

### Environment
Set `DJANGO_SETTINGS_MODULE=config.settings.production` and all required env vars.

### Collect Static Files
```bash
python manage.py collectstatic --noinput
```

### Run with Gunicorn
```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120
```

### Recommended Stack
- **Web server:** Nginx (reverse proxy to Gunicorn)
- **Database:** PostgreSQL on Supabase or Railway
- **Redis:** Upstash (free tier) or Redis Cloud
- **Hosting:** Render, Railway, or a VPS
- **Media files:** Cloudinary or AWS S3

---

## Architecture Summary

```
Request
  └─► View (auth, validate, call service, return response)
        └─► Service (all business logic)
              └─► Repository (all DB queries)
                    └─► Model (Django ORM)
```

**Key design decisions:**
- Business logic lives **only** in services, never in views or models
- All DB queries go through repositories — makes testing easy
- `select_for_update()` prevents race conditions on join/leave
- Redis caches only dashboard responses (5 min TTL), invalidated on data changes
- Emails sent synchronously via SMTP (no Celery needed)
- Waitlist uses FIFO ordering by `waitlist_position`
- Audit logs are immutable (admin cannot edit/delete them)
