# Database and Configuration Split

## Database Files
- `src/db/index.ts` — PostgreSQL pool + Drizzle client
- `src/db/schema.ts` — table schema
- `drizzle.config.json` — Drizzle configuration

## Environment Files
- `.env.example`
- `.env`

## Important Variables
- `DATABASE_URL`
- `GOOGLE_API_KEY`
- `GEMINI_API_KEY` (optional alias)
- `GEMINI_PRO_MODEL` (optional override)
- `GEMINI_FLASH_MODEL` (optional override)

## Build / Framework Config
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `eslint.config.mjs`
- `package.json`

## Database Push Command
```bash
npx drizzle-kit push
```
