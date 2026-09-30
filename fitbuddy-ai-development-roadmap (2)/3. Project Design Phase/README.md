# 3. Project Design Phase

## Architecture Overview
This repository implements the documented FitBuddy workflow using the platform stack:

- **Frontend:** Next.js App Router pages and components
- **Backend:** Route handlers under `src/app/api`
- **AI Layer:** Gemini REST API integration in `src/lib/gemini.ts`
- **Database:** PostgreSQL with Drizzle ORM
- **Fallback Engine:** deterministic local AI-like generator in `src/lib/local-engine.ts`

## Module Design
- `src/app/page.tsx` → intake form / landing page
- `src/app/plan/[code]/page.tsx` → generated result + feedback page
- `src/app/admin/page.tsx` → admin dashboard
- `src/app/api/generate/route.ts` → generate plan + tip
- `src/app/api/feedback/route.ts` → revise plan
- `src/app/api/users/[id]/route.ts` → delete user
- `src/db/schema.ts` → users + plans tables

## Data Design
### `fitbuddy_users`
- id
- code
- name
- age
- weightKg
- goal
- intensity
- createdAt

### `fitbuddy_plans`
- id
- userId
- originalPlan
- currentPlan
- nutritionTip
- revision
- feedbackLog
- aiSource
- aiModel
- createdAt
- updatedAt

## UI Design Notes
- dark gym-style theme
- bold display typography
- responsive form layout
- session cards for all 7 days
- coach-feedback panel for adaptive revision
- admin cards for quick user inspection
