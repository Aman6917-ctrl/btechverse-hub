# WebRTC TURN / ICE (Btechverse Study Room)

## Why TURN?

- **STUN** tells each browser its public IP (`srflx` candidate). Peers try **direct UDP**.
- **Symmetric NAT** (common on mobile/carrier Wi‑Fi) breaks STUN — each connection gets a different port.
- **TURN** relays media through your server (`relay` candidate). Works on hostel/college firewalls when UDP to arbitrary hosts is blocked.

Google Meet uses large TURN fleets worldwide; mesh apps still need TURN for hard NATs.

## Environment variables (frontend `.env`)

```env
# STUN (comma-separated)
VITE_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302

# TURN (coturn or managed provider)
VITE_TURN_URLS=turn:turn.yourdomain.com:3478?transport=udp,turn:turn.yourdomain.com:3478?transport=tcp
VITE_TURN_USERNAME=your-turn-user
VITE_TURN_CREDENTIAL=your-turn-password

# all = try direct first, then relay (production default)
# relay = TURN-only test mode (forces relay path)
VITE_ICE_TRANSPORT_POLICY=all

# ICE restart attempts per peer when connection fails
VITE_ICE_RESTART_MAX_ATTEMPTS=3
VITE_ICE_DISCONNECT_GRACE_MS=4500
```

Rebuild after changing `VITE_*` (Vite embeds at build time).

## Coturn quick setup (VPS)

1. Install: `apt install coturn`
2. Enable in `/etc/turnserver.conf`:
   - `listening-port=3478`
   - `fingerprint`
   - `lt-cred-mech`
   - `user=USERNAME:PASSWORD`
   - `realm=btechverse.cloud`
3. Open firewall: **3478 UDP/TCP** (and optionally 5349 TLS).
4. Put the same user/pass in `VITE_TURN_*`.

**Cost:** TURN relays all media — budget ~0.5–2 Mbps per video peer per direction on your VPS.

## DevTools

Filter console: `[webrtc]` and `[ice]` for candidate types (`host`, `srflx`, `relay`) and ICE state changes.

## Testing

| Mode | Config |
|------|--------|
| Normal | `VITE_ICE_TRANSPORT_POLICY=all` + TURN credentials |
| TURN-only | `VITE_ICE_TRANSPORT_POLICY=relay` — verifies TURN path works |
