import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { RoomManager } from '../services/RoomManager';
import { Database } from '../services/Database';
import { ClientToServer, DinoType, RoomStatus } from '../types';

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
      default:
        sendError(ws, `Tipe pesan tidak dikenal: ${type}`);
    }
  });

  ws.on('close', () => {
    const roomId = roomManager.getRoomIdByWs(ws);
    if (roomId) {
      const playerId = roomManager.getPlayerIdByWsSafe(ws);
      roomManager.removeClient(ws);

      if (playerId) {
        broadcastToRoom(roomManager, roomId, {
          type: 'player_left',
          payload: { id: playerId },
        });

        const room = roomManager.getRoom(roomId);
        if (room) {
          broadcastRoomState(roomManager, roomId);
        }
      }
    }
  });
}

function handleJoinRoom(ws: WebSocket, roomManager: RoomManager, payload: ClientToServer['join_room']): void {
  let { roomId, name, dino, language } = payload;
  const playerId = roomManager.getPlayerIdByWsSafe(ws)!;

  if (!name || name.trim().length === 0) {
    name = `Pemain${playerId.slice(0, 4)}`;
  }

  const validDinos: DinoType[] = ['t-rex', 'triceratops', 'raptor', 'stegosaurus', 'brontosaurus'];
  if (!validDinos.includes(dino)) {
    dino = validDinos[Math.floor(Math.random() * validDinos.length)];
  }

  if (language !== 'id' && language !== 'en') {
    language = 'en';
  }

  if (roomId === 'new') {
    roomId = roomManager.createRoom(ws, playerId, name, dino, language);

    sendToClient(ws, {
      type: 'room_state',
      payload: {
        players: [{
          id: playerId, name, dino,
          progress: 0, wpm: 0, accuracy: 100, finished: false,
        }],
        text: '',
        hostId: playerId,
        status: 'waiting' as RoomStatus,
      },
    });

    sendToClient(ws, {
      type: 'room_joined',
      payload: { roomId, playerId },
    });
    return;
  }

  const result = roomManager.joinRoom(ws, roomId, playerId, name, dino);
  if (!result.success) {
    sendError(ws, result.error || 'Gagal join room.');
    return;
  }

  sendToClient(ws, {
    type: 'room_joined',
    payload: { roomId, playerId },
  });

  broadcastToRoom(roomManager, roomId, {
    type: 'player_joined',
    payload: { id: playerId, name, dino },
  });

  broadcastRoomState(roomManager, roomId);
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

  if (finished) {
    if (roomManager.checkAllFinished(room.id)) {
      endRace(roomManager, room.id);
    }
  }
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
    payload: {
      id: playerId, progress: room.text.length,
      wpm: player.wpm, accuracy: player.accuracy, finished: true,
    },
  });

  if (roomManager.checkAllFinished(room.id)) {
    endRace(roomManager, room.id);
  }
}

function handleStartRace(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;

  if (!roomManager.isHost(ws)) {
    sendError(ws, 'Hanya host yang bisa memulai balapan.');
    return;
  }

  const success = roomManager.startRace(room.id);
  if (!success) return;

  let idx = 0;
  const countdownSequence = [3, 2, 1];

  const sendCountdown = () => {
    if (idx < countdownSequence.length) {
      broadcastToRoom(roomManager, room.id, {
        type: 'countdown',
        payload: { secs: countdownSequence[idx] },
      });
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

  broadcastToRoom(roomManager, room.id, {
    type: 'player_ready',
    payload: { id: result.playerId, ready: result.ready },
  });
}

function handleResetRace(ws: WebSocket, roomManager: RoomManager): void {
  const room = roomManager.getRoomByWs(ws);
  if (!room) return;

  if (!roomManager.isHost(ws)) {
    sendError(ws, 'Hanya host yang bisa mereset balapan.');
    return;
  }

  if (room.status !== 'finished') {
    sendError(ws, 'Balapan belum selesai.');
    return;
  }

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
    player.progress = 0;
    player.wpm = 0;
    player.accuracy = 100;
    player.correctChars = 0;
    player.totalKeystrokes = 0;
    player.finished = false;
    player.finishedAt = null;
    player.ready = false;
  }

  broadcastRoomState(roomManager, room.id);
}

function handleGetLeaderboard(ws: WebSocket, database: Database, payload: { limit?: number }): void {
  database.getLeaderboard(payload.limit || 20).then(entries => {
    sendToClient(ws, {
      type: 'leaderboard',
      payload: { entries },
    });
  });
}

function handleGetPlayerHistory(ws: WebSocket, database: Database, payload: { playerId: string; limit?: number }): void {
  if (!payload.playerId) {
    sendError(ws, 'playerId diperlukan.');
    return;
  }
  database.getPlayerHistory(payload.playerId, payload.limit || 10).then(history => {
    sendToClient(ws, {
      type: 'player_history',
      payload: { playerId: payload.playerId, history },
    });
  });
}

const raceEndedRooms = new Set<string>();

function endRace(roomManager: RoomManager, roomId: string): void {
  if (raceEndedRooms.has(roomId)) return;
  raceEndedRooms.add(roomId);

  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const results = roomManager.getResults(roomId);
  roomManager.setRoomStatus(roomId, 'finished');

  broadcastToRoom(roomManager, roomId, {
    type: 'race_end',
    payload: { results },
  });

  // Auto-save race to database
  const db = (global as Record<string, unknown>).__database as Database | undefined;
  if (db) {
    const players = results.map(r => ({
      playerId: r.id,
      name: r.name,
      dino: r.dino,
      wpm: r.wpm,
      accuracy: r.accuracy,
      timeMs: r.timeMs,
      rank: r.rank,
    }));

    db.saveRace({
      id: uuidv4(),
      roomId: room.id,
      textId: room.textId,
      startedAt: room.startedAt || Date.now(),
      players,
    });
  }

  setTimeout(() => raceEndedRooms.delete(roomId), 10000);
}

function sendToClient(ws: WebSocket, message: { type: string; payload: unknown }): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

function broadcastToRoom(roomManager: RoomManager, roomId: string, message: { type: string; payload: unknown }): void {
  const clients = roomManager.getRoomClients(roomId);
  if (!clients) return;

  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
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
    payload: {
      players, text: room.text,
      hostId: room.hostId, status: room.status,
    },
  });
}
