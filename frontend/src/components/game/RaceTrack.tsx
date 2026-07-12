'use client';

import { motion } from 'framer-motion';
import { PlayerState, DinoType } from '@/lib/types';
import { DINO_COLORS } from '@/lib/constants';
import { DinoSVG, CheckeredFlagIcon } from '@/lib/assets';

function FinishFlag() {
  return (
    <div className="flex flex-col items-center" style={{ gap: 1 }}>
      <motion.div
        animate={{ rotate: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      >
        <CheckeredFlagIcon size={22} />
      </motion.div>
      <span className="text-[6px] font-bold font-mono" style={{ color: 'var(--text-muted)' }}>FINISH</span>
    </div>
  );
}

function Lane({ player, isSelf, textLength, ghostTimestamps, raceStartTime }: {
  player: PlayerState;
  isSelf: boolean;
  textLength: number;
  ghostTimestamps?: { charIndex: number; timeMs: number }[];
  raceStartTime?: number;
}) {
  const pct = textLength > 0 ? Math.min((player.progress / textLength) * 100, 100) : 0;
  const dinoColor = DINO_COLORS[player.dino] || 'var(--accent)';

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
    <div
      className="relative overflow-hidden rounded-xl my-1.5"
      style={{
        height: 52,
        background: `linear-gradient(180deg, var(--track-lane) 0%, var(--track-road) 50%, var(--track-lane) 100%)`,
        border: '1px solid',
        borderColor: isSelf ? `${dinoColor}44` : 'var(--border-color)',
      }}
    >
      {/* Lane divider lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none px-3">
        <div style={{ height: 1, background: 'var(--track-dash)', opacity: 0.3 }} />
        <div style={{ height: 1, background: 'var(--track-dash)', opacity: 0.3 }} />
        <div style={{ height: 1, background: 'var(--track-dash)', opacity: 0.3 }} />
      </div>

      {/* Animated road dashes */}
      <div className="absolute inset-0 flex items-center pointer-events-none" style={{ top: '50%', height: 2 }}>
        <div style={{
          display: 'flex', width: 'calc(100% + 40px)',
          animation: 'road-scroll 0.4s linear infinite',
          marginLeft: '-40px',
        }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              width: 16, height: 2, flexShrink: 0, marginRight: 20,
              background: 'var(--track-dash)',
              borderRadius: 1,
              opacity: 0.5 + Math.sin(i * 0.5) * 0.3,
            }} />
          ))}
        </div>
      </div>

      {/* Speed trail */}
      {isSelf && pct > 0 && (
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center gap-[2px] pointer-events-none"
          style={{ left: `calc(${pct}% - 44px)`, transition: 'left 0.3s ease-out' }}>
          {[20, 12, 6].map((w, i) => (
            <div key={i} style={{
              width: w, height: 8 + i * 2,
              borderRadius: 4,
              background: `var(--speed-trail-${i + 1})`,
            }} />
          ))}
        </div>
      )}

      {/* Ghost */}
      {ghostPct !== null && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 z-10 pointer-events-none select-none"
          animate={{ left: `${Math.min(Math.max(ghostPct, 1), 85)}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <span className="text-sm" style={{ opacity: 0.35 }}>👻</span>
        </motion.div>
      )}

      {/* Dino car */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-10"
        animate={{
          left: `${Math.min(Math.max(pct, 1), 85)}%`,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
        style={{ marginTop: -2 }}
      >
        <motion.div
          animate={pct > 0 && pct < 100 ? {
            y: [0, -3, 0],
            rotate: [0, -1, 0],
          } : {}}
          transition={{ repeat: Infinity, duration: 0.3 + (1 / Math.max(pct, 1)) * 0.5, ease: 'easeInOut' }}
        >
          <DinoSVG type={player.dino} size={36} />
        </motion.div>
      </motion.div>

      {/* Player label */}
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex items-center gap-1"
      >
        <span
          className="text-[9px] font-bold font-sans leading-none"
          style={{ color: isSelf ? dinoColor : 'var(--text-muted)' }}
        >
          {player.name.length > 10 ? player.name.slice(0, 8) + '..' : player.name}
        </span>
      </div>

      {/* WPM badge */}
      <div
        className="absolute left-2 bottom-1 z-20 pointer-events-none"
      >
        {player.wpm > 0 && (
          <span
            className="text-[8px] font-bold font-mono leading-none"
            style={{ color: 'var(--text-muted)' }}
          >
            {player.wpm} wpm
          </span>
        )}
      </div>

      {/* Finish line */}
      <div className="absolute right-0 top-0 bottom-0 flex items-stretch" style={{ width: 26 }}>
        <div className="flex flex-col items-center justify-center w-full" style={{ gap: 1 }}>
          <FinishFlag />
        </div>
        <div style={{
          width: 3,
          background: 'repeating-linear-gradient(0deg, var(--finish-check-1) 0, var(--finish-check-1) 4px, var(--finish-check-2) 4px, var(--finish-check-2) 8px)',
        }} />
      </div>
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
        <span className="text-[9px] font-bold font-display tracking-wider" style={{ color: 'var(--text-muted)' }}>
          RACE TRACK
        </span>
        <span className="text-[9px] font-bold font-display tracking-wider" style={{ color: 'var(--text-muted)' }}>
          FINISH
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
        <div className="flex items-center justify-center rounded-xl" style={{ height: 52, background: 'var(--track-road)', border: '1px solid var(--border-color)' }}>
          <span className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>Menunggu pemain...</span>
        </div>
      )}
    </div>
  );
}
