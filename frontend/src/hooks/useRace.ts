'use client';

import { useState, useCallback } from 'react';
import { PlayerState, RaceResult, DinoType, RoomStatus } from '@/lib/types';

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

export function useRace() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerState[]>([]);
  const [text, setText] = useState('');
  const [hostId, setHostId] = useState<string | null>(null);
  const [status, setStatus] = useState<RoomStatus>('waiting');
  const [countdownSec, setCountdownSec] = useState<number | null>(null);
  const [results, setResults] = useState<RaceResult[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerHistory, setPlayerHistory] = useState<PlayerHistoryEntry[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  const handleMessage = useCallback((data: { type: string; payload: Record<string, unknown> }) => {
    const { type, payload } = data;

    switch (type) {
      case 'room_joined': {
        setRoomId(payload.roomId as string);
        setPlayerId(payload.playerId as string || null);
        break;
      }
      case 'room_state': {
        const state = payload as { players: PlayerState[]; text: string; hostId: string; status: RoomStatus };
        setPlayers(state.players.map(p => ({ ...p, ready: (p as any).ready || false })));
        setText(state.text);
        setHostId(state.hostId);
        setStatus(state.status);
        break;
      }
      case 'player_joined': {
        setPlayers(prev => [...prev, {
          id: payload.id as string,
          name: payload.name as string,
          dino: payload.dino as DinoType,
          progress: 0, wpm: 0, accuracy: 100, finished: false, ready: false,
        }]);
        break;
      }
      case 'player_left': {
        setPlayers(prev => prev.filter(p => p.id !== (payload.id as string)));
        break;
      }
      case 'player_ready': {
        setPlayers(prev => prev.map(p =>
          p.id === (payload.id as string) ? { ...p, ready: payload.ready as boolean } : p
        ));
        break;
      }
      case 'countdown': {
        setCountdownSec(payload.secs as number);
        setStatus('countdown');
        break;
      }
      case 'race_start': {
        setStartedAt(payload.startedAt as number);
        setText(payload.text as string);
        setStatus('racing');
        setCountdownSec(null);
        break;
      }
      case 'player_update': {
        const u = payload as { id: string; progress: number; wpm: number; accuracy: number; finished: boolean };
        setPlayers(prev => prev.map(p =>
          p.id === u.id ? { ...p, progress: u.progress, wpm: u.wpm, accuracy: u.accuracy, finished: u.finished } : p
        ));
        break;
      }
      case 'race_end': {
        setResults(payload.results as RaceResult[]);
        setStatus('finished');
        break;
      }
      case 'leaderboard': {
        setLeaderboard(payload.entries as LeaderboardEntry[]);
        break;
      }
      case 'player_history': {
        setPlayerHistory(payload.history as PlayerHistoryEntry[]);
        break;
      }
      case 'online_count': {
        setOnlineCount(payload.count as number);
        break;
      }
      case 'error': {
        setError(payload.message as string);
        break;
      }
    }
  }, []);

  const reset = useCallback(() => {
    setRoomId(null);
    setPlayerId(null);
    setPlayers([]);
    setText('');
    setHostId(null);
    setStatus('waiting');
    setCountdownSec(null);
    setResults([]);
    setStartedAt(null);
    setError(null);
    setLeaderboard([]);
    setPlayerHistory([]);
    setOnlineCount(0);
  }, []);

  return {
    roomId, playerId, players, text, hostId, status,
    countdownSec, results, startedAt, error,
    leaderboard, playerHistory, onlineCount,
    setError, handleMessage, reset,
  };
}
