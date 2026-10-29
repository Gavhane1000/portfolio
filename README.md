# Shubham Gavhane · Portfolio

React + Vite + Tailwind v4 + Motion, deployed on Vercel. The "Ask Sage" AI chat runs as a Vercel Edge Function (`api/chat.ts`) on Groq (free tier), with Google Gemini as a fallback.

## Run locally

```bash
npm install
cp .env.example .env.local   # add GROQ_API_KEY and/or GEMINI_API_KEY (and EmailJS keys, optional)
npm run dev                  # http://localhost:5173, /api/chat works in dev too
```

## Edit content

Everything (bio, case studies, experience, skills, services, awards) lives in **`src/data/profile.ts`**.
The AI assistant is grounded on that same file, so it stays in sync automatically.

- **Photo:** drop your portrait in `public/` (e.g. `public/portrait.jpg`) and set `profile.photo` to `/portrait.jpg`. A 4:5 portrait works best.
- **Résumé:** replace `public/Shubham_Gavhane_Resume.pdf`.

## Deploy to Vercel

1. Push this folder to a GitHub repo, then import it in Vercel (framework: Vite is auto-detected).
2. Project → Settings → Environment Variables:
   - `GROQ_API_KEY` (from https://console.groq.com/keys — free tier, never add a card)
   - `GEMINI_API_KEY` (from https://aistudio.google.com/apikey — fallback, keep billing off)
   - optional `GEMINI_MODEL` (tried first; falls back to `gemini-3.8-flash` → `gemini-3.5-flash-lite` → `gemini-3.1-flash-lite`)
   - optional `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, `VITE_EMAILJS_PUBLIC_KEY`
3. Deploy.

## Contact form (EmailJS)

Create a free account at emailjs.com, add an email service and a template that uses
`{{from_name}}`, `{{reply_to}}`, `{{intent}}` and `{{message}}`. Until the keys are set, the form falls back to opening the visitor's mail app.

## Notes

- Requires Node ≥ 18 locally (Vite 6). Vercel builds on Node 22.
- Respects `prefers-reduced-motion`: the graph renders statically and the preloader and smooth scroll are skipped.
