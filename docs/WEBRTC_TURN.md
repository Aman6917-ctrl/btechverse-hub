# WebRTC ICE / TURN (Btechverse Study Room)

**No VPS required** for demos, student projects, and placement prototypes. This app ships with **free public TURN** presets (OpenRelay + optional Metered.ca free tier).

---

## Quick start (zero cost)

Copy to `.env` — defaults work for local dev:

```env
# STUN discovery (Google public)
VITE_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

# Enable built-in free TURN presets (OpenRelay demo credentials)
VITE_ICE_ENABLE_FREE_TURN=true

# Provider order = fallback priority (first STUN, then TURN providers)
VITE_ICE_PROVIDERS=stun,openrelay

VITE_ICE_TRANSPORT_POLICY=all
```

Rebuild / redeploy Netlify after changing `VITE_*`.

---

## Provider reference

| Provider | Cost | Env | Notes |
|----------|------|-----|-------|
| **stun** | Free | `VITE_STUN_URLS` | Public IP discovery only |
| **openrelay** | Free ~20 GB/mo | `VITE_ICE_ENABLE_FREE_TURN=true` | Metered Open Relay — UDP/TCP/TLS on 80/443 |
| **metered** | Free tier signup | `VITE_METERED_TURN_*` | Dashboard credentials from [dashboard.metered.ca](https://dashboard.metered.ca/signup) |
| **metered API** | Free tier | `VITE_METERED_API_KEY` + `VITE_METERED_APP_NAME` | Dynamic nearest-region iceServers |
| **custom** | Your host | `VITE_TURN_URLS` + user/pass | Optional coturn later |

### OpenRelay (default free preset)

```env
VITE_ICE_PROVIDERS=stun,openrelay
VITE_ICE_ENABLE_FREE_TURN=true
# Optional overrides (defaults shown):
VITE_OPENRELAY_HOST=openrelay.metered.ca
VITE_OPENRELAY_USERNAME=openrelayproject
VITE_OPENRELAY_CREDENTIAL=openrelayproject
```

Includes in RTCConfiguration (ordered **UDP → TCP → TLS**):

- `stun:openrelay.metered.ca:80`
- `turn:…:80` (UDP)
- `turn:…:443` (UDP)
- `turn:…:80?transport=tcp`
- `turn:…:443?transport=tcp`
- `turns:…:443?transport=tcp` (TLS)

### Metered.ca free tier (recommended for demos)

1. Sign up: https://dashboard.metered.ca/signup  
2. Generate credentials → copy username/password  
3. Add to `.env`:

```env
VITE_ICE_PROVIDERS=stun,openrelay,metered
VITE_METERED_TURN_HOST=standard.relay.metered.ca
VITE_METERED_TURN_USERNAME=your_username
VITE_METERED_TURN_CREDENTIAL=your_credential
```

**Or** fetch dynamic iceServers (nearest POP):

```env
VITE_METERED_APP_NAME=yourappname
VITE_METERED_API_KEY=your_api_key
VITE_METERED_TURN_REGION=us_east   # optional
```

### Custom TURN (when you have a VPS later)

```env
VITE_ICE_PROVIDERS=stun,custom
VITE_TURN_URLS=turn:host:3478?transport=udp,turn:host:3478?transport=tcp,turns:host:5349?transport=tcp
VITE_TURN_USERNAME=user
VITE_TURN_CREDENTIAL=pass
```

---

## ICE fallback ordering

The app builds `iceServers` in this order:

1. **All STUN** entries (cheap; no relay bandwidth)
2. **Per TURN provider** — one `RTCIceServer` with URLs ordered:
   - UDP TURN (lowest latency, preferred)
   - TCP TURN (strict firewalls that block UDP)
   - TLS TURN (`turns:` — deep packet inspection / proxy-heavy networks)

Browsers run **Trickle ICE** and pick the first **working candidate pair** (host/srflx direct, else relay).

---

## Transport: UDP vs TCP vs TLS

| Path | When used | Tradeoff |
|------|-----------|----------|
| **UDP TURN** | Default when firewall allows | Lowest latency, best for video |
| **TCP TURN** | UDP blocked (many college Wi‑Fi) | Higher latency, still works |
| **TLS TURN (`turns:`)** | Only 443 HTTPS-like traffic allowed | Slowest relay path, highest compatibility |

**Why TCP/TLS helps:** Some networks allow only ports 80/443. OpenRelay listens there so TURN can still relay when UDP 3478 is blocked.

**Why UDP is preferred:** Less head-of-line blocking; lower jitter for real-time video.

**How browsers choose:** ICE ranks candidate pairs by priority (host > srflx > relay; UDP > TCP). The first pair that passes connectivity checks wins — you don't pick manually.

---

## DevTools & connectivity test

Filter console: `[webrtc]` and `[ice]`.

On meeting join, a **preflight probe** runs:

- Logs `connectivity test start` / `relay candidate verified`
- Mesh PCs log `✓relay` on local relay candidates
- After connect, `transport=relay` or `transport=direct` from `getStats()`

**TURN-only test mode** (forces relay path):

```env
VITE_ICE_TRANSPORT_POLICY=relay
```

External tool: https://www.metered.ca/turn-server-testing

---

## Reliability tradeoffs (free public TURN)

| Topic | Free public TURN | Own VPS coturn |
|-------|------------------|----------------|
| **Cost** | $0 | VPS + egress |
| **Bandwidth** | ~20 GB/mo (Metered free) | You pay egress |
| **Uptime** | Shared; no SLA | You operate |
| **Latency** | Shared POPs; variable | You choose region |
| **Abuse risk** | Shared credentials can be rate-limited | Private creds |
| **Privacy** | Media still **DTLS-SRTP encrypted**; TURN sees encrypted packets only | Same crypto, your infra |

### Public TURN risks

- Shared demo credentials may be **revoked or rate-limited** by the provider.
- **No SLA** — fine for demos, not for paid production at scale.
- Credentials in frontend env are **visible** in built JS (same as any client-side TURN).

### Why this is OK for student / demo usage

- Study rooms are **small groups** (2–6 peers), short sessions.
- Free tier **20 GB/month** covers many demo hours at 720p mesh.
- TURN is only used when **direct P2P fails** — most same-campus tests use STUN/direct.
- End-to-end encryption is unchanged; TURN cannot decrypt video.

For production at scale → own coturn or Metered paid plan.

---

## Netlify production

Set at minimum:

```env
VITE_API_BASE_URL=https://btechverse-hub.onrender.com
VITE_ICE_ENABLE_FREE_TURN=true
VITE_ICE_PROVIDERS=stun,openrelay
```

Optional: add Metered dashboard credentials for better reliability.

**Clear cache and deploy** after env changes.

---

## Testing checklist

| Scenario | Config |
|----------|--------|
| Normal | `VITE_ICE_TRANSPORT_POLICY=all` + free TURN enabled |
| Verify TURN path | `VITE_ICE_TRANSPORT_POLICY=relay` |
| Metered only | `VITE_ICE_PROVIDERS=stun,metered` + dashboard creds |
| Disable free TURN | `VITE_ICE_ENABLE_FREE_TURN=false` + custom vars |
