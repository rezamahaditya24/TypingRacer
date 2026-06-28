'use client';

import { PlayerState, DinoType } from '@/lib/types';
import { DINO_LIST } from '@/lib/constants';

export default function PlayerCard({ player, isSelf, isHost }: {
  player: PlayerState;
  isSelf: boolean;
  isHost: boolean;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg"
      style={{
        background: isSelf ? 'var(--surface)' : 'transparent',
        border: isSelf ? '1px solid var(--teal)' : '1px solid transparent',
      }}>
      <span className="text-2xl">{DINO_LIST.find(d => d.type === player.dino)?.emoji}</span>
      <span className="flex-1 font-bold font-sans">{player.name}</span>
      {player.ready && (
        <span className="text-xs font-bold" style={{ color: 'var(--success)' }}>✅ Siap</span>
      )}
      {isHost && (
        <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: 'var(--amber)', color: '#0E1116' }}>
          👑 Host
        </span>
      )}
    </div>
  );
}
