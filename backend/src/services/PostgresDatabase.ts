import { Database, RaceRecord, LeaderboardEntry, PlayerHistoryEntry } from './Database';

const { Pool } = require('pg');

export class PostgresDatabase implements Database {
  private pool: InstanceType<typeof Pool>;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString, max: 10 });
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
          rank INTEGER NOT NULL
        )
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_race_players_player_id ON race_players(player_id)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_race_players_race_id ON race_players(race_id)
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
          `INSERT INTO race_players (race_id, player_id, name, dino, wpm, accuracy, time_ms, rank)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [record.id, p.playerId, p.name, p.dino, p.wpm, p.accuracy, p.timeMs, p.rank]
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
}
