# FitBuddy — AI Fitness Plan Generator

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo- https://3000-iflmarfbf92i07pzqezvm.e2b.app/-00e676?style=for-the-badge&logo=vercel&logoColor=white)](https:// https://3000-iflmarfbf92i07pzqezvm.e2b.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5-blue?style=flat-square&logo=google)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)

---

## 👥 Team

| Role | Name | Responsibilities |
| --- | --- | --- |
| 🏆 **Team Leader** | **Jude Rosary Immanuel** | Project architecture & system design, Gemini AI integration (`gemini.ts`), prompt engineering & JSON schema locking, code review, CI/CD & production deployment |
| 💻 **Team Member** | **Shadrack Joseph** | Database schema design (Drizzle ORM + PostgreSQL), API route handlers (`/api/generate`, `/api/feedback`, `/api/users`), data validation & normalizers |
| 🎨 **Team Member** | **Prabhu** | Frontend UI development — athlete intake form, 7-day plan display page, responsive layout & design system (Tailwind v4, Anton/Archivo/JetBrains Mono fonts, volt-on-void palette) |
| ⚙️ **Team Member** | **Sanjay Prabhakar** | Feedback loop engine & plan revision logic (`updateWorkoutPlanGemini`), local-engine fallback planner (`local-engine.ts`), resilience layer (truncated JSON auto-repair, Pro → Flash model fallbacks) |
| 🛡️ **Team Member** | **Vetrivel** | Admin dashboard (`/admin`), user management & CRUD operations, API testing (curl + integration tests), project documentation & README maintenance |

