# Kodiak Cast

**Kodiak Cast** is a podcast operating system for planning, launching, and maintaining podcasts.

The first version is intentionally focused on the part most new podcasters actually struggle with: creating a repeatable show system before worrying about recording/editing tools.

## Product promise

Plan the show. Build the episode pipeline. Find guests. Launch with structure. Keep publishing.

## MVP features in this repo

- Multi-project podcast workspace
- Guided project creation wizard
- Full podcast starter kit generation
- Editable show blueprint
- Editable episode planner
- Guest CRM
- Launch Command Center
- Export/copy tools
- Local workspace persistence
- Kodiak Cloud AI gateway for development
- Clean Vite + React + TypeScript foundation

## Kodiak Cloud AI development setup

Customers should not bring their own AI keys. In development, Kodiak Cast runs a small local AI gateway that uses **our** server-side key from `.env` or `.env.local`.

Create one of these files locally:

```powershell
notepad .env
```

Add:

```env
OPENAI_API_KEY=your_real_key_here
```

Do not commit `.env` or screenshots of your key. The repo already ignores `.env`, `.env.local`, and `.env.*.local`.

## Local setup

```powershell
npm install
npm run dev
```

`npm run dev` starts both:

- Kodiak AI gateway on `http://127.0.0.1:8787`
- Vite app on `http://localhost:5173`

The Vite dev server proxies `/api/*` requests to the local gateway, so the browser never sees the OpenAI key.

## Optional commands

```powershell
npm run api       # starts only the local AI gateway
npm run dev:vite  # starts only Vite
npm run build     # typecheck and production build
```

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

## Production note

Before launch, move this local gateway into a hosted backend or serverless function, add authentication, and meter AI usage by plan. The product should feel like **Kodiak Cast includes AI**, not like users need to bring an API key.
