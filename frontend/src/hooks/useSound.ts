'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const enabledRef = useRef(true);

  useEffect(() => {
    enabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dino-dash-sound');
      if (saved !== null) {
        setSoundEnabled(saved === 'on');
      } else {
        setSoundEnabled(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      }
    } catch {
      setSoundEnabled(true);
    }
  }, []);

  const getCtx = useCallback(() => {
    try {
      if (!ctxRef.current) {
        const Ctor = window.AudioContext || (window as any).webkitAudioContext;
        if (!Ctor) return null;
        ctxRef.current = new Ctor();
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const play = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, [getCtx]);

  const keyClick = useCallback(() => {
    if (!enabledRef.current) return;
    play(800, 0.03, 'sine', 0.05);
  }, [play]);

  const errorBuzz = useCallback(() => {
    if (!enabledRef.current) return;
    play(150, 0.15, 'square', 0.08);
  }, [play]);

  const countdownBeep = useCallback(() => {
    if (!enabledRef.current) return;
    play(600, 0.2, 'sine', 0.1);
  }, [play]);

  const goSound = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {}
  }, [getCtx]);

  const finishFanfare = useCallback(() => {
    if (!enabledRef.current) return;
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.15);
        gain.gain.setValueAtTime(0.12, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.3);
      });
    } catch {}
  }, [getCtx]);

  const toggle = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      enabledRef.current = next;
      try {
        localStorage.setItem('dino-dash-sound', next ? 'on' : 'off');
      } catch {}
      return next;
    });
  }, []);

  return { keyClick, errorBuzz, countdownBeep, goSound, finishFanfare, toggle, soundEnabled };
}
