'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRace } from '@/hooks/useRace';
import { useWebSocket } from '@/hooks/useWebSocket';
import RaceTrack from './RaceTrack';
import TextDisplay from './TextDisplay';
import SpeedHUD from './SpeedHUD';
import KeyboardVisualizer from './KeyboardVisualizer';
import CountdownOverlay from './CountdownOverlay';

export default function RaceView({ race, ws, onCorrectKey, onWrongKey, onKeystroke, ghostData, raceStartTime }: {
  race: ReturnType<typeof useRace>;
  ws: ReturnType<typeof useWebSocket>;
  onCorrectKey?: () => void;
  onWrongKey?: () => void;
  onKeystroke?: (charIndex: number) => void;
  ghostData?: { charIndex: number; timeMs: number }[] | null;
  raceStartTime?: number;
}) {
  const [charIndex, setCharIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [showGo, setShowGo] = useState(false);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [lastKeyCorrect, setLastKeyCorrect] = useState<boolean | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [streakCount, setStreakCount] = useState(0);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const prevSentRef = useRef(0);

  useEffect(() => { setCharIndex(0); setErrors(new Set()); prevSentRef.current = 0; setStreakCount(0); }, [race.text, race.startedAt]);

  useEffect(() => {
    if (race.status === 'racing') taRef.current?.focus();
  }, [race.status]);

  useEffect(() => {
    if (charIndex > prevSentRef.current && ws.connected) {
      ws.send('progress', { charIndex });
      prevSentRef.current = charIndex;
    }
  }, [charIndex, ws.connected]);

  useEffect(() => {
    if (race.status === 'countdown' && race.countdownSec !== null && race.countdownSec <= 1) setShowGo(true);
    else setShowGo(false);
  }, [race.status, race.countdownSec]);

  useEffect(() => {
    try {
      const pref = localStorage.getItem('dino-keyboard-vis');
      if (pref !== null) setShowKeyboard(pref === '1');
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dino-keyboard-vis', showKeyboard ? '1' : '0'); } catch {}
  }, [showKeyboard]);

  const myPlayer = race.players.find(p => p.id === race.playerId);
  const currentChar = charIndex < race.text.length ? race.text[charIndex] : '';

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    if (race.status !== 'racing') return;
    const myP = race.players.find(p => p.id === race.playerId);
    if (!myP || myP.finished) return;
    if (!race.text) return;

    const ta = e.currentTarget;
    const typed = ta.value;
    const target = race.text;

    let matchLen = 0;
    let inError = false;
    const errs = new Set<number>();

    for (let i = 0; i < typed.length && i < target.length; i++) {
      if (typed[i] === target[i] && !inError) {
        matchLen = i + 1;
      } else {
        errs.add(i);
        inError = true;
      }
    }

    const corrected = target.slice(0, matchLen);
    if (ta.value !== corrected) {
      ta.value = corrected;
    }

    if (matchLen > prevSentRef.current) {
      onCorrectKey?.();
      onKeystroke?.(matchLen);
      setLastKey(target[matchLen - 1] || null);
      setLastKeyCorrect(true);
      if (target[matchLen - 1] === ' ') setStreakCount(s => s + 1);
      else setStreakCount(0);
    } else if (errs.size > 0 && errs.size > errors.size) {
      onWrongKey?.();
      setLastKey(target[errs.size - 1] || null);
      setLastKeyCorrect(false);
      setStreakCount(0);
    }

    setCharIndex(matchLen);
    setErrors(errs);

    if (matchLen > prevSentRef.current && ws.connected) {
      ws.send('progress', { charIndex: matchLen });
    }
    prevSentRef.current = matchLen;
  }, [race.status, race.players, race.playerId, race.text, ws.connected, errors.size]);

  if (race.status === 'countdown' && race.countdownSec !== null) {
    return <CountdownOverlay sec={race.countdownSec} showGo={showGo} />;
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-2 max-w-4xl mx-auto w-full">
      <RaceTrack
        players={race.players}
        textLength={race.text.length}
        myPlayerId={race.playerId}
        ghostTimestamps={ghostData || undefined}
        raceStartTime={raceStartTime}
      />

      {/* SpeedHUD */}
      <SpeedHUD
        wpm={myPlayer?.wpm || 0}
        accuracy={myPlayer?.accuracy || 100}
        streakCount={streakCount}
        pbDelta={null}
      />

      <TextDisplay
        text={race.text}
        charIndex={charIndex}
        errors={errors}
        inputRef={taRef}
        onInput={handleInput}
        placeholder="Ketik di sini..."
      />

      {/* Keyboard Visualizer toggle */}
      {showKeyboard && (
        <KeyboardVisualizer
          expectedKey={currentChar}
          lastKey={lastKey}
          wasCorrect={lastKeyCorrect}
        />
      )}
      <button
        onClick={() => setShowKeyboard(s => !s)}
        className="self-center text-[10px] underline"
        style={{ color: 'var(--text-muted)' }}
      >
        {showKeyboard ? 'Sembunyikan keyboard' : 'Tampilkan keyboard'}
      </button>
    </div>
  );
}
