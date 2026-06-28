# 🦕 Dino Dash — Multiplayer Typing Race

Balapan mengetik multiplayer dengan dinosaurus. Mirip TypeRacer, tapi pelarinya dinosaurus 🦖

## Stack

| Layer     | Teknologi                                             |
| --------- | ----------------------------------------------------- |
| Frontend  | Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Framer Motion |
| Backend   | Node.js + TypeScript + WebSocket (`ws`)               |
| Database  | In-memory (opsional: Postgres via Supabase/Neon)      |
| Hosting   | Frontend: Vercel / Backend: Fly.io                    |

## Struktur Folder

```
CarTyping/
├── backend/
│   ├── src/
│   │   ├── types/index.ts         # Interface pesan & state
│   │   ├── services/RoomManager.ts # Room + race logic
│   │   ├── handlers/wsHandler.ts   # Routing pesan WS
│   │   ├── data/quotes.json        # Kumpulan teks
│   │   └── index.ts                # Entry point server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── Track.tsx
│   │   │   ├── Lane.tsx
│   │   │   └── DinoSprite.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useRace.ts
│   │   └── lib/types.ts
│   ├── package.json
│   └── .env.local
├── .env.example
└── README.md
```

## Cara Run Lokal

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:3001`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local  # atau buat manual
npm run dev
```

Frontend berjalan di `http://localhost:3000`.

### 3. Buka

Buka `http://localhost:3000` di dua tab browser. Buat room di satu tab, join di tab lain.

## Cara Deploy ke Fly.io (Backend)

### Prasyarat

- Akun [Fly.io](https://fly.io) (gratis)
- Install `flyctl`: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`

### Deploy

```bash
cd backend
fly launch
fly deploy
```

Setel `PORT` environment variable di `fly.toml`.

### Frontend deploy ke Vercel

```bash
cd frontend
npx vercel
```

Set `NEXT_PUBLIC_WS_HOST` ke URL WebSocket server Fly.io (misal `wss://dino-dash-backend.fly.dev`).

## Variabel Environment

Lihat `.env.example`:

```
# Backend
PORT=3001

# Frontend
NEXT_PUBLIC_WS_HOST=ws://localhost:3001

# Postgres (optional - for leaderboard)
# DATABASE_URL=postgresql://user:password@host:5432/dinodash
```

## Protocol WebSocket

### Client → Server

| Type        | Payload                                       |
| ----------- | --------------------------------------------- |
| `join_room` | `{ roomId, name, dino }`                      |
| `progress`  | `{ charIndex }`                               |
| `finish`    | `{}`                                          |
| `start_race` | `{}` (host only)                           |

### Server → Client

| Type            | Payload                                                    |
| --------------- | ---------------------------------------------------------- |
| `room_joined`   | `{ roomId, playerId }`                                     |
| `room_state`    | `{ players, text, hostId, status }`                        |
| `player_joined` | `{ id, name, dino }`                                       |
| `player_left`   | `{ id }`                                                   |
| `countdown`     | `{ secs }`                                                 |
| `race_start`    | `{ startedAt, text }`                                      |
| `player_update` | `{ id, progress, wpm, accuracy, finished }`                |
| `race_end`      | `{ results: [{id, name, dino, rank, wpm, accuracy, timeMs}] }` |
| `error`         | `{ message }`                                              |

## Fitur

- [x] Buat/join room dengan kode 6 karakter
- [x] Pilih nama dan dinosaurus
- [x] Lobby dengan daftar pemain + link invite
- [x] Countdown 3→2→1→GO!
- [x] Balapan mengetik real-time via WebSocket
- [x] Highlight per karakter (benar/aktif/salah)
- [x] Strict mode (harus hapus typo dulu)
- [x] Live WPM + akurasi
- [x] Animasi dinosaurus berlari
- [x] Efek tersandung saat salah ketik
- [x] Halaman hasil + podium
- [x] Dark/light toggle
- [x] Responsif mobile
- [x] Anti-cheat server-side
