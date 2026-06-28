import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { RoomManager } from './services/RoomManager';
import { Database, InMemoryDatabase } from './services/Database';
import { PostgresDatabase } from './services/PostgresDatabase';
import { handleConnection } from './handlers/wsHandler';

const PORT = parseInt(process.env.PORT || '3001', 10);

function parseUrl(url?: string): { path: string; query: URLSearchParams } {
  const u = new URL(url || '/', `http://localhost:${PORT}`);
  return { path: u.pathname, query: u.searchParams };
}

async function handleApi(req: IncomingMessage, res: ServerResponse, db: Database) {
  const { path, query } = parseUrl(req.url);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
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
      res.writeHead(200);
      res.end(JSON.stringify({ filter, entries: filtered }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify({ filter, entries }));
    return;
  }

  if (path.startsWith('/api/profile/')) {
    const playerName = decodeURIComponent(path.slice('/api/profile/'.length));
    if (!playerName) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Player name required' }));
      return;
    }

    const entries = await db.getLeaderboard(100);
    const player = entries.find(e => e.name === playerName);
    if (!player) {
      res.writeHead(404);
      res.end(JSON.stringify({ error: 'Player not found' }));
      return;
    }

    res.writeHead(200);
    res.end(JSON.stringify(player));
    return;
  }

  if (path === '/api/health' || path === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

async function main() {
  let database: Database;
  if (process.env.DATABASE_URL) {
    const db = new PostgresDatabase(process.env.DATABASE_URL);
    await db.init();
    console.log('[DB] PostgreSQL connected');
    database = db;
  } else {
    console.log('[DB] Using in-memory database');
    database = new InMemoryDatabase();
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
    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer, path: undefined });

  function broadcastOnlineCount() {
    const count = wss.clients.size;
    const msg = JSON.stringify({ type: 'online_count', payload: { count } });
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  }

  wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    broadcastOnlineCount();
    handleConnection(ws, roomManager, database);

    ws.on('close', () => {
      setTimeout(broadcastOnlineCount, 100);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`[Dino Dash Server] Running on port ${PORT}`);
  });

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

main().catch((err) => {
  console.error('[Server] Failed to start:', err);
  process.exit(1);
});
