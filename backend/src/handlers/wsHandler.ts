import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { RoomManager } from '../services/RoomManager';
import { Database } from '../services/Database';
import { ClientToServer, DinoType, RoomStatus } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dino-dash-secret-key';
const wsAuth = new Map<WebSocket, { userId: string; username: string }>();

function calcXp(wpm: number, accuracy: number, rank: number, totalPlayers: number): number {
  let xp = 10;
  xp += Math.min(wpm, 200); // up to 200 XP for speed
  xp += Math.round(accuracy * 0.5); // up to 50 XP for accuracy
  if (rank === 1) xp += 50;
  else if (rank === 2) xp += 25;
  else if (rank === 3) xp += 10;
  return Math.round(xp);
}

function getLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function handleConnection(ws: WebSocket, roomManager: RoomManager, database: Database): void {
  const playerId = uuidv4();
  roomManager.setPlayerIdForWs(ws, playerId);

  ws.on('message', (data) => {
    let parsed: { type: string; payload: Record<string, unknown> };
    try {
      parsed = JSON.parse(data.toString());
    } catch {
      sendError(ws, 'Pesan tidak valid.');
      return;
    }

    const { type, payload } = parsed;

    switch (type) {
      case 'auth':
        handleAuth(ws, payload as { token: string });
        break;
      case 'join_room':
        handleJoinRoom(ws, roomManager, payload as ClientToServer['join_room']);
        break;
      case 'progress':
        handleProgress(ws, roomManager, payload as { charIndex: number });
        break;
      case 'finish':
        handleFinish(ws, roomManager);
        break;
      case 'start_race':
        handleStartRace(ws, roomManager);
        break;
      case 'reset_race':
        handleResetRace(ws, roomManager);
        break;
      case 'get_leaderboard':
        handleGetLeaderboard(ws, database, payload as { limit?: number });
        break;
      case 'ready':
        handleReady(ws, roomManager);
        break;
      case 'get_player_history':
        handleGetPlayerHistory(ws, database, payload as { playerId: string; limit?: number });
        break;
      case 'signup':
        handleSignup(ws, database, payload as { username: string; password: string });
        break;
      case 'login':
        handleLogin(ws, database, payload as { username: string; password: string });
        break;
      case 'get_public_rooms':
        handleGetPublicRooms(ws, roomManager);
        break;
      default:
        sendError(ws, `Tipe pesan tidak dikenal: ${type}`);
    }
  });

  ws.on('close', () => {
    wsAuth.delete(ws);
  });

  ws.on('close', () => {
    const roomId = roomManager.getRoomIdByWs(ws);
    if (roomId) {
      const pid = roomManager.getPlayerIdByWsSafe(ws);
      roomManager.removeClient(ws);
      if (pid) {
        broadcastToRoom(roomManager, roomId, { type: 'player_left', payload: { id: pid } });
        const room = roomManager.getRoom(roomId);
        if (room) broadcastRoomState(roomManager, roomId);
      }
    }
  });
}

async function handleSignup(ws: WebSocket, database: Database, payload: { username: string; password: string }): Promise<void> {
  const username = (payload.username || '').trim();
  const password = payload.password || '';
  if (!username || username.length < 3) { sendError(ws, 'Username minimal 3 karakter'); return; }
  if (password.length < 4) { sendError(ws, 'Password minimal 4 karakter'); return; }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await database.createUser(username, passwordHash);
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    wsAuth.set(ws, { userId: user.id, username: user.username });
    sendToClient(ws, {
      type: 'auth_ok',
      payload: { token, userId: user.id, username: user.username, xp: 0, level: 1 },
    });
  } catch (e: any) {
    if (e.message === 'Username already exists') { sendError(ws, 'Username sudah dipakai'); return; }
    sendError(ws, 'Gagal daftar');
  }
}

async function handleLogin(ws: WebSocket, database: Database, payload: { username: string; password: string }): Promise<void> {
  const username = (payload.username || '').trim();
  const password = payload.password || '';
  if (!username || !password) { sendError(ws, 'Username dan password diperlukan'); return; }
  const user = await database.getUserByUsername(username);
  if (!user) { sendError(ws, 'Username atau password salah'); return; }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) { sendError(ws, 'Username atau password salah'); return; }
  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  wsAuth.set(ws, { userId: user.id, username: user.username });
  const level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
  sendToClient(ws, {
    type: 'auth_ok',
    payload: { token, userId: user.id, username: user.username, xp: user.xp, level },
  });
}

