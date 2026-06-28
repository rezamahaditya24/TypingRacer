'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DINO_LIST } from '@/lib/constants';

const API_HOST = (process.env.NEXT_PUBLIC_WS_HOST || 'ws://localhost:3001').replace(/^ws/, 'http');

interface DashboardData {
  username: string;
  xp: number;
  level: number;
  totalRaces: number;
  bestWpm: number;
  avgWpm: number;
  bestAccuracy: number;
  recentRaces: { raceId: string; wpm: number; accuracy: number; rank: number; totalPlayers: number; startedAt: number; xpEarned: number; timeMs: number }[];
  weeklyWpm: { day: string; wpm: number }[];
}

export default function DashboardView({ token, onBack }: { token: string | null; onBack: () => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setError('Login dulu untuk melihat dashboard'); setLoading(false); return; }
    fetch(`${API_HOST}/api/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError('Gagal memuat data'); setLoading(false); });
  }, [token]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-sm font-sans" style={{ color: 'var(--text-muted)' }}>Memuat dashboard...</div>
    </div>
  );

  if (error || !data) return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
      <p className="text-sm font-sans" style={{ color: 'var(--wrong)' }}>{error || 'Gagal memuat data'}</p>
      <button onClick={onBack} className="text-sm font-sans underline" style={{ color: 'var(--text-muted)' }}>Kembali</button>
    </div>
  );

  const nextLevelXp = Math.pow(data.level, 2) * 100;
  const currentLevelXp = Math.pow(data.level - 1, 2) * 100;
  const xpProgress = nextLevelXp > currentLevelXp ? ((data.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-2xl mx-auto w-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-sans" style={{ color: 'var(--amber)' }}>📊 Dashboard</h2>
        <button onClick={onBack} className="text-sm font-sans underline" style={{ color: 'var(--text-muted)' }}>Kembali</button>
      </div>

      {/* XP & Level Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-xl flex items-center gap-4"
        style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}>
        <div className="text-3xl">🦖</div>
        <div className="flex-1">
          <div className="font-bold font-sans text-lg">{data.username}</div>
          <div className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>Level {data.level} · {data.totalRaces} balapan</div>
          <div className="mt-2 h-2 rounded-full w-full" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(xpProgress, 100)}%`, background: 'var(--accent)' }} />
          </div>
          <div className="text-[10px] mt-1 font-mono" style={{ color: 'var(--text-muted)' }}>{data.xp} / {nextLevelXp} XP</div>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Terbaik', value: `${data.bestWpm}`, unit: 'WPM', color: 'var(--teal)' },
          { label: 'Rata-rata', value: `${data.avgWpm}`, unit: 'WPM', color: 'var(--accent)' },
          { label: 'Akurasi', value: `${data.bestAccuracy}`, unit: '%', color: 'var(--success)' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="p-3 rounded-xl text-center"
            style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}>
            <div className="text-xs font-sans" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}<span className="text-xs"> {s.unit}</span></div>
          </motion.div>
        ))}
      </div>

      {/* Weekly WPM Chart */}
      {data.weeklyWpm.some(d => d.wpm > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl"
          style={{ background: 'var(--bg-secondary)', border: '.5px solid var(--border-color)' }}>
          <h3 className="text-sm font-bold font-sans mb-3" style={{ color: 'var(--text-muted)' }}>📈 Progress Minggu Ini</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.weeklyWpm}>
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} />
              <YAxis domain={[0, 'auto']} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={30} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="wpm" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Recent Races */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2">
        <h3 className="text-sm font-bold font-sans" style={{ color: 'var(--text-muted)' }}>🏁 Balapan Terakhir</h3>
        {data.recentRaces.length === 0 ? (
          <div className="text-center py-6 text-sm font-sans" style={{ color: 'var(--muted)' }}>Belum ada balapan. Yuk main!</div>
        ) : (
          data.recentRaces.map((r, i) => (
            <motion.div key={r.raceId} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'var(--bg-tertiary)', border: '.5px solid var(--border-color)' }}>
              <span className="text-lg font-bold font-sans" style={{ color: 'var(--amber)' }}>#{r.rank}</span>
              <div className="flex-1">
                <div className="text-sm font-mono font-bold">{r.wpm} WPM</div>
                <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{r.accuracy}% · {(r.timeMs / 1000).toFixed(1)}s</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono" style={{ color: 'var(--teal)' }}>+{r.xpEarned} XP</div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {new Date(r.startedAt).toLocaleDateString('id', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
