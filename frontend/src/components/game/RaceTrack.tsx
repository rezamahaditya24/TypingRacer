'use client';

import { motion } from 'framer-motion';
import { PlayerState, DinoType } from '@/lib/types';
import { DINO_COLORS } from '@/lib/constants';

const DINO_EMOJI: Record<DinoType, string> = {
  't-rex': '🦖', 'triceratops': '🦕', 'raptor': '🦖',
  'stegosaurus': '🦕', 'brontosaurus': '🦕',
};

function Lane({ player, isSelf, textLength, ghostTimestamps, raceStartTime }: {
  player: PlayerState;
  isSelf: boolean;
  textLength: number;
  ghostTimestamps?: { charIndex: number; timeMs: number }[];
  raceStartTime?: number;
}) {
  const pct = textLength > 0 ? Math.min((player.progress / textLength) * 100, 100) : 0;

  const ghostPct = (() => {
    if (!ghostTimestamps || !raceStartTime || ghostTimestamps.length === 0) return null;
    const elapsed = Date.now() - raceStartTime;
    let lastValid = 0;
    for (const t of ghostTimestamps) {
      if (t.timeMs <= elapsed) lastValid = t.charIndex;
      else break;
    }
    return textLength > 0 ? Math.min((lastValid / textLength) * 100, 100) : 0;
  })();

  return (
    <div className="relative overflow-hidden rounded-lg my-1" style={{ height: 38, background: 'var(--track-road)' }}>
      {/* Animated road dashes */}
      <div className="absolute inset-0 flex items-center pointer-events-none" style={{ top: '50%', height: 1 }}>
        <div style={{
          display: 'flex', width: 'calc(100% + 40px)',
          animation: 'road-scroll 0.45s linear infinite',
          marginLeft: '-40px',
        }}>
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} style={{
              width: 18, height: 1, flexShrink: 0, marginRight: 22,
              background: 'var(--track-dash)',
            }} />
          ))}
        </div>
      </div>

      {/* Ghost car */}
      {ghostPct !== null && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 text-sm select-none z-10 pointer-events-none"
          animate={{ left: `${Math.min(Math.max(ghostPct, 2), 90)}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{ opacity: 0.4 }}
        >
          👻
        </motion.div>
      )}

      {/* Speed trail (local player only) */}
      {isSelf && pct > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-[3px] pointer-events-none"
          style={{ left: `calc(${pct}% - 52px)`, transition: 'left 0.3s ease-out' }}>
          <div style={{ width: 28, height: 10, borderRadius: 3, background: 'var(--speed-trail-1)' }} />
          <div style={{ width: 17, height: 10, borderRadius: 3, background: 'var(--speed-trail-2)' }} />
          <div style={{ width: 9, height: 10, borderRadius: 3, background: 'var(--speed-trail-3)' }} />
        </div>
      )}

      {/* Dino car */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 text-lg select-none z-10"
        animate={{ left: `${Math.min(Math.max(pct, 2), 90)}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{ fontSize: 20 }}
      >
        {DINO_EMOJI[player.dino]}
      </motion.div>

      {/* Player name */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] z-20"
        style={{ color: isSelf ? 'var(--accent)' : 'var(--text-muted)', pointerEvents: 'none', fontWeight: isSelf ? 600 : 400 }}>
        {player.name}
      </span>

      {/* WPM */}
      <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[9px] z-20 font-mono"
        style={{ color: isSelf ? 'var(--accent)' : 'var(--text-muted)' }}>
        {player.wpm > 0 ? `${player.wpm}` : ''}
      </span>

      {/* Finish line */}
      <div className="absolute right-2 top-0 bottom-0"
        style={{ width: 2, background: 'rgba(255,255,255,0.22)', borderRadius: 1 }} />
    </div>
  );
}

export default function RaceTrack({ players, textLength, myPlayerId, ghostTimestamps, raceStartTime }: {
  players: PlayerState[];
  textLength: number;
  myPlayerId: string | null;
  ghostTimestamps?: { charIndex: number; timeMs: number }[];
  raceStartTime?: number;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2 px-1">
        <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '.07em' }}>
          RACE TRACK
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>
          FINISH 🏁
        </span>
      </div>

      {players.map(p => (
        <Lane
          key={p.id}
          player={p}
          isSelf={p.id === myPlayerId}
          textLength={textLength}
          ghostTimestamps={ghostTimestamps}
          raceStartTime={raceStartTime}
        />
      ))}

      {players.length === 0 && (
        <div className="flex items-center justify-center" style={{ height: 38, background: 'var(--track-road)', borderRadius: 8 }}>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Menunggu pemain...</span>
        </div>
      )}
    </div>
  );
}
