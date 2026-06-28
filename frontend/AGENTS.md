<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Dino Dash Project Summary

## Stack
- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind v4 + Framer Motion + Recharts
- **Backend**: Node.js + TypeScript + `ws` WebSocket server (port 3001) + HTTP REST API
- **Database**: InMemoryDatabase (default) or PostgreSQL via `pg` (when `DATABASE_URL` is set)
- **Deployment**: Docker, Fly.io (configs in `backend/` and `frontend/`)

## Key Architecture
- Single-page app in `frontend/src/app/page.tsx` with view switching (landing → lobby → practice/race → results → leaderboard)
- WebSocket protocol: `join_room` → `room_state` → `countdown` → `race_start` → `progress`/`player_update` → `race_end` → `reset_race`
- REST API: `GET /api/leaderboard?filter=alltime|today|week`, `GET /api/profile/:playerName`, `GET /health`
- All WPM/accuracy computed server-side in `RoomManager.ts`
- Anti-cheat: rejects progress regressions, WPM > 250
- Auto-reconnect with exponential backoff (1s→2s→4s→max 10s) in `useWebSocket.ts`
- Sound effects via Web Audio API oscillators in `useSound.ts` (no audio files)
- Practice mode is client-side only

## Features
- **Per-character highlighting**: green (correct), red+bg tint (wrong), gray (untyped), blinking cursor
- **Strict mode**: errors block advancement, backspace to fix
- **Input capture**: invisible `<textarea>` overlay (not keydown) for mobile keyboard support
- **TrackBar**: Framer Motion spring-animated dino icons, player name labels, ghost car replay (👻)
- **Countdown**: 3→2→1→GO! with egg hatch animation
- **Results**: Podium animation, detail cards, rematch/play-again, WPM graph (recharts)
- **Leaderboard**: Global rankings (best WPM, avg WPM, races played) via WebSocket or REST API
- **Quote library**: 35 quotes, easy/medium/hard, Indonesian/English
- **Ghost car**: Saves PB timestamps to `localStorage`, displays 👻 on TrackBar during replay
- **WPM graph**: Records WPM every 3 seconds, displays recharts LineChart on results
- **Themes**: Dark (default), Light, Retro Arcade (green-on-black), Neon (purple/cyan), saved to `localStorage`
- **Sound toggle**: 🔊/🔇, respects `prefers-reduced-motion`
- **Player ready system**: Ready button + visual indicators in lobby, host starts race
- **Anti-cheat**: Server validates progress (no regression, WPM ≤ 250)

## Themes CSS
- `.light`: white bg, dark text
- `.retro`: black bg, green text (#33FF33)
- `.neon`: dark purple bg (#0D0221), purple/cyan/red accents

## Deployment
- `docker-compose.yml`: backend + frontend + PostgreSQL 16
- Backend Dockerfile: multi-stage, `node dist/index.js`
- Frontend Dockerfile: multi-stage, `next start`
- `backend/fly.toml` and `frontend/fly.toml` for Fly.io (AMS, HTTP→HTTPS)
- `.env.example` files documenting `DATABASE_URL` and `NEXT_PUBLIC_WS_HOST`

## Build Verification
- Backend: `npx tsc --noEmit` (compile check)
- Frontend: `npx next build` (full build production)
