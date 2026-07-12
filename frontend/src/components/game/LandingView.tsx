'use client';

import { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DinoType } from '@/lib/types';
import { DINO_LIST, DINO_COLORS } from '@/lib/constants';
import { getMotivationalQuote } from '@/lib/quotes';
import { DinoSVG, TrophyIcon, CrownIcon } from '@/lib/assets';

function BackgroundScene() {
  const seed = useId();
  const stars = Array.from({ length: 20 }).map((_, i) => {
    const h = ((i * 7 + seed.charCodeAt(0) || 1) % 100) / 100;
    return {
      w: 1 + h * 2,
      h: 1 + (1 - h) * 2,
      top: `${(i * 3.7 + seed.length * 2.3) % 40}%`,
      left: `${(i * 5.1 + seed.length * 1.7) % 100}%`,
      dur: 2 + h * 3,
      delay: (i * 1.3) % 2,
    };
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Stars */}
      {stars.map((s, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full"
          style={{
            width: s.w,
            height: s.h,
            background: 'rgba(255,255,255,0.3)',
            top: s.top,
            left: s.left,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
        />
      ))}
      {/* Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: 40,
          height: 40,
          top: '8%',
          right: '15%',
          background: 'radial-gradient(circle at 35% 35%, #fef3c7, #fbbf24)',
          boxShadow: '0 0 30px rgba(251,191,36,0.2)',
        }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Background hills/ground */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 180" preserveAspectRatio="xMidYMax slice" style={{ height: '35%' }}>
        <defs>
          <linearGradient id="hill-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0f1923" stopOpacity="0" />
            <stop offset="30%" stopColor="#0d1a26" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#0a1420" stopOpacity="0.9" />
          </linearGradient>
        </defs>
        <path d="M0 120 Q180 40 360 90 Q540 20 720 60 Q900 10 1080 50 Q1260 30 1440 80 L1440 180 L0 180Z" fill="url(#hill-grad)" opacity="0.6" />
        <path d="M0 140 Q240 70 480 110 Q720 40 960 90 Q1200 60 1440 100 L1440 180 L0 180Z" fill="url(#hill-grad)" opacity="0.4" />
        {/* Jungle trees silhouette */}
        {[100, 250, 400, 550, 700, 850, 1000, 1150, 1300].map((x, i) => (
          <g key={i} transform={`translate(${x}, 60)`} opacity={0.3}>
            <rect x="-2" y="20" width="4" height="30" rx="1" fill="#1a2d3d" />
            <ellipse cx="0" cy="10" rx="15" ry="20" fill="#1a2d3d" />
            <ellipse cx="0" cy="5" rx="10" ry="14" fill="#1a2d3d" />
          </g>
        ))}
      </svg>
      {/* Decorative bottom foliage */}
      <div className="absolute bottom-0 w-full" style={{ height: '30%', background: 'linear-gradient(to top, rgba(10,20,32,0.95), transparent)' }} />
    </div>
  );
}

function DinoSelector({ selected, onSelect }: { selected: DinoType; onSelect: (v: DinoType) => void }) {
  return (
    <div className="flex gap-2 justify-center">
      {DINO_LIST.map(d => {
        const isSelected = selected === d.type;
        return (
          <motion.button
            key={d.type}
            onClick={() => onSelect(d.type)}
            className="relative flex flex-col items-center gap-1 rounded-2xl p-2 cursor-pointer"
            style={{
              background: isSelected ? `${d.color}22` : 'var(--bg-tertiary)',
              border: isSelected ? `3px solid ${d.color}` : '2px solid transparent',
              boxShadow: isSelected ? `0 0 20px ${d.color}44` : 'none',
              minWidth: 60,
            }}
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.95 }}
            animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <DinoSVG type={d.type} size={40} animated />
            <span
              className="text-[9px] font-bold font-display"
              style={{ color: isSelected ? d.color : 'var(--text-muted)' }}
            >
              {d.label}
            </span>
            {isSelected && (
              <motion.div
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: d.color }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default function LandingView({
  name, setName, selectedDino, setSelectedDino,
  language, setLanguage, joinCode, setJoinCode,
  onCreateRoom, onJoinRoom, onOpenLeaderboard,
  onPractice, onOpenDashboard, onOpenPublicRooms,
  error, onlineCount, user,
}: {
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
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 pb-8" style={{ minHeight: '90vh' }}>
      <BackgroundScene />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md gap-5">
        {/* Online count badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-full font-sans font-medium"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
        >
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
          {onlineCount} pemain daring
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 100 }}
          className="text-center"
        >
          <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
            <span style={{ color: 'var(--text-primary)' }}>Dino</span>{' '}
            <span style={{ color: 'var(--accent)' }}>Dash</span>
          </h1>
          <p className="text-xs sm:text-sm mt-2 font-sans font-medium" style={{ color: 'var(--text-secondary)' }}>
            Balapan mengetik multiplayer seru
          </p>
        </motion.div>

        {/* Quote bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quote}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative px-5 py-3 rounded-2xl text-xs font-sans italic leading-relaxed text-center max-w-xs"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--card-shadow)',
            }}
          >
            <span className="text-lg leading-none absolute -top-2 left-3" style={{ color: 'var(--accent)' }}>&ldquo;</span>
            {quote}
            <span className="text-lg leading-none absolute -bottom-3 right-3" style={{ color: 'var(--accent)' }}>&rdquo;</span>
            {/* Triangle pointer */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
              style={{ background: 'var(--bg-tertiary)', borderRight: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}
            />
          </motion.div>
        </AnimatePresence>

        {/* CTA Buttons - main row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 w-full"
        >
          <button onClick={onPractice} className="flex-1 py-3 rounded-2xl text-sm font-bold font-display btn-primary">
            Latihan
          </button>
          <button onClick={onCreateRoom} className="flex-1 py-3 rounded-2xl text-sm font-bold font-display btn-accent">
            Buat Room
          </button>
          <button onClick={onOpenPublicRooms} className="flex-1 py-3 rounded-2xl text-sm font-bold font-display btn-secondary">
            Publik
          </button>
        </motion.div>

        {/* Secondary button row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 w-full"
        >
          <button onClick={onOpenLeaderboard} className="flex-1 py-2 rounded-2xl text-xs font-bold font-display btn-secondary">
            <TrophyIcon size={16} className="inline-block align-text-top mr-1" />
            Papan Skor
          </button>
          {user && (
            <button onClick={onOpenDashboard} className="flex-1 py-2 rounded-2xl text-xs font-bold font-display btn-secondary">
              Dashboard
            </button>
          )}
        </motion.div>

        {/* Join / Name / Dino section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full rounded-3xl p-5 space-y-4"
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          {/* Name input */}
          <div>
            <label className="text-[10px] font-display font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>NAMA</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full mt-1.5 px-4 py-2.5 rounded-2xl font-sans text-sm focus:outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)',
              }}
              maxLength={20}
              placeholder="Nama kamu"
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
          </div>

          {/* Dino selector */}
          <div>
            <label className="text-[10px] font-display font-bold tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>PILIH DINO</label>
            <DinoSelector selected={selectedDino} onSelect={setSelectedDino} />
          </div>

          {/* Language toggle */}
          <div className="flex gap-2">
            {(['id', 'en'] as const).map(l => (
              <button key={l} onClick={() => setLanguage(l)}
                className="flex-1 py-2.5 rounded-2xl text-sm font-bold font-display transition-all"
                style={{
                  background: language === l ? 'var(--accent)' : 'var(--bg-tertiary)',
                  color: language === l ? '#0f1923' : 'var(--text-secondary)',
                  border: language === l ? 'none' : '2px solid var(--border-color)',
                  boxShadow: language === l ? 'var(--glow-green)' : 'none',
                }}
              >
                {l === 'id' ? '🇮🇩 Indonesia' : '🇬🇧 English'}
              </button>
            ))}
          </div>

          {/* Join room */}
          <div className="flex gap-2">
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2.5 rounded-2xl font-mono text-base text-center uppercase tracking-widest focus:outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '2px solid var(--border-color)',
              }}
              maxLength={6}
              placeholder="KODE ROOM"
              onFocus={e => e.target.style.borderColor = 'var(--accent-orange)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            <button
              onClick={onJoinRoom}
              disabled={joinCode.length < 4}
              className="px-6 py-2.5 rounded-2xl text-sm font-bold font-display transition-all btn-primary disabled:opacity-30"
            >
              Gabung
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-3 rounded-2xl text-sm font-sans font-medium text-center"
            style={{ background: 'var(--wrong-bg)', color: 'var(--wrong)', border: '1px solid var(--wrong)' }}
          >
            {error}
          </motion.div>
        )}
      </div>
    </div>
  );
}
