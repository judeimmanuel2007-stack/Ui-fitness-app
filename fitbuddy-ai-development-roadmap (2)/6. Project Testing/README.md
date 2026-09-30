# 6. Project Testing

## Validation Checklist
- homepage loads correctly
- admin page loads correctly
- `/api/health` returns `{ ok: true }`
- plan generation works for a sample athlete
- feedback updates the revision count
- delete endpoint removes an athlete
- TypeScript passes
- production build passes

## Manual Browser Test Flow
1. Open the homepage.
2. Enter athlete data.
3. Click **Generate plan**.
4. Confirm the workout plan and nutrition tip appear.
5. Submit feedback.
6. Confirm the revision increases.
7. Open the admin page and inspect stored data.

## API Test Commands
```bash
curl http://localhost:3000/api/health

curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"name":"Alex","code":"alex-01","age":27,"weightKg":72.5,"goal":"Build muscle","intensity":"medium"}'

curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"code":"alex-01","feedback":"Add more leg volume"}'
```

## Final Build Commands
```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```
