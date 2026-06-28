'use client';

import { useEffect } from 'react';
import { useRace } from '@/hooks/useRace';
import { useWebSocket } from '@/hooks/useWebSocket';

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
        <h2 className="text-xl font-bold font-sans" style={{ color: 'var(--amber)' }}>🏆 Papan Skor Global</h2>
        <button onClick={onBack} className="text-sm font-sans underline" style={{ color: 'var(--muted)' }}>Kembali</button>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-12 font-sans" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-2">🏁</p>
          <p>Belum ada balapan yang dicatat.</p>
          <p className="text-sm mt-1">Main dulu yuk!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <span className="text-lg font-bold font-sans w-8 text-center" style={{ color: i < 3 ? 'var(--amber)' : 'var(--muted)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </span>
              <div className="flex-1">
                <div className="font-bold font-sans">{e.name}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {e.racesPlayed} balapan · Terbaik: {e.bestWpm} WPM
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold font-mono" style={{ color: 'var(--teal)' }}>{e.bestWpm} WPM</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>Rata: {e.avgWpm}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
