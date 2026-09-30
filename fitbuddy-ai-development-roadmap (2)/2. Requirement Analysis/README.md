# 2. Requirement Analysis

## Functional Requirements
1. Accept user details:
   - name
   - athlete/user ID
   - age
   - weight
   - fitness goal
   - workout intensity
2. Generate a structured 7-day workout plan.
3. Generate a nutrition or recovery tip.
4. Save user profile and generated plan.
5. Accept feedback and revise the existing plan.
6. Display all saved users in an admin view.
7. Allow admin deletion of users.

## Non-Functional Requirements
- responsive UI
- clean GitHub-ready project structure
- secure server-side API key handling
- persistent storage using PostgreSQL
- reliable fallback behavior if Gemini is unavailable
- production build must compile without TypeScript errors

## Inputs
- athlete name
- athlete ID
- age
- weight (kg)
- goal
- intensity level
- feedback text

## Outputs
- workout plan with day-wise structure
- exercise sets / reps / rest
- warm-up and cooldown guidance
- nutrition tip
- revised plan after feedback
- admin registry view

## Constraints / Assumptions
- Gemini API key is optional for local fallback mode
- database connection is provided through `DATABASE_URL`
- app is built with Next.js + PostgreSQL as the platform-supported equivalent of the documented FastAPI + SQLite design
