'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DinoType } from '@/lib/types';
import { DINO_LIST, DINO_COLORS } from '@/lib/constants';
import { getMotivationalQuote } from '@/lib/quotes';

export default function LandingView({ name, setName, selectedDino, setSelectedDino, language, setLanguage, joinCode, setJoinCode, onCreateRoom, onJoinRoom, onOpenLeaderboard, onPractice, onOpenDashboard, onOpenPublicRooms, error, onlineCount, user }: {
  name: string; setName: (v: string) => void;
  selectedDino: DinoType; setSelectedDino: (v: DinoType) => void;
  language: string; setLanguage: (v: 'id' | 'en') => void;
  joinCode: string; setJoinCode: (v: string) => void;
  onCreateRoom: () => void; onJoinRoom: () => void;
  onOpenLeaderboard: () => void; onPractice: () => void;
  onOpenDashboard?: () => void;
  onOpenPublicRooms?: () => void;
  error: string | null;
  onlineCount: number;
  user: { id: string; username: string } | null;
}) {
  const [quote, setQuote] = useState('');
  const lang = language as 'id' | 'en';

  useEffect(() => {
    setQuote(getMotivationalQuote(lang));
    const interval = setInterval(() => setQuote(getMotivationalQuote(lang)), 8000);
    return () => clearInterval(interval);
  }, [lang]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
      {/* Live player count badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full mb-4"
        style={{ background: 'var(--bg-tertiary)', border: '.5px solid var(--border-color)', color: 'var(--text-muted)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: 'var(--correct)' }} />
        {onlineCount} pemain sedang daring
      </motion.div>

      {/* Main title */}
      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-5xl font-bold tracking-tight mb-2"
        style={{ color: 'var(--text-primary)' }}
      >
        🦕 Dino <span style={{ color: 'var(--accent)' }}>Dash</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xs mb-2"
        style={{ color: 'var(--text-muted)' }}
      >
        Balapan mengetik multiplayer · Tantang teman dengan kode room
      </motion.p>

      {/* Dynamic motivational quote */}
      <motion.div
        key={quote}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs mb-6 italic px-4 py-2 rounded-lg"
        style={{ color: 'var(--text-muted)', background: 'var(--bg-tertiary)' }}
      >
        &ldquo;{quote}&rdquo;
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex gap-3 flex-wrap justify-center"
      >
        <button onClick={onCreateRoom}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ background: 'var(--accent)', color: '#0d1117' }}>
          🏁 Buat Room
        </button>

        <button onClick={onOpenPublicRooms}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '.5px solid var(--border-color)' }}>
          🌐 Room Publik
        </button>

        <button onClick={onPractice}
          className="px-6 py-3 rounded-lg text-sm font-medium"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '.5px solid var(--border-color)' }}>
          🎯 Latihan
        </button>
      </motion.div>

      {/* Secondary buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 mt-3"
      >
        <button onClick={onOpenLeaderboard}
          className="px-4 py-2 rounded-lg text-xs font-medium"
          style={{ color: 'var(--text-muted)', border: '.5px solid var(--border-color)', background: 'transparent' }}>
          🏆 Papan Skor
        </button>
        {user && (
          <button onClick={onOpenDashboard}
            className="px-4 py-2 rounded-lg text-xs font-medium"
            style={{ color: 'var(--teal)', border: '.5px solid var(--border-color)', background: 'transparent' }}>
            📊 Dashboard
          </button>
        )}
      </motion.div>

      {/* Join / Name / Dino section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm mt-6 p-4 rounded-xl"
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

        <div className="mb-3">
          <label className="text-[10px] font-sans font-bold" style={{ color: 'var(--text-muted)' }}>BAHASA</label>
          <div className="flex gap-2 mt-1">
            <button onClick={() => setLanguage('id')}
              className="flex-1 p-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: language === 'id' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: language === 'id' ? '#0d1117' : 'var(--text-primary)',
                border: language === 'id' ? 'none' : '.5px solid var(--border-color)' }}>
              🇮🇩 Indonesia
            </button>
            <button onClick={() => setLanguage('en')}
              className="flex-1 p-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: language === 'en' ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: language === 'en' ? '#0d1117' : 'var(--text-primary)',
                border: language === 'en' ? 'none' : '.5px solid var(--border-color)' }}>
              🇬🇧 English
            </button>
          </div>
        </div>

        <div className="flex gap-2">
          <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 p-2 rounded-lg font-mono text-base text-center uppercase tracking-widest focus:outline-none"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            maxLength={6} placeholder="KODE ROOM" />
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
