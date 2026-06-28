'use client';

import { motion, AnimatePresence } from 'framer-motion';

const countColors: Record<string | number, string> = {
  3: '#fbbf24', 2: '#f97316', 1: '#f87171', 'GO!': 'var(--correct)',
};

export default function CountdownOverlay({ sec, showGo }: {
  sec: number;
  showGo: boolean;
}) {
  const display = showGo ? 'GO!' : sec;
  const color = countColors[display] ?? 'var(--text-primary)';

  return (
    <motion.div
      className="flex-1 flex items-center justify-center"
      style={{ background: 'var(--bg-primary)' }}
      animate={{ backgroundColor: [color + '22', 'transparent', color + '22'] }}
      transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
    >
      {/* Blur backdrop overlay */}
      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />

      <AnimatePresence mode="wait">
        {showGo ? (
          <motion.div
            key="go"
            className="text-center relative z-10"
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <motion.div
              className="text-8xl font-bold font-sans"
              style={{ color: 'var(--correct)' }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
            >
              🥚
            </motion.div>
            <motion.div
              className="text-8xl font-bold font-sans mt-2"
              style={{ color: 'var(--correct)' }}
              initial={{ scale: 2 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              GO!
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key={sec}
            className="text-8xl font-bold font-sans relative z-10"
            style={{ color }}
            initial={{ scale: 1.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {sec}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
