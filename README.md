# BTechVerse

Study resources, branch-wise notes, and AI assistant for BTech students.

## Run locally

From the **btechverse-hub** folder:

```sh
cd btechverse-hub
npm install
npm run dev
```

Then open the URL shown (e.g. **http://localhost:8080**) in the browser.  
`npm run dev` starts both the frontend (Vite) and the AI Buddy chat API (OpenRouter).  
If port 3001 is in use: `kill $(lsof -t -i:3001)` then `npm run dev` again.

## Scripts

- `npm run dev` – Run app + chat API (use this)
- `npm run dev:web` – Vite only (frontend)
- `npm run dev:api` – Chat + presign API only (port 3001)
- `npm run test:chat` – Test OpenRouter chat from CLI
- `npm run build` – Production build
- `npm run sync:s3` – Sync S3 bucket (optional)

## Stack

- Vite, React, TypeScript
- Tailwind CSS, shadcn/ui
- Firebase (auth), Firestore (resources)
- OpenRouter/OpenAI (AI Buddy)
