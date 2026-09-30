# Backend and API Split

## API Route Files
- `src/app/api/generate/route.ts`
- `src/app/api/feedback/route.ts`
- `src/app/api/users/[id]/route.ts`
- `src/app/api/health/route.ts`

## Request Flow
### Generate
1. validate intake payload
2. call workout generator
3. call nutrition tip generator
4. save athlete + plan in database
5. return success response and athlete code

### Feedback
1. validate feedback payload
2. fetch current athlete plan
3. call plan revision logic
4. increment revision and append feedback log
5. save updated plan

### Delete
1. remove plan rows
2. remove athlete row

## Validation Strategy
- `zod` is used for request validation
- all sensitive API calls stay server-side
- health route checks database connectivity