function handleAuth(ws: WebSocket, payload: { token: string }): void {
  try {
    const decoded = jwt.verify(payload.token, JWT_SECRET) as { userId: string; username: string };
    wsAuth.set(ws, { userId: decoded.userId, username: decoded.username });
    sendToClient(ws, { type: 'auth_ok', payload: { userId: decoded.userId, username: decoded.username } });
  } catch {
    wsAuth.delete(ws);
    sendError(ws, 'Token tidak valid.');
  }
}

function handleJoinRoom(ws: WebSocket, roomManager: RoomManager, payload: ClientToServer['join_room']): void {
  let { roomId, name, dino, language } = payload;
  const pwd = (payload as any).password as string | undefined;
  const asSpectator = (payload as any).asSpectator as boolean | undefined;
  const isPublic = (payload as any).isPublic as boolean | undefined;

  const playerId = roomManager.getPlayerIdByWsSafe(ws)!;

  if (!name || name.trim().length === 0) name = `Pemain${playerId.slice(0, 4)}`;

  const validDinos: DinoType[] = ['t-rex', 'triceratops', 'raptor', 'stegosaurus', 'brontosaurus'];
  if (!validDinos.includes(dino)) dino = validDinos[Math.floor(Math.random() * validDinos.length)];

  if (language !== 'id' && language !== 'en') language = 'en';

  if (roomId === 'new') {
    roomId = roomManager.createRoom(ws, playerId, name, dino, language, isPublic, pwd);
    sendToClient(ws, {
      type: 'room_state',
      payload: {
        players: [{ id: playerId, name, dino, progress: 0, wpm: 0, accuracy: 100, finished: false, ready: false }],
        text: '', hostId: playerId, status: 'waiting' as RoomStatus,
        isPublic,
      },
    });
    sendToClient(ws, { type: 'room_joined', payload: { roomId, playerId } });
    return;
  }

  const result = roomManager.joinRoom(ws, roomId, playerId, name, dino, asSpectator, pwd);
  if (!result.success) { sendError(ws, result.error || 'Gagal join room.'); return; }

  sendToClient(ws, { type: 'room_joined', payload: { roomId, playerId } });

  broadcastToRoom(roomManager, roomId, {
    type: 'player_joined',
    payload: { id: playerId, name, dino, isSpectator: !!asSpectator },
  });

  broadcastRoomState(roomManager, roomId);

  if (asSpectator) {
    const room = roomManager.getRoom(roomId);
    if (room && room.status === 'racing') {
      const players = Array.from(room.players.values()).map(p => ({
        id: p.id, name: p.name, dino: p.dino,
        progress: p.progress, wpm: p.wpm, accuracy: p.accuracy, finished: p.finished,
      }));
      sendToClient(ws, {
        type: 'spectator_update',
        payload: { players, text: room.text, startedAt: room.startedAt || 0 },
      });
    }
  }
}

function handleProgress(ws: WebSocket, roomManager: RoomManager, payload: { charIndex: number }): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;
  const { valid, wpm, accuracy, finished } = roomManager.updateProgress(ws, payload.charIndex, room.text);
  if (!valid) return;
  const playerId = roomManager.getPlayerIdByWsSafe(ws);
  if (!playerId) return;
  broadcastToRoom(roomManager, room.id, {
    type: 'player_update',
    payload: { id: playerId, progress: payload.charIndex, wpm, accuracy, finished },
  });
  if (finished && roomManager.checkAllFinished(room.id)) endRace(roomManager, room.id);
}

function handleFinish(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;
  const playerId = roomManager.getPlayerIdByWsSafe(ws);
  if (!playerId) return;
  const player = room.players.get(playerId);
  if (!player || player.finished) return;
  player.finished = true;
  player.finishedAt = Date.now();
  player.progress = room.text.length;
  broadcastToRoom(roomManager, room.id, {
    type: 'player_update',
    payload: { id: playerId, progress: room.text.length, wpm: player.wpm, accuracy: player.accuracy, finished: true },
  });
  if (roomManager.checkAllFinished(room.id)) endRace(roomManager, room.id);
}

function handleStartRace(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;
  if (!roomManager.isHost(ws)) { sendError(ws, 'Hanya host yang bisa memulai balapan.'); return; }

  const success = roomManager.startRace(room.id);
  if (!success) return;

  let idx = 0;
  const countdownSequence = [3, 2, 1];
  const sendCountdown = () => {
    if (idx < countdownSequence.length) {
      broadcastToRoom(roomManager, room.id, { type: 'countdown', payload: { secs: countdownSequence[idx] } });
      idx++;
      setTimeout(sendCountdown, 1000);
    } else {
      roomManager.beginRace(room.id);
      broadcastToRoom(roomManager, room.id, {
        type: 'race_start',
        payload: { startedAt: room.startedAt, text: room.text },
      });
    }
  };
  sendCountdown();
}

