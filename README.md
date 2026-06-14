# Kodiak Cast

**Kodiak Cast** is a podcast operating system for planning, launching, and maintaining podcasts.

The first version is intentionally focused on the part most new podcasters actually struggle with: creating a repeatable show system before worrying about recording/editing tools.

## Product promise

Plan the show. Build the episode pipeline. Find guests. Launch with structure. Keep publishing.

## MVP features in this starter repo

- Podcast dashboard
- Guided show blueprint form
- Local blueprint generator
- Episode idea pipeline
- Guest CRM starter view
- Launch checklist
- Clean Vite + React + TypeScript foundation

## Future AI features

Kodiak Cast should eventually include AI assistance for:

- Podcast name ideas
- Show descriptions and listener promises
- Episode topics based on the podcast type
- Episode outlines and talking points
- Guest suggestions and episode angles
- Guest outreach drafts
- Social clip ideas
- Weekly “what should I record next?” recommendations

## Local setup

```powershell
npm install
npm run dev
```

Then open the local Vite URL shown in your terminal.

## Suggested GitHub setup

After creating the empty GitHub repo named `kodiak-cast`, run this from the project folder:

```powershell
git init
git add .
git commit -m "Start Kodiak Cast"
git branch -M main
git remote add origin https://github.com/PapaKodiak92/kodiak-cast.git
git push -u origin main
```

Or with GitHub CLI:

```powershell
gh repo create PapaKodiak92/kodiak-cast --private --source=. --remote=origin --push
```

## Recommended first real development milestone

1. Persist podcasts, episodes, guests, and checklist items.
2. Add auth.
3. Add an AI blueprint API route or backend service.
4. Add one real podcast project for the founder’s own show.
5. Use the app weekly and improve based on what breaks.

## Important AI key note

Do not put private OpenAI/API keys in Vite client-side env vars. Add AI calls through a backend API, serverless function, or Supabase Edge Function later.
