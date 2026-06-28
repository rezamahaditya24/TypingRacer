# Dino Dash — Status Proyek

---

## TECH STACK

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion + Recharts
- **Backend:** Node.js + TypeScript + `ws` WebSocket server (port 3001) + HTTP REST API
- **Database:** InMemory (default) atau PostgreSQL via `pg` (saat `DATABASE_URL` diisi)
- **Deployment:** Docker (multi-stage), Fly.io (konfigurasi di `backend/` & `frontend/`)

---

## FITUR YANG SUDAH SELESAI

### Phase 1 — Core Game ?
- **Per-Character Highlight:** huruf hijau (benar), merah (salah bg tint), abu (belum diketik), kursor teal berkedip
- **Strict Mode:** error menghalangi maju, backspace untuk fix
- **TrackBar:** dinosaurus spring-animated di track horizontal, nama pemain, garis finish
- **State Machine:** LOBBY ? COUNTDOWN ? RACING ? FINISHED
- **Countdown:** 3?2?1?GO! dengan animasi telur menetas
- **Input Capture:** `<textarea>` transparan overlay (bukan keydown) — support keyboard mobile
- **Results Screen:** podium animasi (??????), detail WPM/akurasi/waktu, tombol rematch/play-again
- **WPM Graph:** grafik recharts LineChart di hasil balapan (record setiap 3 detik)

### Phase 2 — Multiplayer ?
- **Private Room:** kode 6 karakter, join via URL `?join=KODE`
- **WebSocket Protocol:** `join_room` ? `room_state` ? `countdown` ? `race_start` ? `progress`/`player_update` ? `race_end` ? `reset_race`
- **Player Ready:** tombol siap per pemain, status visual ?, host memulai
- **Anti-Cheat:** validasi progress server-side (no regression, WPM = 250)

### Phase 3 — Leaderboard ?
- **Leaderboard via WebSocket:** global rankings (best WPM, avg WPM, races played)
- **REST API:** `GET /api/leaderboard?filter=alltime|today|week`, `GET /api/profile/:playerName`, `GET /health`
- **PostgreSQL Database:** Class `PostgresDatabase` mengimplement interface `Database`, auto-init tabel

### Phase 4 — Polish ?
- **Ghost Car:** simpan PB timestamps ke localStorage (`pb_[textId]`), tampilkan ?? di TrackBar
- **Sound Effects:** Web Audio API (800Hz tick, 150Hz error buzz, countdown beep, finish fanfare), toggle ??/??, hormati `prefers-reduced-motion`
- **Theme Customization:** Dark (default), Light, Retro (hijau-on-black), Neon (ungu/cyan), disimpan ke localStorage
- **Car Emoji:** Set termasuk ?????????????????

### Coding Standards ?
- **TypeScript everywhere** — no implicit any
- **WebSocket reconnect** — exponential backoff (1s?2s?4s?max 10s)
- **Error handling** — try/catch di semua handler, invalid JSON di-log
- **Mobile input** — `inputmode="text"`, `autocorrect="off"`, `autocapitalize="off"`, `spellcheck="false"`
- **Accessibility** — `aria-label` di container progress
- **Component structure:** dipisah ke `components/game/`, `components/ui/`, `hooks/`, `lib/`

---

## STRUKTUR FILE

```
frontend/src/
  app/
    page.tsx              # ~120 baris, import semua komponen
    globals.css           # CSS variables + themes (dark/light/retro/neon)
    layout.tsx
  components/
    game/
      CountdownOverlay.tsx
      LandingView.tsx
      Lobby.tsx
      PracticeView.tsx
      RaceTrack.tsx
      RaceView.tsx
      ResultsScreen.tsx
      TextDisplay.tsx
    ui/
      Leaderboard.tsx
      PlayerCard.tsx
  hooks/
    useRace.ts
    useSound.ts
    useWebSocket.ts
  lib/
    constants.ts          # DINO_LIST, DINO_COLORS, randomName, CAR_EMOJIS
    quotes.ts             # 35 quotes (easy/medium/hard, id/en)
    types.ts

backend/src/
  index.ts                # HTTP+WS server, REST API routing
  handlers/
    wsHandler.ts          # WebSocket message routing
  services/
    RoomManager.ts        # Room/player state, race logic, anti-cheat
    Database.ts           # Interface + InMemoryDatabase
    PostgresDatabase.ts   # PostgreSQL implementation
  data/
    quotes.json           # 35 quotes
  types/
    index.ts
```

---

## ENV VARIABLES

```
# Backend (.env)
PORT=3001
DATABASE_URL=postgres://...  # optional

# Frontend (.env.local)
NEXT_PUBLIC_WS_HOST=ws://localhost:3001
```

---

## CARA JALANKAN

```powershell
# Backend
cd backend && npm run dev        # ? localhost:3001

# Frontend (terminal lain)
cd frontend && npm run dev       # ? localhost:3000

# Dengan Docker + PostgreSQL
docker compose up
```

---

## YANG TERSISA (LOW PRIORITY)

Tidak ada. Semua fitur dari prompt awal sudah selesai.
