import { DinoType } from '../types';

export interface PlayerRecord {
  playerId: string;
  name: string;
  dino: DinoType;
  wpm: number;
  accuracy: number;
  timeMs: number;
  rank: number;
}

export interface RaceRecord {
  id: string;
  roomId: string;
  textId: string;
  startedAt: number;
  players: PlayerRecord[];
}

export interface LeaderboardEntry {
  name: string;
  bestWpm: number;
  avgWpm: number;
  racesPlayed: number;
  bestAccuracy: number;
  bestRank: number;
  lastPlayed: number;
}

export interface PlayerHistoryEntry {
  raceId: string;
  textId: string;
  wpm: number;
  accuracy: number;
  timeMs: number;
  rank: number;
  totalPlayers: number;
  startedAt: number;
}

export interface Database {
  saveRace(record: RaceRecord): Promise<void>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getPlayerHistory(playerId: string, limit?: number): Promise<PlayerHistoryEntry[]>;
  getPlayerStats(playerId: string): Promise<LeaderboardEntry | null>;
}

export class InMemoryDatabase implements Database {
  private races: RaceRecord[] = [];
  private playerNameIndex: Map<string, string> = new Map();

  async saveRace(record: RaceRecord): Promise<void> {
    this.races.push(record);
    for (const p of record.players) {
      const existing = this.playerNameIndex.get(p.playerId);
      if (!existing || existing.length < p.name.length) {
        this.playerNameIndex.set(p.playerId, p.name);
      }
    }
  }

  async getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const stats = new Map<string, {
      wpmSum: number; count: number; bestWpm: number;
      accuracySum: number; bestRank: number; lastPlayed: number;
    }>();

    for (const race of this.races) {
      for (const p of race.players) {
        const s = stats.get(p.playerId) || {
          wpmSum: 0, count: 0, bestWpm: 0,
          accuracySum: 0, bestRank: 999, lastPlayed: 0,
        };
        s.wpmSum += p.wpm;
        s.count++;
        s.accuracySum += p.accuracy;
        if (p.wpm > s.bestWpm) s.bestWpm = p.wpm;
        if (p.rank < s.bestRank) s.bestRank = p.rank;
        if (race.startedAt > s.lastPlayed) s.lastPlayed = race.startedAt;
        stats.set(p.playerId, s);
      }
    }

    const entries: LeaderboardEntry[] = [];
    for (const [playerId, s] of stats) {
      entries.push({
        name: this.playerNameIndex.get(playerId) || 'Unknown',
        bestWpm: s.bestWpm,
        avgWpm: Math.round(s.wpmSum / s.count),
        racesPlayed: s.count,
        bestAccuracy: Math.round(s.accuracySum / s.count),
        bestRank: s.bestRank,
        lastPlayed: s.lastPlayed,
      });
    }

    entries.sort((a, b) => b.bestWpm - a.bestWpm);
    return entries.slice(0, limit);
  }

  async getPlayerHistory(playerId: string, limit = 10): Promise<PlayerHistoryEntry[]> {
    const history: PlayerHistoryEntry[] = [];

    for (const race of this.races) {
      const player = race.players.find(p => p.playerId === playerId);
      if (player) {
        history.push({
          raceId: race.id,
          textId: race.textId,
          wpm: player.wpm,
          accuracy: player.accuracy,
          timeMs: player.timeMs,
          rank: player.rank,
          totalPlayers: race.players.length,
          startedAt: race.startedAt,
        });
      }
    }

    history.sort((a, b) => b.startedAt - a.startedAt);
    return history.slice(0, limit);
  }

  async getPlayerStats(playerId: string): Promise<LeaderboardEntry | null> {
    const entries = await this.getLeaderboard(1000);
    return entries.find(e => {
      for (const race of this.races) {
        if (race.players.some(p => p.playerId === playerId)) {
          const p = race.players.find(pl => pl.playerId === playerId);
          if (p && e.name === (this.playerNameIndex.get(playerId) || p.name)) return true;
        }
      }
      return false;
    }) || null;
  }
}
