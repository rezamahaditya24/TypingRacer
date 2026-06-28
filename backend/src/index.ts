import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RoomManager } from './services/RoomManager';
import { Database, InMemoryDatabase } from './services/Database';
import { PostgresDatabase } from './services/PostgresDatabase';
import { handleConnection } from './handlers/wsHandler';

const PORT = parseInt(process.env.PORT || '3001', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'dino-dash-secret-key';

function parseUrl(url?: string): { path: string; query: URLSearchParams } {
  const u = new URL(url || '/', `http://localhost:${PORT}`);
  return { path: u.pathname, query: u.searchParams };
}

function parseBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { resolve({}); }
    });
  });
}

function getAuthUser(req: IncomingMessage): { userId: string; username: string } | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; username: string }; }
  catch { return null; }
}

async function handleApi(req: IncomingMessage, res: ServerResponse, db: Database) {
  const { path, query } = parseUrl(req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // Auth endpoints
  if (path === '/api/signup' && req.method === 'POST') {
    const body = await parseBody(req);
    const username = (body.username as string || '').trim();
    const password = body.password as string || '';
    if (!username || username.length < 3) { res.writeHead(400); res.end(JSON.stringify({ error: 'Username minimal 3 karakter' })); return; }
    if (password.length < 4) { res.writeHead(400); res.end(JSON.stringify({ error: 'Password minimal 4 karakter' })); return; }
    try {
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await db.createUser(username, passwordHash);
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.writeHead(201);
      res.end(JSON.stringify({ token, user: { id: user.id, username: user.username, xp: 0, level: 1 } }));
    } catch (e: any) {
      if (e.message === 'Username already exists') { res.writeHead(409); res.end(JSON.stringify({ error: 'Username sudah dipakai' })); return; }
      res.writeHead(500); res.end(JSON.stringify({ error: 'Gagal daftar' }));
    }
    return;
  }

  if (path === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    const username = (body.username as string || '').trim();
    const password = body.password as string || '';
    if (!username || !password) { res.writeHead(400); res.end(JSON.stringify({ error: 'Username dan password diperlukan' })); return; }
    const user = await db.getUserByUsername(username);
    if (!user) { res.writeHead(401); res.end(JSON.stringify({ error: 'Username atau password salah' })); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.writeHead(401); res.end(JSON.stringify({ error: 'Username atau password salah' })); return; }
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    const level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
    res.writeHead(200);
    res.end(JSON.stringify({ token, user: { id: user.id, username: user.username, xp: user.xp, level } }));
    return;
  }

  if (path === '/api/me' && req.method === 'GET') {
    const authUser = getAuthUser(req);
    if (!authUser) { res.writeHead(401); res.end(JSON.stringify({ error: 'Token diperlukan' })); return; }
    const user = await db.getUserById(authUser.userId);
    if (!user) { res.writeHead(401); res.end(JSON.stringify({ error: 'User tidak ditemukan' })); return; }
    const level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
    res.writeHead(200);
    res.end(JSON.stringify({ user: { id: user.id, username: user.username, xp: user.xp, level } }));
    return;
  }

  // Dashboard endpoint
  if (path === '/api/dashboard' && req.method === 'GET') {
    const authUser = getAuthUser(req);
    if (!authUser) { res.writeHead(401); res.end(JSON.stringify({ error: 'Login diperlukan' })); return; }
    const data = await db.getDashboard(authUser.userId);
    if (!data) { res.writeHead(404); res.end(JSON.stringify({ error: 'Data tidak ditemukan' })); return; }
    res.writeHead(200); res.end(JSON.stringify(data));
    return;
  }

  // Challenge endpoint
  if (path === '/api/challenge' && req.method === 'POST') {
    const body = await parseBody(req);
    const authUser = getAuthUser(req);
    if (!authUser) { res.writeHead(401); res.end(JSON.stringify({ error: 'Login diperlukan' })); return; }
    const { wpm, accuracy, textId } = body;
    const id = await db.createChallenge(authUser.userId, authUser.username, wpm as number, accuracy as number, textId as string);
    res.writeHead(201); res.end(JSON.stringify({ id, url: `${id}` }));
    return;
  }

  if (path.startsWith('/api/challenge/') && req.method === 'GET') {
    const id = path.slice('/api/challenge/'.length);
    const challenge = await db.getChallenge(id);
    if (!challenge) { res.writeHead(404); res.end(JSON.stringify({ error: 'Challenge tidak ditemukan' })); return; }
    res.writeHead(200); res.end(JSON.stringify(challenge));
    return;
  }

  if (path === '/api/leaderboard') {
    const filter = query.get('filter') || 'alltime';
    let limit = parseInt(query.get('limit') || '20', 10);
    if (Number.isNaN(limit) || limit < 1) limit = 20;
    if (limit > 100) limit = 100;
    const entries = await db.getLeaderboard(limit);
    if (filter === 'today' || filter === 'week') {
      const now = Date.now();
      const cutoff = filter === 'today' ? now - 86400000 : now - 604800000;
      const filtered = entries.filter(e => e.lastPlayed >= cutoff);
      res.writeHead(200); res.end(JSON.stringify({ filter, entries: filtered }));
      return;
    }
    res.writeHead(200); res.end(JSON.stringify({ filter, entries }));
    return;
  }

  if (path.startsWith('/api/profile/')) {
    const playerName = decodeURIComponent(path.slice('/api/profile/'.length));
    if (!playerName) { res.writeHead(400); res.end(JSON.stringify({ error: 'Player name required' })); return; }
    const entries = await db.getLeaderboard(100);
    const player = entries.find(e => e.name === playerName);
    if (!player) { res.writeHead(404); res.end(JSON.stringify({ error: 'Player not found' })); return; }
    res.writeHead(200); res.end(JSON.stringify(player));
    return;
  }

  if (path === '/api/health' || path === '/health') {
    res.writeHead(200); res.end(JSON.stringify({ status: 'ok', uptime: process.uptime(), db: (global as Record<string, unknown>).__dbType || 'memory' }));
    return;
  }

  res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' }));
}

async function main() {
  let database: Database;
  if (process.env.DATABASE_URL) {
    const db = new PostgresDatabase(process.env.DATABASE_URL);
    await db.init();
    console.log('[DB] PostgreSQL connected');
    database = db;
    (global as Record<string, unknown>).__dbType = 'postgres';
  } else {
    console.log('[DB] Using in-memory database');
    database = new InMemoryDatabase();
    (global as Record<string, unknown>).__dbType = 'memory';
  }

  (global as Record<string, unknown>).__database = database;

  const roomManager = new RoomManager();

  const httpServer = createServer((req, res) => {
    if (!req.url || req.url === '/') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'ok', service: 'dino-dash-backend' }));
      return;
    }
    if (req.url.startsWith('/api/') || req.url === '/health') {
      handleApi(req, res, database);
      return;
    }
    res.writeHead(404); res.end();
  });

  const wss = new WebSocketServer({ server: httpServer, path: undefined });

  function broadcastOnlineCount() {
    const count = wss.clients.size;
    const msg = JSON.stringify({ type: 'online_count', payload: { count } });
    wss.clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(msg); });
  }

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    broadcastOnlineCount();
    handleConnection(ws, roomManager, database);
    ws.on('close', () => { setTimeout(broadcastOnlineCount, 100); });
  });

  httpServer.listen(PORT, () => { console.log(`[Dino Dash Server] Running on port ${PORT}`); });

  process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down...');
    wss.clients.forEach(client => client.close());
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  });

  process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down...');
    wss.clients.forEach(client => client.close());
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  });
}

main().catch((err) => { console.error('[Server] Failed to start:', err); process.exit(1); });
