import { Database, RaceRecord, LeaderboardEntry, PlayerHistoryEntry, UserRecord, DashboardData, ChallengeRecord } from './Database';

const { Pool } = require('pg');

export class PostgresDatabase implements Database {
  private pool: InstanceType<typeof Pool>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 10, ssl: { rejectUnauthorized: false } });
  }

  async init(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS races (
          id TEXT PRIMARY KEY,
          room_id TEXT NOT NULL,
          text_id TEXT NOT NULL,
          started_at BIGINT NOT NULL
        )
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS race_players (
          id SERIAL PRIMARY KEY,
          race_id TEXT NOT NULL REFERENCES races(id),
          player_id TEXT NOT NULL,
          name TEXT NOT NULL,
          dino TEXT NOT NULL,
          wpm INTEGER NOT NULL,
          accuracy INTEGER NOT NULL,
          time_ms BIGINT NOT NULL,
          rank INTEGER NOT NULL,
          xp_earned INTEGER DEFAULT 0,
          errors TEXT DEFAULT ''
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_race_players_player_id ON race_players(player_id)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_race_players_race_id ON race_players(race_id)
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          xp INTEGER DEFAULT 0,
          total_races INTEGER DEFAULT 0
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
      `);
      await client.query(`
        CREATE TABLE IF NOT EXISTS challenges (
          id TEXT PRIMARY KEY,
          challenger_id TEXT NOT NULL,
          challenger_name TEXT NOT NULL,
          wpm INTEGER NOT NULL,
          accuracy INTEGER NOT NULL,
          text_id TEXT NOT NULL,
          created_at BIGINT NOT NULL
        )
      `);
    } finally {
      client.release();
    }
  }

  async saveRace(record: RaceRecord): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        'INSERT INTO races (id, room_id, text_id, started_at) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
        [record.id, record.roomId, record.textId, record.startedAt]
      );
      for (const p of record.players) {
        await client.query(
          `INSERT INTO race_players (race_id, player_id, name, dino, wpm, accuracy, time_ms, rank, xp_earned, errors)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [record.id, p.playerId, p.name, p.dino, p.wpm, p.accuracy, p.timeMs, p.rank, p.xpEarned || 0, p.errors || '']
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const result = await this.pool.query(`
      SELECT
        rp.player_id,
        rp.name,
        MAX(rp.wpm) AS best_wpm,
        ROUND(AVG(rp.wpm)) AS avg_wpm,
        COUNT(*) AS races_played,
        MAX(rp.accuracy) AS best_accuracy,
        MIN(rp.rank) AS best_rank,
        MAX(r.started_at) AS last_played
      FROM race_players rp
      JOIN races r ON r.id = rp.race_id
      GROUP BY rp.player_id, rp.name
      ORDER BY best_wpm DESC
      LIMIT $1
    `, [limit]);

    return result.rows.map((row: any) => ({
      name: row.name,
      bestWpm: Number(row.best_wpm),
      avgWpm: Number(row.avg_wpm),
      racesPlayed: Number(row.races_played),
      bestAccuracy: Number(row.best_accuracy),
      bestRank: Number(row.best_rank),
      lastPlayed: Number(row.last_played),
    }));
  }

  async getPlayerHistory(playerId: string, limit = 10): Promise<PlayerHistoryEntry[]> {
    const result = await this.pool.query(`
      SELECT
        r.id AS race_id,
        r.text_id,
        rp.wpm,
        rp.accuracy,
        rp.time_ms,
        rp.rank,
        rp.xp_earned,
        (SELECT COUNT(*) FROM race_players rp2 WHERE rp2.race_id = r.id) AS total_players,
        r.started_at
      FROM race_players rp
      JOIN races r ON r.id = rp.race_id
      WHERE rp.player_id = $1
      ORDER BY r.started_at DESC
      LIMIT $2
    `, [playerId, limit]);

    return result.rows.map((row: any) => ({
      raceId: row.race_id,
      textId: row.text_id,
      wpm: Number(row.wpm),
      accuracy: Number(row.accuracy),
      timeMs: Number(row.time_ms),
      rank: Number(row.rank),
      totalPlayers: Number(row.total_players),
      startedAt: Number(row.started_at),
      xpEarned: Number(row.xp_earned),
    }));
  }

  async getPlayerStats(playerId: string): Promise<LeaderboardEntry | null> {
    const result = await this.pool.query(`
      SELECT
        rp.player_id,
        rp.name,
        MAX(rp.wpm) AS best_wpm,
        ROUND(AVG(rp.wpm)) AS avg_wpm,
        COUNT(*) AS races_played,
        MAX(rp.accuracy) AS best_accuracy,
        MIN(rp.rank) AS best_rank,
        MAX(r.started_at) AS last_played
      FROM race_players rp
      JOIN races r ON r.id = rp.race_id
      WHERE rp.player_id = $1
      GROUP BY rp.player_id, rp.name
    `, [playerId]);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      name: row.name,
      bestWpm: Number(row.best_wpm),
      avgWpm: Number(row.avg_wpm),
      racesPlayed: Number(row.races_played),
      bestAccuracy: Number(row.best_accuracy),
      bestRank: Number(row.best_rank),
      lastPlayed: Number(row.last_played),
    };
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  async createUser(username: string, passwordHash: string): Promise<UserRecord> {
    const { v4 } = require('uuid');
    const id = v4();
    const result = await this.pool.query(
      `INSERT INTO users (id, username, password_hash, created_at, xp, total_races) VALUES ($1, $2, $3, $4, 0, 0)
       ON CONFLICT (username) DO NOTHING RETURNING id`,
      [id, username.toLowerCase(), passwordHash, Date.now()]
    );
    if (result.rows.length === 0) throw new Error('Username already exists');
    return { id, username, passwordHash, createdAt: Date.now(), xp: 0, totalRaces: 0 };
  }

  async getUserByUsername(username: string): Promise<UserRecord | null> {
    const result = await this.pool.query(
      'SELECT id, username, password_hash, created_at, xp, total_races FROM users WHERE username = $1',
      [username.toLowerCase()]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id, username: row.username, passwordHash: row.password_hash, createdAt: Number(row.created_at), xp: Number(row.xp), totalRaces: Number(row.total_races) };
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    const result = await this.pool.query(
      'SELECT id, username, password_hash, created_at, xp, total_races FROM users WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id, username: row.username, passwordHash: row.password_hash, createdAt: Number(row.created_at), xp: Number(row.xp), totalRaces: Number(row.total_races) };
  }

  async addXp(userId: string, xp: number): Promise<void> {
    await this.pool.query(
      'UPDATE users SET xp = xp + $1, total_races = total_races + 1 WHERE id = $2',
      [xp, userId]
    );
  }

  async getDashboard(userId: string): Promise<DashboardData | null> {
    const user = await this.getUserById(userId);
    if (!user) return null;

    const history = await this.getPlayerHistory(userId, 20);
    const stats = await this.getPlayerStats(userId);

    const weekDays: { day: string; wpm: number }[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const start = now - i * 86400000;
      const end = start + 86400000;
      const dayRaces = history.filter(r => r.startedAt >= start && r.startedAt < end);
      const avg = dayRaces.length > 0 ? Math.round(dayRaces.reduce((a, r) => a + r.wpm, 0) / dayRaces.length) : 0;
      const d = new Date(start);
      weekDays.push({ day: d.toLocaleDateString('id', { weekday: 'short' }), wpm: avg });
    }

    const level = Math.floor(Math.sqrt(user.xp / 100)) + 1;

    return {
      username: user.username,
      xp: user.xp,
      level,
      totalRaces: user.totalRaces,
      bestWpm: stats?.bestWpm || 0,
      avgWpm: stats?.avgWpm || 0,
      bestAccuracy: stats?.bestAccuracy || 0,
      recentRaces: history.slice(0, 10),
      weeklyWpm: weekDays,
    };
  }

  async createChallenge(challengerId: string, challengerName: string, wpm: number, accuracy: number, textId: string): Promise<string> {
    const { v4 } = require('uuid');
    const id = v4().slice(0, 8);
    await this.pool.query(
      `INSERT INTO challenges (id, challenger_id, challenger_name, wpm, accuracy, text_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, challengerId, challengerName, wpm, accuracy, textId, Date.now()]
    );
    return id;
  }

  async getChallenge(id: string): Promise<ChallengeRecord | null> {
    const result = await this.pool.query('SELECT * FROM challenges WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id, challengerId: row.challenger_id, challengerName: row.challenger_name, wpm: Number(row.wpm), accuracy: Number(row.accuracy), textId: row.text_id, createdAt: Number(row.created_at) };
  }
}
