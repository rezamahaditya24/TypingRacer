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
    }>;
    text: string;
    hostId: string;
    status: RoomStatus;
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
    }>;
  };
  error: { message: string };
  player_joined: {
    id: string;
    name: string;
    dino: DinoType;
  };
  player_left: {
    id: string;
  };
  online_count: { count: number };
  auth_ok: { userId: string; username: string };
}

export interface ClientToServer {
  join_room: { roomId: string; name: string; dino: DinoType; language?: Language };
  progress: { charIndex: number };
  finish: {};
  start_race: {};
  ready: {};
}
