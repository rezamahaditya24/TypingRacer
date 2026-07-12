'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useRace } from '@/hooks/useRace';
import { useSound } from '@/hooks/useSound';
import { DinoType, RoomStatus, Language } from '@/lib/types';
import { randomName } from '@/lib/constants';
import BackgroundMusic from '@/components/game/BackgroundMusic';
import LandingView from '@/components/game/LandingView';
import Lobby from '@/components/game/Lobby';
import RaceView from '@/components/game/RaceView';
import ResultsScreen from '@/components/game/ResultsScreen';
import PracticeView from '@/components/game/PracticeView';
import Leaderboard from '@/components/ui/Leaderboard';
import AuthForm from '@/components/ui/AuthForm';
import DashboardView from '@/components/ui/DashboardView';
import PublicRooms from '@/components/ui/PublicRooms';

const API_HOST = (process.env.NEXT_PUBLIC_WS_HOST || 'ws://localhost:3001').replace(/^ws/, 'http');

export default function Home() {
  const [view, setView] = useState<'landing' | 'lobby' | 'racing' | 'results' | 'leaderboard' | 'practice' | 'dashboard' | 'publicRooms'>('landing');
  const [name, setName] = useState(randomName());
  const [selectedDino, setSelectedDino] = useState<DinoType>('t-rex');
  const [joinCode, setJoinCode] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [themeVariant, setThemeVariant] = useState<'dark' | 'light' | 'retro' | 'neon'>('dark');
  const [language, setLanguage] = useState<Language>('id');
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<{ time: number; wpm: number }[]>([]);
  const [ghostData, setGhostData] = useState<{ charIndex: number; timeMs: number }[] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const keystrokeTimestamps = useRef<{ charIndex: number; timeMs: number }[]>([]);
  const wpmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingRejoinRef = useRef<string | null>(null);
  const authLoadingRef = useRef(false);

  const sound = useSound();

  const race = useRace();
  const prevStatusRef = useRef<RoomStatus>('waiting');
  const ws = useWebSocket({
    onMessage: useCallback((data) => {
      if (data.type === 'auth_ok') {
        const p = data.payload as { token: string; userId: string; username: string };
        if (p.token) {
          setToken(p.token);
          try { localStorage.setItem('dino-token', p.token); } catch {}
        }
        if (p.userId) setUser({ id: p.userId, username: p.username });
        setAuthLoading(false);
        authLoadingRef.current = false;
        setShowAuth(false);
        return;
      }
      if (data.type === 'error' && authLoadingRef.current) {
        const p = data.payload as { message: string };
        setAuthError(p.message || 'Terjadi kesalahan');
        setAuthLoading(false);
        authLoadingRef.current = false;
        return;
      }
      race.handleMessage(data);
    }, [race.handleMessage]),
  });

  // Handle challenge link on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const challengeId = params.get('challenge');
    if (challengeId) {
      fetch(`${API_HOST}/api/challenge/${challengeId}`)
        .then(r => r.json())
        .then(data => {
          if (data.challengerName) {
            setName(`Lawan ${data.challengerName}`);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('dino-dash-theme');
      setIsDark(savedTheme !== 'light');
      const savedVariant = localStorage.getItem('dino-dash-variant') as typeof themeVariant | null;
      if (savedVariant) setThemeVariant(savedVariant);
      const savedMusic = localStorage.getItem('dino-music');
      if (savedMusic === '1') setMusicEnabled(true);
      const savedName = localStorage.getItem('dino-name');
      if (savedName) setName(savedName);
      const savedDino = localStorage.getItem('dino-dino') as DinoType | null;
      if (savedDino) setSelectedDino(savedDino);
      const savedLang = localStorage.getItem('dino-language') as Language | null;
      if (savedLang === 'id' || savedLang === 'en') setLanguage(savedLang);
      const savedRoom = localStorage.getItem('dino-room');
      if (savedRoom) pendingRejoinRef.current = savedRoom;
      const savedToken = localStorage.getItem('dino-token');
      if (savedToken) {
        setToken(savedToken);
        setTimeout(() => ws.send('auth', { token: savedToken }), 500);
      }
    } catch {}
    ws.connect();
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

  useEffect(() => {
    if (ws.connected) {
      if (token) ws.send('auth', { token });
      if (pendingRejoinRef.current) {
        const roomId = pendingRejoinRef.current;
        pendingRejoinRef.current = null;
        ws.send('join_room', { roomId, name, dino: selectedDino, language });
        setView('lobby');
      }
    }
  }, [ws.connected]);

  const sendJoin = useCallback((roomId: string, asSpectator = false) => {
    ws.send('join_room', { roomId, name, dino: selectedDino, language, asSpectator });
  }, [ws.send, name, selectedDino, language]);

  const waitConnect = (cb: () => void) => {
    const i = setInterval(() => { if (ws.ws.current?.readyState === WebSocket.OPEN) { clearInterval(i); cb(); } }, 100);
    setTimeout(() => clearInterval(i), 5000);
  };

  useEffect(() => { try { localStorage.setItem('dino-name', name); } catch {} }, [name]);
  useEffect(() => { try { localStorage.setItem('dino-dino', selectedDino); } catch {} }, [selectedDino]);
  useEffect(() => { try { localStorage.setItem('dino-language', language); } catch {} }, [language]);
  useEffect(() => {
    if (race.roomId) { try { localStorage.setItem('dino-room', race.roomId); } catch {} }
    else { try { localStorage.removeItem('dino-room'); } catch {} }
  }, [race.roomId]);

  const handleCreateRoom = () => {
    if (!ws.connected) { ws.connect(); waitConnect(() => sendJoin('new')); }
    else sendJoin('new');
    setView('lobby');
  };

  const handleLogin = (username: string, password: string) => {
    setAuthLoading(true); setAuthError(null);
    authLoadingRef.current = true;
    const doLogin = () => ws.send('login', { username, password });
    if (!ws.connected) { ws.connect(); waitConnect(doLogin); } else doLogin();
  };

  const handleSignup = (username: string, password: string) => {
    setAuthLoading(true); setAuthError(null);
    authLoadingRef.current = true;
    const doSignup = () => ws.send('signup', { username, password });
    if (!ws.connected) { ws.connect(); waitConnect(doSignup); } else doSignup();
  };

  const handleLogout = () => {
    setToken(null); setUser(null);
    try { localStorage.removeItem('dino-token'); } catch {}
  };

  const handleJoinRoom = () => {
    if (!joinCode.trim()) return;
    const code = joinCode.trim().toUpperCase();
    if (!ws.connected) { ws.connect(); waitConnect(() => sendJoin(code)); }
    else sendJoin(code);
    setView('lobby');
  };

  const handleJoinPublicRoom = (roomId: string) => {
    if (!ws.connected) { ws.connect(); waitConnect(() => sendJoin(roomId)); }
    else sendJoin(roomId);
    setView('lobby');
  };

  const handleStartRace = () => ws.send('start_race');
  const handleResetRace = () => ws.send('reset_race');

  const handleOpenLeaderboard = () => {
    if (!ws.connected) { ws.connect(); waitConnect(() => { ws.send('get_leaderboard', {}); setView('leaderboard'); }); }
    else { ws.send('get_leaderboard', {}); setView('leaderboard'); }
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
      <nav className="flex items-center justify-between px-4 py-3 gap-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => { race.reset(); ws.disconnect(); setView('landing'); }} className="font-bold font-display text-lg" style={{ color: 'var(--accent)' }}>
            Dino Dash
          </button>
          {view !== 'landing' && (
            <button onClick={() => { race.reset(); ws.disconnect(); setView('landing'); }} className="text-sm font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              ← Kembali
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {race.status === 'waiting' && race.roomId && (
            <button onClick={() => navigator.clipboard.writeText(race.roomId || '')} className="text-[10px] font-mono font-medium px-2 py-1 rounded-lg" style={{ background: 'var(--bg-tertiary)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,.2)' }}>
              📋 {race.roomId}
            </button>
          )}
          {user ? (
            <span className="text-xs font-sans font-medium flex items-center gap-1" style={{ color: 'var(--accent)' }}>
              {user.username}
              <button onClick={handleLogout} className="underline" style={{ color: 'var(--text-muted)' }}>Keluar</button>
            </span>
          ) : (
            <button onClick={() => setShowAuth(true)} className="text-xs font-sans font-medium underline" style={{ color: 'var(--text-muted)' }}>
              Masuk
            </button>
          )}
          <button onClick={sound.toggle} className="text-base px-1.5 py-0.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }} title={sound.soundEnabled ? 'Matikan suara' : 'Hidupkan suara'}>{sound.soundEnabled ? '🔊' : '🔇'}</button>
          <button onClick={toggleMusic} className="text-base px-1.5 py-0.5 rounded-lg" style={{ background: 'var(--bg-tertiary)', opacity: musicEnabled ? 1 : 0.4 }} title={musicEnabled ? 'Matikan musik' : 'Putar musik'}>🎵</button>
          <button onClick={toggleTheme} className="text-base px-1.5 py-0.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>{isDark ? '☀️' : '🌙'}</button>
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowAuth(false)}>
          <div onClick={e => e.stopPropagation()}>
            <AuthForm onLogin={handleLogin} onSignup={handleSignup} error={authError} loading={authLoading} />
            <button onClick={() => setShowAuth(false)} className="w-full mt-2 text-xs font-sans text-center" style={{ color: 'var(--text-muted)' }}>Tutup</button>
          </div>
        </div>
      )}

      {view === 'landing' && (
        <LandingView
          name={name} setName={setName}
          selectedDino={selectedDino} setSelectedDino={setSelectedDino}
          language={language} setLanguage={setLanguage}
          joinCode={joinCode} setJoinCode={setJoinCode}
          onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom}
          onOpenLeaderboard={handleOpenLeaderboard}
          onPractice={handlePractice}
          onOpenDashboard={() => setView('dashboard')}
          onOpenPublicRooms={() => { if (!ws.connected) ws.connect(); else ws.send('get_public_rooms', {}); setView('publicRooms'); }}
          error={race.error}
          onlineCount={race.onlineCount}
          user={user}
        />
      )}
      {view === 'leaderboard' && (
        <Leaderboard race={race} ws={ws} onBack={() => setView('landing')} />
      )}
      {view === 'dashboard' && (
        <DashboardView token={token} onBack={() => setView('landing')} />
      )}
      {view === 'publicRooms' && (
        <PublicRooms race={race} ws={ws} onBack={() => setView('landing')} onJoin={handleJoinPublicRoom} />
      )}
      {view === 'practice' && (
        <PracticeView onBack={() => setView('landing')} onCorrectKey={sound.keyClick} onWrongKey={sound.errorBuzz} language={language} />
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
          token={token}
        />
      )}

      <BackgroundMusic enabled={musicEnabled} />
    </div>
  );
}
