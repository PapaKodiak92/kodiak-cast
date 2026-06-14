# AI Context for Kodiak Cast

## Product

Kodiak Cast is a podcast planning and maintenance SaaS concept under the Kodiak brand family.

The product helps users:

1. Plan a podcast.
2. Build the show format and episode system.
3. Start recording/publishing.
4. Maintain consistency over time.
5. Find and contact guests.
6. Use AI for episode ideas, outlines, guest outreach, and weekly next actions.

## Current scope

The repo starts as a Vite + React + TypeScript frontend MVP.

The current implementation is not connected to a database or real AI API yet. It uses local starter data and a deterministic local blueprint generator to prove the product workflow first.

## Preferred product direction

Do not build a recording/editing clone first. Riverside, Descript, Spotify for Creators, and other tools already focus on recording, editing, hosting, and distribution.

Kodiak Cast should focus on the operating system around podcast creation:

- planning
- consistency
- topic generation
- guest preparation
- launch workflow
- episode pipeline
- maintenance rhythm

## Brand voice

Professional, clean, practical, builder-focused, and slightly rugged under the Kodiak brand.

Avoid cheesy podcast buzzwords. The app should feel like a command center, not a gimmick.

## First target user

The founder is also the first tester. The app should help launch and maintain his own podcast. If the tool works for the founder, that creates early proof that the system works.

## Future stack ideas

- Frontend: React + TypeScript
- Backend/API: Next.js API routes, Express, or Supabase Edge Functions
- Database/Auth: Supabase
- AI: OpenAI through server-side code only
- Hosting: Vercel

## Next dev milestone

Build persistence and real CRUD:

- podcasts
- episodes
- guests
- checklist items
- generated AI suggestions
