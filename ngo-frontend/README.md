# Volunect — NGO Volunteer Platform Frontend

Premium dark editorial React frontend for the Volunect NGO Volunteer Management Platform.

## Tech Stack
- React 19 + Vite
- Tailwind CSS v3 (custom design system)
- Framer Motion (animations)
- React Router DOM v6
- Axios (with JWT interceptors + auto-refresh)
- Recharts (analytics dashboards)
- React Icons

## Design System
| Token | Value |
|---|---|
| Background | `#0B0B0B` |
| Secondary BG | `#111111` |
| Card | `#181818` |
| Primary (Teal) | `#8FAFB2` |
| Primary Hover | `#A8C5C7` |
| Text Primary | `#FFFFFF` |
| Text Secondary | `#B8B8B8` |
| Border | `rgba(255,255,255,0.08)` |

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set API URL
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api/v1

# 3. Start dev server
npm run dev
# → http://localhost:5173

# 4. Build for production
npm run build
```

## Deployment

This project is configured for Vercel deployment using `vercel.json`.

1. Push your repository to GitHub.
2. Create a new Vercel project and point it at the `ngo-frontend` folder.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add the production environment variable:
   - `VITE_API_URL=https://<your-render-backend-url>/api/v1`
6. Deploy the project.

> If your backend is hosted on Render, use the Render service URL in `VITE_API_URL`.

## Pages & Routes

### Public
| Route | Page |
|---|---|
| `/` | Landing page (Hero, Stats, Programs, Testimonials) |
| `/programs` | Browse all programs (search, filter, paginate) |
| `/programs/:id` | Program detail + join/leave |
| `/login` | Login |
| `/register` | Register (Volunteer or NGO) |

### Volunteer (protected)
| Route | Page |
|---|---|
| `/volunteer/dashboard` | Stats, recent programs, activity |
| `/volunteer/participations` | All joined/waitlisted programs |
| `/volunteer/certificates` | Download PDF certificates |
| `/volunteer/activity` | Timeline activity feed |
| `/volunteer/profile` | Profile + impact stats |

### NGO (protected)
| Route | Page |
|---|---|
| `/ngo/dashboard` | Stats, Recharts, recent programs |
| `/ngo/programs` | CRUD: edit, delete programs |
| `/ngo/create-program` | Create new program form |
| `/ngo/analytics` | Bar, Pie, Line charts |
| `/ngo/activity` | Timeline activity feed |
| `/ngo/profile` | NGO profile setup / status |

## Key Features
- **JWT Auth** — stored in localStorage, auto-refreshed on 401
- **Role-based routing** — NGO and Volunteer see different dashboards
- **Animated grain overlay** — subtle film-grain texture across all pages
- **Framer Motion** — fade-up, parallax hero, stagger grids, card hover
- **Debounced search** — 400ms debounce on program search
- **Waitlist UX** — shows waitlist badge on full programs
- **Recharts** — Bar, Pie charts on NGO analytics dashboard
- **PDF download** — certificate download via blob URL
- **Toast notifications** — success/error feedback on all actions
- **Responsive** — desktop-first, fully mobile-responsive
