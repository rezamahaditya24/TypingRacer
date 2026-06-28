'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRace } from '@/hooks/useRace';
import { DINO_LIST } from '@/lib/constants';
import ConfettiCanvas from './ConfettiCanvas';

export default function ResultsScreen({ race, isHost, onRematch, onPlayAgain, wpmHistory, previousBestWpm }: {
  race: ReturnType<typeof useRace>;
  isHost: boolean;
  onRematch: () => void;
  onPlayAgain: () => void;
  wpmHistory?: { time: number; wpm: number }[];
  previousBestWpm?: number;
}) {
  const [rematchSent, setRematchSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  const winner = race.results.find(r => r.rank === 1);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6 relative">
      <ConfettiCanvas active={showConfetti} />

      {winner && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-2"
        >
          <div className="text-4xl mb-2">🏆</div>
          <div className="text-xl font-medium" style={{ color: '#fbbf24' }}>
            {winner.name} menang!
          </div>
          <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {winner.wpm} WPM · {winner.accuracy}% akurasi
          </div>
        </motion.div>
      )}

      <motion.h1 className="text-3xl sm:text-4xl font-bold font-sans" style={{ color: 'var(--accent)' }}
        initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 12 }}>
        🏁 Race Complete!
      </motion.h1>

      <div className="flex items-end gap-3 h-40">
        {[2, 1, 3].map(rankIdx => {
          const r = race.results.find(res => res.rank === rankIdx);
          if (!r) return <div key={rankIdx} className="w-20" />;
          const h: Record<number, string> = { 1: 'h-32', 2: 'h-24', 3: 'h-16' };
          const emojis: Record<number, string> = { 1: '👑', 2: '🥈', 3: '🥉' };
          const order = rankIdx === 1 ? 1 : rankIdx === 2 ? 0 : 2;
          return (
            <motion.div key={r.id}
              className={`flex flex-col items-center justify-end gap-1 w-20 ${h[rankIdx]} rounded-t-2xl p-2`}
              style={{ background: rankIdx === 1 ? 'linear-gradient(180deg, var(--accent), var(--accent-dim))' : 'var(--bg-secondary)', border: rankIdx === 1 ? `2px solid var(--accent)` : '1px solid var(--border-color)' }}
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + order * 0.15, type: 'spring', stiffness: 100, damping: 15 }}>
              <span className="text-2xl">{DINO_LIST.find(d => d.type === r.dino)?.emoji}</span>
              <span className="text-xs font-bold font-sans text-center leading-tight" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
              <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>{emojis[rankIdx]} {r.wpm} WPM</span>
            </motion.div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 w-full max-w-lg">
        {race.results.map((r, i) => (
          <motion.div key={r.id}
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.12, duration: 0.35, ease: 'easeOut' }}
          >
            <div className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-secondary)', border: i === 0 ? `2px solid var(--accent)` : '1px solid var(--border-color)' }}>
              <span className="text-xl font-bold font-sans" style={{ color: 'var(--accent)' }}>#{r.rank}</span>
              <span className="text-2xl">{DINO_LIST.find(d => d.type === r.dino)?.emoji}</span>
              <div className="flex-1">
                <div className="font-bold font-sans text-sm">{r.name}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                  {r.wpm} WPM · {r.accuracy}% akurasi · {(r.timeMs / 1000).toFixed(1)}s
                </div>
              </div>
              {previousBestWpm && r.wpm > previousBestWpm && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.15, type: 'spring' }}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(74,222,128,.15)', color: 'var(--correct)' }}
                >
                  ✦ PB +{r.wpm - previousBestWpm} WPM
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {wpmHistory && wpmHistory.length > 1 && (
        <div className="w-full max-w-lg p-4 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <h3 className="text-sm font-bold font-sans mb-2" style={{ color: 'var(--text-muted)' }}>📈 Kecepatan per 3 Detik</h3>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={wpmHistory}>
              <XAxis dataKey="time" tick={false} axisLine={false} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={30} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="wpm" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="flex gap-3">
        {isHost && (
          <motion.button onClick={() => { onRematch(); setRematchSent(true); }}
            disabled={rematchSent}
            className="px-6 py-3 rounded-xl font-bold font-sans transition-transform hover:scale-105 disabled:opacity-50"
            style={{ background: 'var(--accent)', color: '#0d1117' }}
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            🔄 Balapan Ulang
          </motion.button>
        )}
        <motion.button onClick={onPlayAgain}
          className="px-6 py-3 rounded-xl font-bold font-sans transition-transform hover:scale-105"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '.5px solid var(--border-color)' }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          Main Baru
        </motion.button>
      </div>
    </div>
  );
}
