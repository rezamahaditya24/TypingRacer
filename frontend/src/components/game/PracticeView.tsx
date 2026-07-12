'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { getRandomQuoteByLanguage } from '@/lib/quotes';
import { Language } from '@/lib/types';
import TextDisplay from './TextDisplay';

export default function PracticeView({ onBack, onCorrectKey, onWrongKey, language }: {
  onBack: () => void;
  onCorrectKey?: () => void;
  onWrongKey?: () => void;
  language: Language;
}) {
  const [text, setText] = useState(() => getRandomQuoteByLanguage(language).text);
  const [charIndex, setCharIndex] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const wpmInterval = useRef<number | null>(null);

  useEffect(() => {
    if (!finished) taRef.current?.focus();
  }, [finished]);

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    if (finished || !text) return;

    const ta = e.currentTarget;
    const typed = ta.value;
    const target = text;

    if (!startTime) setStartTime(Date.now());

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

    if (matchLen > charIndex) {
      onCorrectKey?.();
      if (matchLen >= target.length) {
        setFinished(true);
        if (wpmInterval.current) clearInterval(wpmInterval.current);
      }
    } else if (errs.size > errors.size) {
      onWrongKey?.();
    }

    setCharIndex(matchLen);
    setErrors(errs);
  }, [text, finished, startTime, charIndex, errors.size]);

  useEffect(() => {
    if (startTime && !finished) {
      wpmInterval.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000 / 60;
        const words = charIndex / 5;
        setWpmHistory(p => [...p, elapsed > 0 ? Math.round(words / elapsed) : 0]);
      }, 1000);
    }
    return () => { if (wpmInterval.current) clearInterval(wpmInterval.current); };
  }, [startTime, finished, charIndex]);

  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 0;
  const wpm = elapsed > 0 ? Math.round((charIndex / 5) / (elapsed / 60)) : 0;
  const accuracy = charIndex + errors.size > 0
    ? Math.round((charIndex / (charIndex + errors.size)) * 100) : 100;

  const results = finished ? {
    wpm, accuracy, timeMs: elapsed * 1000, totalChars: text.length,
    peakWpm: wpmHistory.length > 0 ? Math.max(...wpmHistory) : wpm,
  } : null;

  if (finished && results) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
        <motion.h1 className="text-3xl font-bold font-display" style={{ color: 'var(--success)' }}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          Latihan Selesai!
        </motion.h1>
        <div className="flex gap-4 flex-wrap justify-center">
          {[
            { label: 'WPM', value: results.wpm, color: 'var(--accent)' },
            { label: 'Akurasi', value: `${results.accuracy}%`, color: 'var(--success)' },
            { label: 'Waktu', value: `${(results.timeMs / 1000).toFixed(1)}s`, color: 'var(--accent-orange)' },
            { label: 'Puncak WPM', value: results.peakWpm, color: 'var(--accent-yellow)' },
          ].map(s => (
            <div key={s.label} className="text-center p-4 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-sans font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setText(getRandomQuoteByLanguage(language).text); setCharIndex(0); setErrors(new Set()); setStartTime(null); setFinished(false); setWpmHistory([]); }}
            className="px-6 py-3 rounded-2xl font-bold font-display transition-all btn-accent">
            Coba Lagi
          </button>
          <button onClick={onBack}
            className="px-6 py-3 rounded-2xl font-bold font-display transition-all btn-secondary">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 gap-2 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold font-display" style={{ color: 'var(--accent-orange)' }}>Latihan Mengetik</h2>
        <button onClick={onBack} className="text-sm font-sans font-medium underline" style={{ color: 'var(--text-muted)' }}>Keluar</button>
      </div>

      <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-2xl text-xs font-mono" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
        <span style={{ color: 'var(--accent)' }}><span className="font-bold">{wpm}</span> WPM</span>
        <span className="w-px h-3" style={{ background: 'var(--text-muted)', opacity: 0.3 }} />
        <span style={{ color: 'var(--success)' }}><span className="font-bold">{accuracy}</span>%</span>
        <span className="w-px h-3" style={{ background: 'var(--text-muted)', opacity: 0.3 }} />
        <span><span className="font-bold" style={{ color: 'var(--text-primary)' }}>{charIndex}</span><span style={{ color: 'var(--text-muted)' }}>/{text.length}</span></span>
        {startTime && (
          <>
            <span className="w-px h-3" style={{ background: 'var(--text-muted)', opacity: 0.3 }} />
            <span style={{ color: 'var(--accent-orange)' }}>{elapsed.toFixed(1)}s</span>
          </>
        )}
      </div>

      <TextDisplay
        text={text}
        charIndex={charIndex}
        errors={errors}
        inputRef={taRef}
        onInput={handleInput}
        placeholder="Ketik di sini..."
      />
    </div>
  );
}
