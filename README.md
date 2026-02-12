# Btechverse

**Notes, PYQs & Study Buddy for B.Tech students.** One place for branch-wise materials, company-wise interview prep, and 1:1 sessions with mentors from top product companies.

---

## Features

- **Branch-wise resources** — Notes, previous year papers, presentations (CSE, AI/ML, ECE, ME, and more)
- **Interview prep** — Company-wise DSA & SQL questions with practice and AI hints
- **Study Buddy (AI)** — Ask doubts in plain language; answers in simple explanations
- **Mentors** — Book 1:1 sessions with engineers from Google, Microsoft, Amazon, etc.
- **Auth** — Email/password and Google sign-in (Firebase)
- **Book a session** — Email + WhatsApp notifications (Resend + Twilio)

---

## Tech stack

| Layer        | Tech |
|-------------|------|
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion, React Router |
| Auth        | Firebase Authentication |
| AI          | OpenRouter (GPT) via Node API |
| Email/SMS   | Resend, Twilio (book-session) |
| Storage     | AWS S3 (materials), Firestore (optional) |

---

## Prerequisites

- **Node.js** 18+
- **npm** (or bun)

---

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/Aman6917-ctrl/btechverse-hub.git
cd btechverse-hub
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your values. **Never commit `.env`** — it is in `.gitignore`.

| Required for basic run | Where to get |
|------------------------|--------------|
| `VITE_FIREBASE_*`      | [Firebase Console](https://console.firebase.google.com) → Project settings |
| `VITE_SUPABASE_*`      | [Supabase](https://supabase.com) (if using) |
| `OPENROUTER_API_KEY`   | [OpenRouter](https://openrouter.ai/keys) (for AI Buddy) |
| `VITE_API_BASE_URL`    | `http://localhost:3001` for local dev |

For **book-session** (email + WhatsApp): set `RESEND_*`, `TWILIO_*`, `BOOK_SESSION_*` in `.env`. See `.env.example` and **DEPLOY.md** for the full list.

### 3. Start the app

```bash
npm run dev
```

This starts:

- **Frontend** — Vite dev server (e.g. http://localhost:5173)
- **API** — Node server on port 3001 (chat, presign, book-session)

Open the URL shown in the terminal. If port 3001 is in use: `kill $(lsof -t -i:3001)` then run `npm run dev` again.

---

## Scripts

| Command           | Description |
|-------------------|-------------|
| `npm run dev`    | Run frontend + API (use this for local dev) |
| `npm run dev:web`| Frontend only (Vite) |
| `npm run dev:api`| API only (port 3001) |
| `npm run build`  | Production build → `dist/` |
| `npm run preview`| Preview production build locally |
| `npm run sync:s3`| Sync branch materials from S3 (optional) |
| `npm run test`   | Run tests |
| `npm run lint`   | Run ESLint |

---

## Project structure (main parts)

```
btechverse-hub/
├── src/
│   ├── components/     # UI, layout, sections
│   ├── contexts/       # AuthContext
│   ├── data/           # mentors, companies, DSA/SQL questions
│   ├── pages/          # Routes (Index, Auth, Mentors, BranchMaterials, etc.)
│   ├── lib/            # utils, student-count, runCode, upload-file
│   └── integrations/   # Firebase, Supabase
├── server/             # Node API (api.mjs, chat.mjs, book-session.mjs, presign, run-code)
├── public/             # favicon, static assets
├── .env.example        # Env template (no secrets)
├── DEPLOY.md           # Deploy + env checklist for production
└── package.json
```

---

## Deploy (production)

1. Push code to GitHub (`.env` is not pushed).
2. Connect the repo to Vercel / Netlify (or your host).
3. Set **Environment Variables** in the host dashboard — use the same keys as in `.env`. See **DEPLOY.md** for the list and where to get each value.
4. **Build command:** `npm run build`  
   **Output directory:** `dist`

If you run the API separately (e.g. Railway, Render), set the same server-side env vars there and point `VITE_API_BASE_URL` to that API URL in the frontend env.

---

## License

Built for B.Tech students. Use and share as you like.

---

## Links

- **Repo:** [github.com/Aman6917-ctrl/btechverse-hub](https://github.com/Aman6917-ctrl/btechverse-hub)
