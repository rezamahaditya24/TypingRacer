'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRace } from '@/hooks/useRace';
import { useSound } from '@/hooks/useSound';
import { DinoType, RoomStatus } from '@/lib/types';
import { randomName } from '@/lib/constants';
import BackgroundMusic from '@/components/game/BackgroundMusic';
import LandingView from '@/components/game/LandingView';
import Lobby from '@/components/game/Lobby';
import RaceView from '@/components/game/RaceView';
import ResultsScreen from '@/components/game/ResultsScreen';
import PracticeView from '@/components/game/PracticeView';
import Leaderboard from '@/components/ui/Leaderboard';

export default function Home() {
  const [view, setView] = useState<'landing' | 'lobby' | 'racing' | 'results' | 'leaderboard' | 'practice'>('landing');
  const [name, setName] = useState(randomName());
  const [selectedDino, setSelectedDino] = useState<DinoType>('t-rex');
  const [joinCode, setJoinCode] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [themeVariant, setThemeVariant] = useState<'dark' | 'light' | 'retro' | 'neon'>('dark');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);
  const [ghostData, setGhostData] = useState<{ charIndex: number; timeMs: number }[] | null>(null);
  const keystrokeTimestamps = useRef<{ charIndex: number; timeMs: number }[]>([]);
  const wpmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sound = useSound();

  const race = useRace();
  const prevStatusRef = useRef<RoomStatus>('waiting');
  const ws = useWebSocket({
    onMessage: useCallback((data) => {
      race.handleMessage(data);
    }, [race.handleMessage]),
  });

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('dino-dash-theme');
      setIsDark(savedTheme !== 'light');
      const savedVariant = localStorage.getItem('dino-dash-variant') as typeof themeVariant | null;
      if (savedVariant) setThemeVariant(savedVariant);
      const savedMusic = localStorage.getItem('dino-music');
      if (savedMusic === '1') setMusicEnabled(true);
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'retro', 'neon');
    if (themeVariant !== 'dark') root.classList.add(themeVariant);
    try { localStorage.setItem('dino-dash-variant', themeVariant); } catch {}
  }, [themeVariant]);

  useEffect(() => {
    if (race.status === 'racing' && race.startedAt) {
      const startedAt = race.startedAt;
      setGhostData(null);
      keystrokeTimestamps.current = [];
      const quoteId = race.text.slice(0, 20);
      try {
        const saved = localStorage.getItem(`pb_${quoteId}`);
        if (saved) setGhostData(JSON.parse(saved));
      } catch {}
      setWpmHistory([]);
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = setInterval(() => {
        setWpmHistory(prev => {
          const myP = race.players.find(p => p.id === race.playerId);
          return [...prev, { time: Date.now() - startedAt, wpm: myP?.wpm || 0 }];
        });
      }, 3000);
    }
    return () => { if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current); };
  }, [race.status, race.startedAt, race.playerId]);

  useEffect(() => {
    if (race.results.length > 0 && view === 'racing') {
      setView('results');
      if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
      if (keystrokeTimestamps.current.length > 0) {
        const quoteId = race.text.slice(0, 20);
        try { localStorage.setItem(`pb_${quoteId}`, JSON.stringify(keystrokeTimestamps.current)); } catch {}
      }
    } else if ((race.status === 'countdown' || race.status === 'racing') && view === 'lobby') {
      setView('racing');
    } else if (race.status === 'waiting' && race.roomId && view !== 'lobby') {
      setView('lobby');
    }
  }, [race.status, race.roomId, race.results.length, view]);

  useEffect(() => {
    if (race.status === 'countdown' && race.countdownSec !== null) {
      if (race.countdownSec <= 1) sound.goSound();
      else sound.countdownBeep();
    }
  }, [race.status, race.countdownSec, sound]);

  useEffect(() => {
    if (race.status === 'finished' && prevStatusRef.current !== 'finished') {
      sound.finishFanfare();
    }
    prevStatusRef.current = race.status;
  }, [race.status, sound]);

  const sendJoin = useCallback((roomId: string) => {
    ws.send('join_room', { roomId, name, dino: selectedDino });
  }, [ws.send, name, selectedDino]);

  const waitConnect = (cb: () => void) => {
    const i = setInterval(() => { if (ws.ws.current?.readyState === WebSocket.OPEN) { clearInterval(i); cb(); } }, 100);
    setTimeout(() => clearInterval(i), 5000);
  };

  const handleCreateRoom = () => {
    if (!ws.connected) { ws.connect(); waitConnect(() => sendJoin('new')); }
    else sendJoin('new');
    setView('lobby');
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    if (!ws.connected) { ws.connect(); waitConnect(() => sendJoin(code)); }
    else sendJoin(code);
    setView('lobby');
  };

  const handleStartRace = () => ws.send('start_race');
  const handleResetRace = () => ws.send('reset_race');

  const handleOpenLeaderboard = () => {
    if (!ws.connected) {
      ws.connect();
      waitConnect(() => { ws.send('get_leaderboard', {}); setView('leaderboard'); });
    } else {
      ws.send('get_leaderboard', {});
      setView('leaderboard');
    }
  };

  const handlePractice = () => setView('practice');

  const toggleMusic = () => {
    setMusicEnabled(p => { const next = !p; try { localStorage.setItem('dino-music', next ? '1' : '0'); } catch {} return next; });
  };

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    setThemeVariant(next ? 'dark' : 'light');
    try { localStorage.setItem('dino-dash-theme', next ? 'dark' : 'light'); } catch {}
  };

  const handleKeystroke = useCallback((charIndex: number) => {
    if (!race.startedAt) return;
    keystrokeTimestamps.current.push({ charIndex, timeMs: Date.now() - race.startedAt });
  }, []);

  const isHost = race.playerId === race.hostId;

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
      <nav className="flex items-center justify-between p-4 gap-2">
        <button onClick={() => { race.reset(); ws.disconnect(); setView('landing'); }} className="font-bold font-sans text-lg" style={{ color: 'var(--amber)' }}>
          🦕 Dino Dash
        </button>
        <div className="flex items-center gap-3">
          {race.status === 'waiting' && race.roomId && (
            <button onClick={() => navigator.clipboard.writeText(race.roomId || '')} className="text-xs font-mono underline" style={{ color: 'var(--teal)' }}>
              📋 {race.roomId}
            </button>
          )}
          <button onClick={sound.toggle} className="text-lg">{sound.soundEnabled ? '🔊' : '🔇'}</button>
          <button onClick={toggleMusic} className="text-lg" title={musicEnabled ? 'Matikan musik' : 'Putar musik'} style={{ opacity: musicEnabled ? 1 : 0.4 }}>🎵</button>
          <button onClick={toggleTheme} className="text-lg">{isDark ? '☀️' : '🌙'}</button>
        </div>
      </nav>

      {view === 'landing' && (
        <LandingView
          name={name} setName={setName}
          selectedDino={selectedDino} setSelectedDino={setSelectedDino}
          joinCode={joinCode} setJoinCode={setJoinCode}
          onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom}
          onOpenLeaderboard={handleOpenLeaderboard}
          onPractice={handlePractice}
          error={race.error}
        />
      )}
      {view === 'leaderboard' && (
        <Leaderboard race={race} ws={ws} onBack={() => setView('landing')} />
      )}
      {view === 'practice' && (
        <PracticeView onBack={() => setView('landing')} onCorrectKey={sound.keyClick} onWrongKey={sound.errorBuzz} />
      )}
      {view === 'lobby' && (
        <Lobby
          players={race.players} roomId={race.roomId}
          playerId={race.playerId} hostId={race.hostId}
          isHost={isHost} ws={ws}
          onStartRace={handleStartRace}
          onLeave={() => { race.reset(); ws.disconnect(); setView('landing'); }}
        />
      )}
      {view === 'racing' && (
        <RaceView
          race={race} ws={ws}
          onCorrectKey={sound.keyClick}
          onWrongKey={sound.errorBuzz}
          onKeystroke={handleKeystroke}
          ghostData={ghostData}
          raceStartTime={race.startedAt || undefined}
        />
      )}
      {view === 'results' && (
        <ResultsScreen
          race={race} isHost={isHost}
          onRematch={handleResetRace}
          onPlayAgain={() => { race.reset(); ws.disconnect(); setView('landing'); }}
          wpmHistory={wpmHistory}
        />
      )}

    </div>
  );
}
