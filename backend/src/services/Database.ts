import { v4 as uuidv4 } from 'uuid';
import { DinoType } from '../types';

export interface UserRecord {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  xp: number;
  totalRaces: number;
}

export interface PlayerRecord {
  playerId: string;
  name: string;
  dino: DinoType;
  wpm: number;
  accuracy: number;
  timeMs: number;
  rank: number;
  xpEarned: number;
  errors?: string;
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
  xpEarned: number;
}

export interface ChallengeRecord {
  id: string;
  challengerId: string;
  challengerName: string;
  wpm: number;
  accuracy: number;
  textId: string;
  createdAt: number;
}

export interface DashboardData {
  username: string;
  xp: number;
  level: number;
  totalRaces: number;
  bestWpm: number;
  avgWpm: number;
  bestAccuracy: number;
  recentRaces: PlayerHistoryEntry[];
  weeklyWpm: { day: string; wpm: number }[];
}

export interface Database {
  saveRace(record: RaceRecord): Promise<void>;
  getLeaderboard(limit?: number): Promise<LeaderboardEntry[]>;
  getPlayerHistory(playerId: string, limit?: number): Promise<PlayerHistoryEntry[]>;
  getPlayerStats(playerId: string): Promise<LeaderboardEntry | null>;
  createUser(username: string, passwordHash: string): Promise<UserRecord>;
  getUserByUsername(username: string): Promise<UserRecord | null>;
  getUserById(id: string): Promise<UserRecord | null>;
  addXp(userId: string, xp: number): Promise<void>;
  getDashboard(userId: string): Promise<DashboardData | null>;
  createChallenge(challengerId: string, challengerName: string, wpm: number, accuracy: number, textId: string): Promise<string>;
  getChallenge(id: string): Promise<ChallengeRecord | null>;
}

export class InMemoryDatabase implements Database {
  private races: RaceRecord[] = [];
  private playerNameIndex: Map<string, string> = new Map();
  private users: Map<string, UserRecord> = new Map();
  private usernames: Map<string, UserRecord> = new Map();
  private challenges: Map<string, ChallengeRecord> = new Map();

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
          xpEarned: player.xpEarned,
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

  async createUser(username: string, passwordHash: string): Promise<UserRecord> {
    const existing = this.usernames.get(username.toLowerCase());
    if (existing) throw new Error('Username already exists');
    const user: UserRecord = {
      id: uuidv4(),
      username,
      passwordHash,
      createdAt: Date.now(),
      xp: 0,
      totalRaces: 0,
    };
    this.users.set(user.id, user);
    this.usernames.set(username.toLowerCase(), user);
    return user;
  }

  async getUserByUsername(username: string): Promise<UserRecord | null> {
    return this.usernames.get(username.toLowerCase()) || null;
  }

  async getUserById(id: string): Promise<UserRecord | null> {
    return this.users.get(id) || null;
  }

  async addXp(userId: string, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.xp += xp;
      user.totalRaces++;
    }
  }

  async getDashboard(userId: string): Promise<DashboardData | null> {
    const user = this.users.get(userId);
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
    const id = uuidv4().slice(0, 8);
    this.challenges.set(id, { id, challengerId, challengerName, wpm, accuracy, textId, createdAt: Date.now() });
    return id;
  }

  async getChallenge(id: string): Promise<ChallengeRecord | null> {
    return this.challenges.get(id) || null;
  }
}