# FitBuddy — AI Fitness Plan Generator

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-3000-iflmarfbf92i07pzqezvm.e2b.app/-00e676?style=for-the-badge&logo=vercel&logoColor=white)](https://3000-iflmarfbf92i07pzqezvm.e2b.app/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![Gemini](https://img.shields.io/badge/Gemini-2.5-blue?style=flat-square&logo=google)](https://ai.google.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)

**Train. Eat. Adapt.** FitBuddy is a full-stack AI personal trainer: it generates
structured 7-day workout plans with **Gemini Pro**, delivers goal-aligned
nutrition tips with **Gemini Flash**, and **re-compiles your plan every time you
give feedback** — with the original plan frozen in an archive and a full
revision history.

> 🔗 **Try it now → [https://3000-iflmarfbf92i07pzqezvm.e2b.app/](https://3000-iflmarfbf92i07pzqezvm.e2b.app/)**

Built from the FitBuddy project documentation (FastAPI + Jinja2 + SQLite
reference architecture), implemented here on the production-grade equivalent of
this stack: **Next.js (App Router) + React Server Components + PostgreSQL via
Drizzle ORM**.

---

## 🌐 Live Demo

| Environment | URL |
| --- | --- |
| **Production** | [https://3000-iflmarfbf92i07pzqezvm.e2b.app/](https://3000-iflmarfbf92i07pzqezvm.e2b.app/) |
| **Local dev** | `http://localhost:3000` |

No sign-up required — enter an Athlete ID and start generating plans instantly.

---

## Architecture map (docs → this codebase)

| Documentation                    | This implementation                                   |
| -------------------------------- | ----------------------------------------------------- |
| `prompt → gemini_generator.py`   | `src/lib/gemini.ts` (REST `generateContent`, no SDK)  |
| Gemini Pro → 7-day workout       | `generateWorkoutPlanGemini()` — schema-locked JSON    |
| Gemini Flash → nutrition tip     | `generateNutritionTipFlash()`                         |
| Feedback → update plan           | `updateWorkoutPlanGemini()` + `feedback_log` in DB    |
| `routes.py` route handlers       | `src/app/api/generate`, `api/feedback`, `api/users`   |
| Jinja2 `index.html`              | `src/app/page.tsx` (athlete intake form)              |
| Jinja2 `result.html`             | `src/app/plan/[code]/page.tsx` (+ feedback form)      |
| Jinja2 `all_users.html`          | `src/app/admin/page.tsx` (view + delete users)        |
| SQLAlchemy + SQLite              | Drizzle ORM + PostgreSQL (`src/db/schema.ts`)         |
| `GOOGLE_API_KEY` env var         | Same — read server-side only, sent via `x-goog-api-key` header |

> **No-key safe mode:** if `GOOGLE_API_KEY` is missing (or every Gemini endpoint
> is unreachable), FitBuddy transparently falls back to a built-in deterministic
> plan engine (`src/lib/local-engine.ts`) so the whole product keeps working
> end-to-end. The UI badge shows `LOCAL MODE` when this happens.

---

## Project structure

```
.
├── public/images/hero-gym.jpg        # Generated hero artwork
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing + intake form  (= index.html)
│   │   ├── plan/[code]/page.tsx      # Plan + tip + feedback (= result.html)
│   │   ├── admin/page.tsx            # Registry / delete      (= all_users.html)
│   │   ├── not-found.tsx
│   │   ├── globals.css               # Design system (Tailwind v4 tokens)
│   │   ├── layout.tsx                # Fonts: Anton + Archivo + JetBrains Mono
│   │   └── api/
│   │       ├── generate/route.ts     # POST /api/generate
│   │       ├── feedback/route.ts     # POST /api/feedback
│   │       ├── users/[id]/route.ts   # DELETE /api/users/:id
│   │       └── health/route.ts       # GET  /api/health
│   ├── components/                   # PlanForm, FeedbackForm, DeleteUserButton,
│   │                                 # SiteNav, Marquee, Reveal
│   ├── db/
│   │   ├── index.ts                  # pg Pool + Drizzle client
│   │   └── schema.ts                 # fitbuddy_users, fitbuddy_plans
│   └── lib/
│       ├── gemini.ts                 # Gemini REST client + prompts + JSON schema
│       ├── fitness.ts                # Types, normalizers, lenient JSON parsing
│       └── local-engine.ts           # Offline fallback planner
├── drizzle.config.json
├── .env                              # DATABASE_URL (+ GOOGLE_API_KEY you add)
└── .env.example
```

## Database model

- **`fitbuddy_users`** — one row per athlete ID (`code`), with name, age,
  weight, goal, intensity.
- **`fitbuddy_plans`** — one row per athlete: `original_plan` (immutable first
  generation), `current_plan` (latest revision), `nutrition_tip`, `revision`
  counter, `feedback_log` (JSON array), AI source/model, timestamps.

---

## Setup in VS Code (5 minutes)

### 1. Prerequisites

- **Node.js 20+** (`node -v`)
- **PostgreSQL** running locally (or any connection string)
- A **Gemini API key** — free tier at <https://aistudio.google.com/apikey>

### 2. Open & install

```bash
# In VS Code: File → Open Folder… → this project
# Then open the integrated terminal (Ctrl+` / Cmd+`)
npm install
```

### 3. Configure environment

Copy the example and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
GOOGLE_API_KEY=paste_your_gemini_key_here
# Optional model overrides (defaults shown):
# GEMINI_PRO_MODEL=gemini-2.5-pro
# GEMINI_FLASH_MODEL=gemini-2.5-flash
```

### 4. Create the tables

```bash
npx drizzle-kit push
```

### 5. Run

```bash
npm run dev
# → http://localhost:3000
```

For production:

```bash
npm run build && npm run start
```

---

## Using the app

1. **Home (`/`)** — fill the athlete intake (name, ID, age, weight, goal,
   intensity) → **Generate plan**. Two model calls fire in parallel.
2. **Plan page (`/plan/<your-id>`)** — your week briefing, nutrition intel, and
   all 7 sessions with warm-ups, sets × reps, rest windows and cooldowns.
   Bookmark it — your **Athlete ID is the retrieval key**.
3. **Feedback loop** — type how the week felt into *Talk to your coach* →
   FitBuddy re-compiles the plan (REV 01, 02, …). The original plan and every
   piece of feedback stay on file.
4. **Admin (`/admin`)** — every athlete, original vs. current plan, revision
   counts, tips, and one-click delete.

## Testing the API with curl

```bash
# Health
curl http://localhost:3000/api/health

# Generate a plan
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex Rivera","code":"alex-01","age":27,"weightKg":72.5,"goal":"Build muscle","intensity":"medium"}'

# Send feedback → re-compiles the plan
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"code":"alex-01","feedback":"Day 3 legs was too easy, add posterior-chain volume"}'

# Delete an athlete (admin) — get the numeric id from the registry
curl -X DELETE http://localhost:3000/api/users/1
```

## Tech notes

- **Gemini REST, zero SDK** — plain `fetch` to
  `generativelanguage.googleapis.com/v1beta/models/<model>:generateContent` with
  `responseMimeType: application/json` + a response schema, so plans always come
  back as structured JSON.
- **Resilience by design** — model chains try Pro → Flash fallbacks; truncated
  LLM JSON is auto-repaired; defensive normalizers guarantee a valid 7-day
  contract before anything touches the database.
- **Design system** — Anton (display), Archivo (body), JetBrains Mono (labels),
  volt-on-void palette, blueprint grid + film-grain atmosphere.

---

## Deploy your own

Deployed on **[https://3000-iflmarfbf92i07pzqezvm.e2b.app/](https://3000-iflmarfbf92i07pzqezvm.e2b.app/)** using Vercel + Neon Postgres.

```bash
# One-click deploy
npx vercel --prod
```

---

<p align="center">
  <a href="https://3000-iflmarfbf92i07pzqezvm.e2b.app/">🏋️ Open FitBuddy Live →</a>
</p>
