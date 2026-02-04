# BTechVerse

Study resources, branch-wise notes, and AI assistant for BTech students.

## Run locally

From the **btechverse-hub** folder:

```sh
cd btechverse-hub
npm install
npm run dev:all
```

Then open **http://localhost:8080** in the browser.  
`dev:all` starts both the frontend (Vite) and the AI Buddy chat API.  
If port 3001 is already in use, run: `kill $(lsof -t -i:3001)` then `npm run dev:all` again.

## Scripts

- `npm run dev` – Vite dev server (frontend only)
- `npm run dev:api` – Chat + presign API (port 3001)
- `npm run dev:all` – Run both
- `npm run build` – Production build
- `npm run sync:s3` – Sync S3 bucket to branch-materials.json (optional)

## Stack

- Vite, React, TypeScript
- Tailwind CSS, shadcn/ui
- Firebase (auth), Firestore (resources)
- OpenRouter/OpenAI (AI Buddy)
