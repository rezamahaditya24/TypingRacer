'use client';

import { motion } from 'framer-motion';
import { DinoType } from '@/lib/types';
import { DINO_LIST, DINO_COLORS } from '@/lib/constants';

export default function LandingView({ name, setName, selectedDino, setSelectedDino, joinCode, setJoinCode, onCreateRoom, onJoinRoom, onOpenLeaderboard, onPractice, error }: {
  name: string; setName: (v: string) => void;
  selectedDino: DinoType; setSelectedDino: (v: DinoType) => void;
  joinCode: string; setJoinCode: (v: string) => void;
  onCreateRoom: () => void; onJoinRoom: () => void;
  onOpenLeaderboard: () => void; onPractice: () => void;
  error: string | null;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
      {/* Live player count badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full mb-6"
        style={{ background: 'var(--bg-tertiary)', border: '.5px solid var(--border-color)', color: 'var(--text-muted)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--correct)' }} />
        247 pemain sedang balapan
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-5xl font-bold tracking-tight mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        🦕 Dino <span style={{ color: 'var(--accent)' }}>Dash</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-sm mb-8"
        style={{ color: 'var(--text-muted)' }}
      >
        Balapan mengetik multiplayer · Tantang teman dengan kode room
      </motion.p>

      {/* Live typing preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-lg rounded-xl p-4 mb-8 text-left font-mono text-sm leading-7"
        style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}
      >
        <span style={{ color: 'var(--correct)' }}>Hidup adalah tentang belajar </span>
        <span style={{ color: 'var(--wrong)', background: 'var(--wrong-bg)', borderRadius: 2, padding: '0 2px' }}>da</span>
        <span style={{ color: 'var(--accent)', borderLeft: '2px solid var(--accent)', paddingLeft: 2 }}>r</span>
        <span style={{ color: 'var(--text-muted)' }}>i setiap kesalahan...</span>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <button onClick={onCreateRoom}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#0d1117' }}>
          🏁 Mulai Balapan
        </button>

        <button onClick={onPractice}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '.5px solid var(--border-color)' }}>
          🎯 Mode Latihan
        </button>

        <button onClick={onOpenLeaderboard}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ color: 'var(--text-muted)', border: '.5px solid var(--border-color)', background: 'transparent' }}>
          🏆 Papan Skor
        </button>
      </motion.div>

      {/* Join / Name section as collapsible card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm mt-8 p-4 rounded-xl"
        style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}
      >
        <div className="mb-3">
          <label className="text-[10px] font-sans font-bold" style={{ color: 'var(--text-muted)' }}>NAMA</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full mt-1 p-2 rounded-lg font-sans text-sm focus:outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            maxLength={20} placeholder="Nama kamu" />
        </div>

        <div className="mb-3">
          <label className="text-[10px] font-sans font-bold" style={{ color: 'var(--text-muted)' }}>PILIH DINO</label>
          <div className="flex gap-1 mt-1">
            {DINO_LIST.map(d => (
              <button key={d.type} onClick={() => setSelectedDino(d.type)}
                className="flex-1 p-1.5 rounded-lg text-center transition-all hover:scale-105"
                style={{ background: selectedDino === d.type ? DINO_COLORS[d.type] + '33' : 'var(--bg-tertiary)',
                  border: selectedDino === d.type ? `2px solid ${DINO_COLORS[d.type]}` : '1px solid transparent' }}>
                <div className="text-lg">{d.emoji}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 p-2 rounded-lg font-mono text-base text-center uppercase tracking-widest focus:outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            maxLength={6} placeholder="KODE" />
          <button onClick={onJoinRoom} disabled={joinCode.length < 4}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-transform hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0d1117' }}>
            Gabung
          </button>
        </div>
      </motion.div>

      {error && (
        <div className="mt-4 p-3 rounded-lg text-sm font-sans" style={{ background: 'var(--wrong-bg)', color: 'var(--wrong)', border: '1px solid var(--wrong)' }}>
          {error}
        </div>
      )}
    </div>
  );
}
