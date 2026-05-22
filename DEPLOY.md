# Btechverse – Deploy & env setup

## Keys safe rahenge kaise

- **`.env`** kabhi Git me commit **mat karo**. Ye `.gitignore` me hai.
- GitHub pe sirf code push hota hai; secrets sirf tumhare local ya hosting ke **Environment Variables** me daalte ho.

## Local run (development)

```bash
cp .env.example .env
# .env me apni saari keys bharo (Firebase, Resend, Twilio, etc.)
npm install
npm run dev
```

## Production (Vercel / Netlify / etc.)

1. Repo GitHub pe push karo (`.env` push nahi hota).
2. Hosting pe project connect karo (GitHub repo link).
3. **Settings → Environment Variables** me ye variables add karo.  
   List ke liye `.env.example` dekho – har line jisme value hai (API key, URL, email) woh production me bhi set karna hoga.

### Zaroori variables (site chalne ke liye)

| Variable | Kahan se | Notes |
|----------|----------|--------|
| `VITE_FIREBASE_*` | Firebase Console → Project settings | Login ke liye |
| `VITE_SUPABASE_*` | Supabase dashboard | Agar use ho raha ho |
| `VITE_API_BASE_URL` | — | `https://btechverse-hub.onrender.com` (ya apna API URL) |
| `VITE_STUN_URLS` / `VITE_TURN_*` | coturn / provider | Video meeting — bina TURN ke strict NAT fail ho sakta hai (`docs/WEBRTC_TURN.md`) |
| `OPENROUTER_API_KEY` | openrouter.ai | AI Buddy (server) |

### Book Session (email + WhatsApp)

| Variable | Kahan se |
|----------|----------|
| `RESEND_API_KEY` | resend.com → API Keys |
| `RESEND_FROM_EMAIL` | Verified domain (e.g. `Btechverse <notify@mail.btechverse.cloud>`) |
| `BOOK_SESSION_ADMIN_EMAIL` | Tumhara email |
| `TWILIO_*` | console.twilio.com | Optional, WhatsApp ke liye |

### Build command (Vercel/Netlify)

- **Build:** `npm run build`
- **Output:** `dist`

Server (API) agar alag deploy kar rahe ho (e.g. Railway, Render), wahan bhi same env variables add karo (OPENROUTER, RESEND, TWILIO, etc.).

### Render (API + Socket.IO signaling)

| Setting | Value |
|---------|--------|
| **Start command** | `node server/api.mjs` ya `npm start` |
| **Build command** | `npm install` (optional; start installs deps on boot) |
| `ALLOWED_ORIGINS` | `https://btechverse.cloud,https://www.btechverse.cloud` (+ Netlify preview URL agar use ho) |

Deploy ke baad check: `curl 'https://YOUR-API.onrender.com/socket.io/?EIO=4&transport=polling'` — body me `0{"sid"` jaisa Engine.IO packet hona chahiye, `{"error":"Not found"}` nahi.

### Netlify (frontend)

`VITE_*` change ke baad **Clear cache and deploy**. Meeting ke liye kam se kam `VITE_API_BASE_URL` + STUN/TURN vars set karo.
