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

export interface Room {
  id: string;
  players: Map<string, Player>;
  hostId: string;
  status: RoomStatus;
  text: string;
  textId: string;
  startedAt: number | null;
  countdownEndsAt: number | null;
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
}

export interface ClientToServer {
  join_room: { roomId: string; name: string; dino: DinoType };
  progress: { charIndex: number };
  finish: {};
  start_race: {};
  ready: {};
}
