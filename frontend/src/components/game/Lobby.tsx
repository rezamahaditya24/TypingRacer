'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerState } from '@/lib/types';
import { DINO_LIST, DINO_COLORS } from '@/lib/constants';

const DINO_EMOJI: Record<string, string> = {
  't-rex': '🦖', 'triceratops': '🦕', 'raptor': '🦖',
  'stegosaurus': '🦕', 'brontosaurus': '🦕',
};

export default function Lobby({ players, roomId, playerId, hostId, isHost, ws, onStartRace, onLeave }: {
  players: PlayerState[]; roomId: string | null;
  playerId: string | null; hostId: string | null;
  isHost: boolean; ws: { send: (type: string, payload?: Record<string, unknown>) => void };
  onStartRace: () => void; onLeave: () => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <motion.div className="flex-1 flex flex-col items-center justify-center p-4 gap-6"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Room code display */}
      {roomId && (
        <div className="text-center">
          <div className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>KODE ROOM</div>
          <button
            onClick={() => navigator.clipboard.writeText(roomId).then(() => setCopied(true))}
            className="font-mono text-2xl font-bold px-6 py-3 rounded-xl tracking-widest"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)', border: '.5px solid var(--border-color)' }}
          >
            {roomId}
          </button>
          <div className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>
            {copied ? '✓ Tersalin!' : 'Klik untuk salin kode room'}
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
            {players.length}/5 pemain
          </div>
        </div>
      )}

      {/* Player cards */}
      <div className="flex flex-col gap-2 w-full max-w-sm">
        {players.map(p => {
          const isSelf = p.id === playerId;
          const isHostPlayer = p.id === hostId;

          return (
            <motion.div
              key={p.id}
              layout
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: isSelf ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: isSelf ? '1px solid var(--accent)' : '.5px solid var(--border-color)' }}
            >
              {/* Dino with idle bob */}
              <motion.span
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                style={{ fontSize: 22 }}
              >
                {DINO_EMOJI[p.dino]}
              </motion.span>

              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {p.name} {isHostPlayer && '👑'}
                </div>
              </div>

              {/* Ready indicator */}
              <motion.div
                animate={p.ready ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={p.ready
                  ? { background: 'rgba(74,222,128,.15)', color: 'var(--correct)' }
                  : { background: 'var(--bg-secondary)', color: 'var(--text-muted)' }
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
        <motion.button onClick={onStartRace} disabled={players.length < 1}
          className="w-full max-w-sm py-4 rounded-xl font-bold font-sans text-lg transition-transform disabled:opacity-50"
          style={{ background: 'var(--accent)', color: '#0d1117' }}
          whileHover={players.length >= 1 ? { scale: 1.03 } : {}}
          whileTap={players.length >= 1 ? { scale: 0.97 } : {}}>
          🏁 Mulai Balapan!
        </motion.button>
      ) : (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <button onClick={() => ws.send('ready', {})}
            className="w-full py-3 rounded-xl font-bold font-sans transition-transform hover:scale-105"
            style={{
              background: players.find(p => p.id === playerId)?.ready ? 'var(--correct)' : 'var(--bg-tertiary)',
              color: players.find(p => p.id === playerId)?.ready ? '#0d1117' : 'var(--text-primary)',
              border: '.5px solid var(--border-color)',
            }}>
            {players.find(p => p.id === playerId)?.ready ? '✅ Siap!' : 'Klik untuk Siap'}
          </button>
          <p className="text-sm font-sans" style={{ color: 'var(--text-muted)' }}>Menunggu host memulai balapan...</p>
        </div>
      )}

      <button onClick={onLeave} className="text-sm font-sans underline text-center" style={{ color: 'var(--text-muted)' }}>Keluar Room</button>
    </motion.div>
  );
}
