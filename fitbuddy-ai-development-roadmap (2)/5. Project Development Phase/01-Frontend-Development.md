# Frontend Development Split

## Main UI Files
- `src/app/page.tsx` — athlete intake homepage
- `src/app/plan/[code]/page.tsx` — result page with workout plan, nutrition tip, feedback form
- `src/app/admin/page.tsx` — admin dashboard
- `src/app/not-found.tsx` — custom 404 page
- `src/app/layout.tsx` — root layout and fonts
- `src/app/globals.css` — styling system

## Reusable Components
- `src/components/plan-form.tsx`
- `src/components/feedback-form.tsx`
- `src/components/delete-user-button.tsx`
- `src/components/site-nav.tsx`
- `src/components/marquee.tsx`
- `src/components/reveal.tsx`

## Frontend Responsibilities
- capture athlete input
- submit generation requests
- render the 7-day plan
- accept feedback and refresh revised output
- provide admin access to saved records

## UI Pattern Used
- responsive cards
- strong typography
- dark, gym-inspired visual theme
- animated but lightweight interactions
