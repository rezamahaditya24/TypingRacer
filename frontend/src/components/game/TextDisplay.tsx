'use client';

import { useState, useCallback, useRef, type RefObject } from 'react';
import { motion } from 'framer-motion';

export default function TextDisplay({
  text, charIndex, errors, inputRef, onInput, showInput = true, placeholder = 'Ketik di sini...',
  onWordComplete, onCharError,
}: {
  text: string;
  charIndex: number;
  errors: Set<number>;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInput: (e: React.FormEvent<HTMLTextAreaElement>) => void;
  showInput?: boolean;
  placeholder?: string;
  onWordComplete?: (wordIndex: number) => void;
  onCharError?: () => void;
}) {
  const [pulsedWords, setPulsedWords] = useState<Set<number>>(new Set());
  const [shakeChar, setShakeChar] = useState<number | null>(null);
  const prevErrorsSize = useRef(errors.size);

  const currentWordIndex = useCallback((pos: number) => {
    const before = text.slice(0, pos);
    return before.split(' ').length - 1;
  }, [text]);

  if (errors.size > prevErrorsSize.current) {
    prevErrorsSize.current = errors.size;
    onCharError?.();
    setShakeChar(charIndex);
    setTimeout(() => setShakeChar(null), 150);
  }

  const renderText = () => {
    const chars: any[] = [];
    let wordStart = 0;

    for (let i = 0; i <= text.length; i++) {
      if (i === text.length || text[i] === ' ') {
        const wordEnd = i;
        const wordIdx = currentWordIndex(wordEnd);
        const isCompleted = wordEnd <= charIndex && ![...errors].some(e => e >= wordStart && e < wordEnd);

        if (isCompleted && wordEnd > wordStart) {
          const needPulse = charIndex === wordEnd + 1 && wordEnd < text.length;
          if (needPulse && !pulsedWords.has(wordIdx)) {
            setPulsedWords(prev => new Set(prev).add(wordIdx));
            setTimeout(() => {
              setPulsedWords(prev => { const s = new Set(prev); s.delete(wordIdx); return s; });
            }, 600);
          }
        }

        for (let j = wordStart; j <= wordEnd; j++) {
          if (j === text.length) break;
          const char = text[j];
          const isCurrentWord = j >= wordStart && j < wordEnd && charIndex >= wordStart && charIndex <= wordEnd;
          const isTyped = j < charIndex;
          const isError = errors.has(j);

          let color = 'var(--text-muted)';
          let bg = 'transparent';
          let extraAnim = '';

          if (isTyped && isError) {
            color = 'var(--wrong)';
            bg = 'var(--wrong-bg)';
            if (j === shakeChar) extraAnim = 'char-shake .15s ease';
          } else if (isTyped) {
            color = 'var(--correct)';
            const isWordGap = j === wordEnd || wordStart === charIndex;
            const pw = pulsedWords.has(wordIdx) && j === wordStart;
            if (pw) bg = 'rgba(74,222,128,.2)';
          } else if (j === charIndex) {
            bg = 'var(--accent-dim)';
            color = 'var(--accent)';
            if (shakeChar === j) extraAnim = 'char-shake .15s ease';
          }

          chars.push(
            <span key={j} style={{
              color, background: bg,
              borderRadius: 2, padding: '0 1px',
              borderBottom: j === charIndex ? `2px solid var(--accent)` : isCurrentWord && !isTyped ? '1px solid var(--accent-dim)' : 'none',
              animation: extraAnim || (pulsedWords.has(wordIdx) && j === wordStart ? 'word-pulse .6s ease forwards' : 'none'),
              transition: 'color 75ms, background 75ms',
            }}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        }
        wordStart = i + 1;
      }
    }
    return chars;
  };

  return (
    <>
      <div
        className="relative w-full min-h-[100px] p-5 rounded-xl font-mono text-lg sm:text-xl leading-relaxed select-none overflow-hidden"
        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '.5px solid var(--border-color)' }}
        onClick={() => inputRef.current?.focus()}
        aria-label={`Progress: ${charIndex} dari ${text.length} karakter`}
      >
        {renderText()}

        <textarea
          ref={inputRef}
          className="absolute inset-0 w-full h-full resize-none cursor-text"
          style={{
            opacity: 0, caretColor: 'transparent', background: 'transparent',
            border: 'none', outline: 'none', padding: 0, margin: 0, fontSize: '16px',
          }}
          defaultValue=""
          autoComplete="off" autoCorrect="off" autoCapitalize="off"
          spellCheck="false" data-gramm="false" data-1p-ignore
          inputMode="text"
          onInput={onInput}
        />
      </div>

      {showInput && (
        <div
          className="w-full min-h-[48px] p-3 rounded-xl font-mono text-lg sm:text-xl select-none"
          style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--accent)', opacity: 0.8 }}
          onClick={() => inputRef.current?.focus()}
        >
          {charIndex === 0 ? (
            <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>{placeholder}</span>
          ) : (
            <>
              {text.slice(0, charIndex).split('').map((char, i) => (
                <span key={i} style={{ color: errors.has(i) ? 'var(--wrong)' : 'var(--correct)' }}>
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
              <motion.span
                className="inline-block w-0.5 h-5 align-text-bottom"
                style={{ background: 'var(--accent)' }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
