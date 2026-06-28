'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const ROWS = [
  ['q','w','e','r','t','y','u','i','o','p'],
  ['a','s','d','f','g','h','j','k','l'],
  ['z','x','c','v','b','n','m'],
];

interface KeyboardVisualizerProps {
  expectedKey: string;
  lastKey: string | null;
  wasCorrect: boolean | null;
}

export default function KeyboardVisualizer({ expectedKey, lastKey, wasCorrect }: KeyboardVisualizerProps) {
  const [flashKey, setFlashKey] = useState<{ key: string; correct: boolean } | null>(null);

  useEffect(() => {
    if (lastKey === null) return;
    setFlashKey({ key: lastKey.toLowerCase(), correct: wasCorrect ?? true });
    const t = setTimeout(() => setFlashKey(null), 300);
    return () => clearTimeout(t);
  }, [lastKey, wasCorrect]);

  const getKeyStyle = (key: string): Record<string, string> => {
    const isFlashing = flashKey?.key === key;
    const isExpected = expectedKey.toLowerCase() === key && !isFlashing;

    if (isFlashing) {
      return flashKey.correct
        ? { background: 'rgba(74,222,128,.2)', borderColor: 'var(--correct)', color: 'var(--correct)' }
        : { background: 'rgba(248,113,113,.2)', borderColor: 'var(--wrong)', color: 'var(--wrong)', animation: 'char-shake .15s ease' };
    }
    if (isExpected) {
      return { borderColor: 'var(--accent)', color: 'var(--accent)' };
    }
    return { borderColor: 'var(--border-color)' };
  };

  return (
    <div className="flex flex-col items-center gap-1 mt-3">
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex gap-[3px]">
          {row.map(key => (
            <div
              key={key}
              className="flex items-center justify-center rounded select-none"
              style={{
                minWidth: 24, height: 24,
                background: 'var(--bg-tertiary)',
                border: '.5px solid var(--border-color)',
                borderBottom: '2px solid var(--bg-primary)',
                fontSize: 9, color: 'var(--text-muted)',
                transition: 'all .08s',
                ...getKeyStyle(key),
              }}
            >
              {key}
            </div>
          ))}
        </div>
      ))}
      {/* Space bar */}
      <div className="flex gap-[3px]">
        <div
          className="flex items-center justify-center rounded select-none"
          style={{
            width: 120, height: 24,
            background: 'var(--bg-tertiary)',
            border: '.5px solid var(--border-color)',
            borderBottom: '2px solid var(--bg-primary)',
            fontSize: 9, color: 'var(--text-muted)',
            transition: 'all .08s',
            ...getKeyStyle(' '),
          }}
        >
          space
        </div>
      </div>
    </div>
  );
}
