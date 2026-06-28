import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from 'ws';
import { Player, Room, RoomStatus, DinoType } from '../types';
import quotes from '../data/quotes.json';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private clientRoomMap: Map<WebSocket, string> = new Map();
  private roomClients: Map<string, Set<WebSocket>> = new Map();
  private wsPlayerMap: Map<WebSocket, string> = new Map();

  generateRoomId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  createRoom(hostWs: WebSocket, hostId: string, name: string, dino: DinoType): string {
    const roomId = this.generateRoomId();
    const player: Player = {
      id: hostId,
      name,
      dino,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      totalKeystrokes: 0,
      finished: false,
      finishedAt: null,
      connected: true,
      ready: false,
    };

    const room: Room = {
      id: roomId,
      players: new Map([[hostId, player]]),
      hostId,
      status: 'waiting',
      text: '',
      textId: '',
      startedAt: null,
      countdownEndsAt: null,
    };

    this.rooms.set(roomId, room);
    this.clientRoomMap.set(hostWs, roomId);

    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set());
    }
    this.roomClients.get(roomId)!.add(hostWs);

    return roomId;
  }

  joinRoom(ws: WebSocket, roomId: string, playerId: string, name: string, dino: DinoType): { success: boolean; error?: string } {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room tidak ditemukan.' };
    }
    if (room.status !== 'waiting') {
      return { success: false, error: 'Balapan sudah dimulai.' };
    }
    if (room.players.size >= 5) {
      return { success: false, error: 'Room penuh (maks 5 pemain).' };
    }

    const player: Player = {
      id: playerId,
      name,
      dino,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      correctChars: 0,
      totalKeystrokes: 0,
      finished: false,
      finishedAt: null,
      connected: true,
      ready: false,
    };

    room.players.set(playerId, player);
    this.clientRoomMap.set(ws, roomId);

    if (!this.roomClients.has(roomId)) {
      this.roomClients.set(roomId, new Set());
    }
    this.roomClients.get(roomId)!.add(ws);

    return { success: true };
  }

  leaveRoom(ws: WebSocket): void {
    const roomId = this.clientRoomMap.get(ws);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) {
      this.clientRoomMap.delete(ws);
      return;
    }

    const leftPlayerId = this.wsPlayerMap.get(ws);

    if (leftPlayerId && room.players.has(leftPlayerId)) {
      room.players.delete(leftPlayerId);
      if (room.hostId === leftPlayerId && room.players.size > 0) {
        const firstPlayer = room.players.values().next().value;
        if (firstPlayer) {
          room.hostId = firstPlayer.id;
        }
      }
    }

    this.clientRoomMap.delete(ws);
    this.roomClients.get(roomId)?.delete(ws);

    if (room.players.size === 0) {
      this.rooms.delete(roomId);
      this.roomClients.delete(roomId);
    }
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  getRoomByWs(ws: WebSocket): Room | undefined {
    const roomId = this.clientRoomMap.get(ws);
    if (!roomId) return undefined;
    return this.rooms.get(roomId);
  }

  getRoomIdByWs(ws: WebSocket): string | undefined {
    return this.clientRoomMap.get(ws);
  }

  getPlayersInRoom(roomId: string): Player[] {
    const room = this.rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.players.values());
  }

  getRoomClients(roomId: string): Set<WebSocket> | undefined {
    return this.roomClients.get(roomId);
  }

  isHost(ws: WebSocket): boolean {
    const room = this.getRoomByWs(ws);
    if (!room) return false;
    const playerId = this.wsPlayerMap.get(ws);
    return room.hostId === playerId;
  }

  setPlayerIdForWs(ws: WebSocket, playerId: string): void {
    this.wsPlayerMap.set(ws, playerId);
  }

  getPlayerIdByWsSafe(ws: WebSocket): string | undefined {
    return this.wsPlayerMap.get(ws);
  }

  startRace(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || (room.status !== 'waiting' && room.status !== 'finished')) return false;

    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    room.text = quote.text;
    room.textId = quote.id;
    room.status = 'countdown';

    return true;
  }

  beginRace(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.status !== 'countdown') return false;

    room.status = 'racing';
    room.startedAt = Date.now();

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

    return true;
  }

  updateProgress(ws: WebSocket, charIndex: number, text: string): { valid: boolean; wpm: number; accuracy: number; finished: boolean } {
    const room = this.getRoomByWs(ws);
    if (!room || room.status !== 'racing') {
      return { valid: false, wpm: 0, accuracy: 0, finished: false };
    }

    const playerId = this.getPlayerIdByWsSafe(ws);
    if (!playerId) return { valid: false, wpm: 0, accuracy: 0, finished: false };

    const player = room.players.get(playerId);
    if (!player || player.finished) {
      return { valid: false, wpm: 0, accuracy: 0, finished: false };
    }

    if (charIndex < player.progress) {
      return { valid: false, wpm: 0, accuracy: 0, finished: false };
    }

    if (charIndex > text.length) {
      charIndex = text.length;
    }

    const prevProgress = player.progress;
    const charsAdvanced = charIndex - prevProgress;

    player.progress = charIndex;
    player.correctChars = charIndex;
    player.totalKeystrokes += Math.max(charsAdvanced, 0);

    const elapsed = (Date.now() - room.startedAt!) / 1000 / 60;
    const words = player.correctChars / 5;
    const wpm = elapsed > 0 ? Math.round(words / elapsed) : 0;

    // Anti-cheat: reject WPM > 250 (not humanly possible)
    if (wpm > 250) {
      return { valid: false, wpm: 0, accuracy: 0, finished: false };
    }

    player.wpm = wpm;

    const accuracy = player.totalKeystrokes > 0
      ? Math.round((player.correctChars / player.totalKeystrokes) * 100)
      : 100;
    player.accuracy = accuracy;

    const finished = charIndex >= text.length;
    if (finished) {
      player.finished = true;
      player.finishedAt = Date.now();
    }

    return { valid: true, wpm, accuracy, finished };
  }

  checkAllFinished(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;

    for (const [, player] of room.players) {
      if (!player.finished) return false;
    }
    return true;
  }

  getResults(roomId: string): Array<{ id: string; name: string; dino: DinoType; rank: number; wpm: number; accuracy: number; timeMs: number }> {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    const players = Array.from(room.players.values());
    const startedAt = room.startedAt!;

    const sorted = players
      .filter(p => p.finished && p.finishedAt)
      .sort((a, b) => (a.finishedAt || 0) - (b.finishedAt || 0));

    return sorted.map((p, i) => ({
      id: p.id,
      name: p.name,
      dino: p.dino,
      rank: i + 1,
      wpm: p.wpm,
      accuracy: p.accuracy,
      timeMs: (p.finishedAt || startedAt) - startedAt,
    }));
  }

  setRoomStatus(roomId: string, status: RoomStatus): void {
    const room = this.rooms.get(roomId);
    if (room) {
      room.status = status;
    }
  }

  setReady(ws: WebSocket): { playerId: string; ready: boolean } | null {
    const room = this.getRoomByWs(ws);
    if (!room) return null;
    const playerId = this.getPlayerIdByWsSafe(ws);
    if (!playerId) return null;
    const player = room.players.get(playerId);
    if (!player) return null;
    player.ready = !player.ready;
    return { playerId, ready: player.ready };
  }

  removeClient(ws: WebSocket): void {
    this.leaveRoom(ws);
    this.wsPlayerMap.delete(ws);
  }
}
