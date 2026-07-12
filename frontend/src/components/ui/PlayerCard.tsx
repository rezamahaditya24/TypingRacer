'use client';

import { motion } from 'framer-motion';
import { PlayerState } from '@/lib/types';
import { DINO_COLORS } from '@/lib/constants';
import { DinoSVG, CrownIcon } from '@/lib/assets';

export default function PlayerCard({ player, isSelf, isHost }: {
  player: PlayerState;
  isSelf: boolean;
  isHost: boolean;
}) {
  const dinoColor = DINO_COLORS[player.dino] || 'var(--accent)';

  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        background: isSelf ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
        border: isSelf ? `2px solid ${dinoColor}` : '1px solid var(--border-color)',
        boxShadow: isSelf ? `0 0 15px ${dinoColor}22` : 'none',
      }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <DinoSVG type={player.dino} size={32} />
      <span className="flex-1 font-bold font-sans text-sm" style={{ color: 'var(--text-primary)' }}>
        {player.name}
        {isHost && <CrownIcon size={12} className="inline-block ml-1" />}
      </span>
      {player.ready && (
        <span className="text-[11px] font-bold font-sans px-3 py-1 rounded-full" style={{ background: 'rgba(74,222,128,.15)', color: 'var(--correct)', border: '1px solid rgba(74,222,128,.3)' }}>
          ✓ Siap
        </span>
      )}
      {isHost && !player.ready && (
        <span className="text-[11px] font-bold font-sans px-3 py-1 rounded-full" style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,.2)' }}>
          👑 Host
        </span>
      )}
    </motion.div>
  );
}
