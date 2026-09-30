# AI / LLM Integration Split

## Core AI Files
- `src/lib/gemini.ts`
- `src/lib/local-engine.ts`
- `src/lib/fitness.ts`

## Model Responsibilities
### Gemini Pro Equivalent Logic
Used for:
- initial structured workout generation
- feedback-based workout revision

### Gemini Flash Equivalent Logic
Used for:
- quick nutrition / recovery tip generation

## Implementation Notes
- Gemini is called through the REST `generateContent` endpoint.
- API key is read from `GOOGLE_API_KEY` or `GEMINI_API_KEY`.
- Plan output is normalized into a strict 7-day JSON contract.
- If Gemini is unavailable, the local engine keeps the app functional.

## Prompts Covered
- workout plan generation
- nutrition tip generation
- workout revision from feedback
