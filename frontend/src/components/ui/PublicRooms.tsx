'use client';

import { useEffect } from 'react';
import { useRace } from '@/hooks/useRace';
import { useWebSocket } from '@/hooks/useWebSocket';

interface PublicRoom {
  id: string;
  playerCount: number;
  maxPlayers: number;
  hostName: string;
  language: string;
  hasPassword: boolean;
}

export default function PublicRooms({ race, ws, onBack, onJoin }: {
  race: ReturnType<typeof useRace>;
  ws: ReturnType<typeof useWebSocket>;
  onBack: () => void;
  onJoin: (roomId: string) => void;
}) {
  useEffect(() => {
    if (ws.connected) ws.send('get_public_rooms', {});
  }, [ws.connected]);

  const rooms: PublicRoom[] = (race as any).publicRooms || [];

  return (
    <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold font-sans" style={{ color: 'var(--accent)' }}>🌐 Room Publik</h2>
        <button onClick={onBack} className="text-sm font-sans underline" style={{ color: 'var(--text-muted)' }}>Kembali</button>
      </div>

      {rooms.length === 0 ? (
        <div className="text-center py-12 font-sans" style={{ color: 'var(--muted)' }}>
          <p className="text-4xl mb-2">🏠</p>
          <p>Belum ada room publik.</p>
          <p className="text-sm mt-1">Buat room dan atur ke publik!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rooms.map(r => (
            <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface)' }}>
              <div className="flex-1">
                <div className="font-bold font-sans text-sm">{r.hostName}</div>
                <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  {r.playerCount}/{r.maxPlayers} pemain · {r.language === 'id' ? '🇮🇩' : '🇬🇧'}
                  {r.hasPassword && ' · 🔒'}
                </div>
              </div>
              <button onClick={() => onJoin(r.id)}
                className="px-4 py-2 rounded-lg text-xs font-medium"
                style={{ background: 'var(--accent)', color: '#0d1117' }}>
                Gabung
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
