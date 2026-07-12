'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRace } from '@/hooks/useRace';
import { useWebSocket } from '@/hooks/useWebSocket';
import { TrophyIcon, MedalGold, MedalSilver, MedalBronze } from '@/lib/assets';

export default function Leaderboard({ race, ws, onBack }: {
  race: ReturnType<typeof useRace>;
  ws: ReturnType<typeof useWebSocket>;
  onBack: () => void;
}) {
  useEffect(() => {
    if (ws.connected) {
      ws.send('get_leaderboard', { limit: 50 });
    }
  }, [ws.connected]);

  const entries = race.leaderboard;

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-display flex items-center gap-2" style={{ color: 'var(--accent-yellow)' }}>
          <TrophyIcon size={28} />
          Papan Skor Global
        </h2>
        <button onClick={onBack} className="text-sm font-sans font-medium underline" style={{ color: 'var(--text-muted)' }}>Kembali</button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 font-sans" style={{ color: 'var(--text-muted)' }}>
          <TrophyIcon size={48} className="mx-auto mb-3 opacity-30" />
          <p>Belum ada balapan yang dicatat.</p>
          <p className="text-sm mt-1">Main dulu yuk!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={{
                background: i < 3 ? 'var(--bg-secondary)' : 'var(--bg-tertiary)',
                border: i === 0 ? '2px solid var(--accent-yellow)' : i === 1 ? '2px solid #94a3b8' : i === 2 ? '2px solid #d97706' : '1px solid var(--border-color)',
                boxShadow: i === 0 ? '0 0 20px rgba(251,191,36,0.15)' : 'var(--card-shadow)',
              }}
            >
              <span className="text-lg font-bold font-display w-8 text-center flex-shrink-0" style={{ color: i < 3 ? 'var(--accent-yellow)' : 'var(--text-muted)' }}>
                {i === 0 ? <MedalGold size={32} /> : i === 1 ? <MedalSilver size={32} /> : i === 2 ? <MedalBronze size={32} /> : `#${i + 1}`}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold font-sans text-sm" style={{ color: 'var(--text-primary)' }}>{e.name}</div>
                <div className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                  {e.racesPlayed} balapan
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold font-mono text-sm" style={{ color: 'var(--accent)' }}>{e.bestWpm} WPM</div>
                <div className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>Rata: {e.avgWpm}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
