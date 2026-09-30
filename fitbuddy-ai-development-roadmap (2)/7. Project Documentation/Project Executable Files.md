# Project Executable Files

## Main Executable Application Files
- `src/app/page.tsx`
- `src/app/plan/[code]/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/api/generate/route.ts`
- `src/app/api/feedback/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/api/health/route.ts`
- `src/lib/gemini.ts`
- `src/db/schema.ts`
- `src/db/index.ts`

## How to Run
```bash
npm install
cp .env.example .env
npx drizzle-kit push
npm run dev
```

## Browser URLs
- Home: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin`
- Health: `http://localhost:3000/api/health`