function handleReady(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room || room.status !== 'waiting') return;
  const result = roomManager.setReady(ws);
  if (!result) return;
  broadcastToRoom(roomManager, room.id, { type: 'player_ready', payload: { id: result.playerId, ready: result.ready } });
}

function handleResetRace(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;
  if (!roomManager.isHost(ws)) { sendError(ws, 'Hanya host yang bisa mereset balapan.'); return; }
  if (room.status !== 'finished') { sendError(ws, 'Balapan belum selesai.'); return; }

  const quotes = require('../data/quotes.json');
  const lang = room.language || 'en';
  const filtered = quotes.filter((q: any) => q.language === lang);
  const pool = filtered.length > 0 ? filtered : quotes;
  const quote = pool[Math.floor(Math.random() * pool.length)];

  room.text = quote.text;
  room.textId = quote.id;
  room.status = 'waiting';
  room.startedAt = null;

  for (const [, player] of room.players) {
    player.progress = 0; player.wpm = 0; player.accuracy = 100;
    player.correctChars = 0; player.totalKeystrokes = 0;
    player.finished = false; player.finishedAt = null; player.ready = false;
  }

  broadcastRoomState(roomManager, room.id);
}

function handleGetLeaderboard(ws: WebSocket, database: Database, payload: { limit?: number }): void {
  database.getLeaderboard(payload.limit || 20).then(entries => {
    sendToClient(ws, { type: 'leaderboard', payload: { entries } });
  });
}

function handleGetPlayerHistory(ws: WebSocket, database: Database, payload: { playerId: string; limit?: number }): void {
  if (!payload.playerId) { sendError(ws, 'playerId diperlukan.'); return; }
  database.getPlayerHistory(payload.playerId, payload.limit || 10).then(history => {
    sendToClient(ws, { type: 'player_history', payload: { playerId: payload.playerId, history } });
  });
}

function handleGetPublicRooms(ws: WebSocket, roomManager: RoomManager): void {
  const rooms = roomManager.getPublicRooms();
  sendToClient(ws, { type: 'public_rooms', payload: { rooms } });
}

const raceEndedRooms = new Set<string>();

function endRace(roomManager: RoomManager, roomId: string): void {
  if (raceEndedRooms.has(roomId)) return;
  raceEndedRooms.add(roomId);

  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const results = roomManager.getResults(roomId);
  roomManager.setRoomStatus(roomId, 'finished');

  const db = (global as Record<string, unknown>).__database as Database | undefined;

  const playerRecords = results.map(r => {
    const xp = calcXp(r.wpm, r.accuracy, r.rank, results.length);
    return {
      playerId: r.id, name: r.name, dino: r.dino,
      wpm: r.wpm, accuracy: r.accuracy, timeMs: r.timeMs, rank: r.rank,
      xpEarned: xp, errors: '',
    };
  });

  if (db) {
    db.saveRace({
      id: uuidv4(),
      roomId: room.id,
      textId: room.textId,
      startedAt: room.startedAt || Date.now(),
      players: playerRecords,
    });

    for (const r of playerRecords) {
      for (const [c, a] of wsAuth) {
        if (roomManager.getPlayerIdByWsSafe(c) === r.playerId) {
          db.addXp(a.userId, r.xpEarned);
          break;
        }
      }
    }
  }

  broadcastToRoom(roomManager, roomId, {
    type: 'race_end',
    payload: {
      results: results.map((r, i) => ({
        ...r,
        xpEarned: playerRecords[i]?.xpEarned || 0,
      })),
    },
  });

  setTimeout(() => raceEndedRooms.delete(roomId), 10000);
}

function sendToClient(ws: WebSocket, message: { type: string; payload: unknown }): void {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}

function broadcastToRoom(roomManager: RoomManager, roomId: string, message: { type: string; payload: unknown }): void {
  const clients = roomManager.getRoomClients(roomId);
  if (!clients) return;
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
}

function sendError(ws: WebSocket, message: string): void {
  sendToClient(ws, { type: 'error', payload: { message } });
}

function broadcastRoomState(roomManager: RoomManager, roomId: string): void {
  const room = roomManager.getRoom(roomId);
  if (!room) return;
  const players = Array.from(room.players.values()).map(p => ({
    id: p.id, name: p.name, dino: p.dino,
    progress: p.progress, wpm: p.wpm,
    accuracy: p.accuracy, finished: p.finished, ready: p.ready,
  }));
  broadcastToRoom(roomManager, roomId, {
    type: 'room_state',
    payload: { players, text: room.text, hostId: room.hostId, status: room.status, isPublic: room.isPublic },
  });
}
