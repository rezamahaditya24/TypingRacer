export type DinoType = 't-rex' | 'triceratops' | 'raptor' | 'stegosaurus' | 'brontosaurus';

export type RoomStatus = 'waiting' | 'countdown' | 'racing' | 'finished';

export interface PlayerState {
  id: string;
  name: string;
  dino: DinoType;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  ready: boolean;
}

export interface RoomState {
  players: PlayerState[];
  text: string;
  hostId: string;
  status: RoomStatus;
}

export interface RaceResult {
  id: string;
  name: string;
  dino: DinoType;
  rank: number;
  wpm: number;
  accuracy: number;
  timeMs: number;
}

export interface ServerMessage {
  type: string;
  payload: Record<string, unknown>;
}
