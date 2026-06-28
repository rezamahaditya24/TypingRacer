export interface Player {
  id: string;
  name: string;
  dino: DinoType;
  progress: number;
  wpm: number;
  accuracy: number;
  correctChars: number;
  totalKeystrokes: number;
  finished: boolean;
  finishedAt: number | null;
  connected: boolean;
  ready: boolean;
  isSpectator?: boolean;
}

export type DinoType = 't-rex' | 'triceratops' | 'raptor' | 'stegosaurus' | 'brontosaurus';

export type RoomStatus = 'waiting' | 'countdown' | 'racing' | 'finished';
export type Language = 'id' | 'en';

export interface Room {
  id: string;
  players: Map<string, Player>;
  hostId: string;
  status: RoomStatus;
  text: string;
  textId: string;
  startedAt: number | null;
  countdownEndsAt: number | null;
  language: Language;
  password?: string;
  isPublic?: boolean;
  spectators: Set<string>;
}

export interface ServerToClient {
  room_state: {
    players: Array<{
      id: string;
      name: string;
      dino: DinoType;
      progress: number;
      wpm: number;
      accuracy: number;
      finished: boolean;
      ready: boolean;
      isSpectator?: boolean;
    }>;
    text: string;
    hostId: string;
    status: RoomStatus;
    isPublic?: boolean;
  };
  player_ready: { id: string; ready: boolean };
  countdown: { secs: number };
  race_start: { startedAt: number; text: string };
  player_update: {
    id: string;
    progress: number;
    wpm: number;
    accuracy: number;
    finished: boolean;
  };
  race_end: {
    results: Array<{
      id: string;
      name: string;
      dino: DinoType;
      rank: number;
      wpm: number;
      accuracy: number;
      timeMs: number;
      xpEarned?: number;
    }>;
    xpEarned?: number;
    level?: number;
    totalXp?: number;
  };
  error: { message: string };
  player_joined: {
    id: string;
    name: string;
    dino: DinoType;
    isSpectator?: boolean;
  };
  player_left: {
    id: string;
  };
  online_count: { count: number };
  auth_ok: { userId: string; username: string };
  public_rooms: {
    rooms: Array<{
      id: string;
      playerCount: number;
      maxPlayers: number;
      hostName: string;
      language: Language;
    }>;
  };
  spectator_update: {
    players: Array<{
      id: string; name: string; dino: DinoType;
      progress: number; wpm: number; accuracy: number; finished: boolean;
    }>;
    text: string;
    startedAt: number;
  };
}

export interface ClientToServer {
  join_room: { roomId: string; name: string; dino: DinoType; language?: Language; password?: string; asSpectator?: boolean };
  progress: { charIndex: number };
  finish: {};
  start_race: {};
  ready: {};
  get_public_rooms: {};
}
