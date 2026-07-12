'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerState } from '@/lib/types';
import { DINO_COLORS } from '@/lib/constants';
import { DinoSVG, CrownIcon } from '@/lib/assets';

function JungleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 200" preserveAspectRatio="xMidYMax slice" style={{ height: '40%' }}>
        <defs>
          <linearGradient id="jungle-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f1923" stopOpacity="0" />
            <stop offset="100%" stopColor="#0a1420" stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d="M0 100 Q180 40 360 80 Q540 20 720 60 Q900 10 1080 50 Q1260 30 1440 70 L1440 200 L0 200Z" fill="url(#jungle-grad)" opacity="0.5" />
        <path d="M0 130 Q240 70 480 100 Q720 50 960 80 Q1200 60 1440 90 L1440 200 L0 200Z" fill="url(#jungle-grad)" opacity="0.3" />
        {[80, 200, 350, 500, 650, 800, 950, 1100, 1250, 1380].map((x, i) => (
          <g key={i} transform={`translate(${x}, 50)`} opacity={0.25}>
            <rect x="-3" y="25" width="6" height="35" rx="2" fill="#1a2d3d" />
            <ellipse cx="0" cy="12" rx="18" ry="22" fill="#1a2d3d" />
            <ellipse cx="0" cy="5" rx="12" ry="16" fill="#1a2d3d" />
          </g>
        ))}
      </svg>
      <div className="absolute bottom-0 w-full" style={{ height: '25%', background: 'linear-gradient(to top, rgba(10,20,32,0.95), transparent)' }} />
    </div>
  );
}

function DinoStandee({ dino, size = 36 }: { dino: string; size?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -4, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
    >
      <DinoSVG type={dino} size={size} />
    </motion.div>
  );
}

export default function Lobby({ players, roomId, playerId, hostId, isHost, ws, onStartRace, onLeave }: {
  players: PlayerState[]; roomId: string | null;
  playerId: string | null; hostId: string | null;
  isHost: boolean; ws: { send: (type: string, payload?: Record<string, unknown>) => void };
  onStartRace: () => void; onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const me = players.find(p => p.id === playerId);

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4">
      <JungleBackground />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-6 w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Decorative dino row */}
        <div className="flex gap-3 items-end">
          {players.slice(0, 3).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ transform: `scale(${1 - i * 0.08})` }}
            >
              <DinoStandee dino={p.dino} size={32 + (3 - i) * 4} />
            </motion.div>
          ))}
        </div>

        {/* Room code */}
        {roomId && (
          <motion.div
            className="text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring' }}
          >
            <div className="text-[10px] font-display font-bold tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>KODE ROOM</div>
            <button
              onClick={() => navigator.clipboard.writeText(roomId).then(() => setCopied(true))}
              className="font-mono text-2xl sm:text-3xl font-bold px-6 py-3 rounded-2xl tracking-[0.3em] transition-all hover:scale-105"
              style={{
                background: 'var(--bg-tertiary)',
                border: '2px solid var(--accent)',
                color: 'var(--accent)',
                boxShadow: 'var(--glow-green)',
              }}
            >
              {roomId}
            </button>
            <div className="text-[10px] mt-2 font-sans font-medium" style={{ color: copied ? 'var(--accent)' : 'var(--text-muted)' }}>
              {copied ? '✓ Tersalin!' : 'Klik untuk salin'}
            </div>
            <div className="text-xs mt-1 font-sans" style={{ color: 'var(--text-muted)' }}>
              {players.length}/5 pemain
            </div>
          </motion.div>
        )}

        {/* Player cards */}
        <div className="flex flex-col gap-2 w-full">
          {players.map((p, i) => {
            const isSelf = p.id === playerId;
            const isHostPlayer = p.id === hostId;
            const dinoColor = DINO_COLORS[p.dino] || 'var(--accent)';

            return (
              <motion.div
                key={p.id}
                layout
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: isSelf ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                  border: isSelf ? `2px solid ${dinoColor}` : '1px solid var(--border-color)',
                  boxShadow: isSelf ? `0 0 15px ${dinoColor}22` : 'none',
                }}
              >
                {/* Dino avatar */}
                <DinoStandee dino={p.dino} size={32} />

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold font-sans flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                    {p.name}
                    {isHostPlayer && (
                      <CrownIcon size={14} />
                    )}
                  </div>
                </div>

                {/* Ready indicator */}
                <motion.div
                  animate={p.ready ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="text-[11px] font-bold font-sans px-3 py-1 rounded-full"
                  style={p.ready
                    ? { background: 'rgba(74,222,128,.15)', color: 'var(--correct)', border: '1px solid rgba(74,222,128,.3)' }
                    : { background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }
                  }
                >
                  {p.ready ? '✓ Siap' : '⏳ Menunggu'}
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Action buttons */}
        {isHost ? (
          <motion.button
            onClick={onStartRace}
            disabled={players.length < 1}
            className="w-full py-4 rounded-2xl font-bold font-display text-lg transition-all btn-primary disabled:opacity-30"
            whileHover={players.length >= 1 ? { scale: 1.03 } : {}}
            whileTap={players.length >= 1 ? { scale: 0.97 } : {}}
          >
            Mulai Balapan!
          </motion.button>
        ) : (
          <div className="flex flex-col items-center gap-3 w-full">
            <motion.button
              onClick={() => ws.send('ready', {})}
              className="w-full py-3 rounded-2xl font-bold font-display text-base transition-all"
              style={me?.ready
                ? { background: 'var(--accent)', color: '#0f1923', boxShadow: 'var(--glow-green)', border: 'none' }
                : { background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '2px solid var(--border-color)' }
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {me?.ready ? '✅ Siap!' : 'Klik untuk Siap'}
            </motion.button>
            <p className="text-sm font-sans" style={{ color: 'var(--text-muted)' }}>Menunggu host memulai balapan...</p>
          </div>
        )}

        <button onClick={onLeave} className="text-sm font-sans font-medium underline text-center" style={{ color: 'var(--text-muted)' }}>
          Keluar Room
        </button>
      </motion.div>
    </div>
  );
}
