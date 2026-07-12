'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { DinoSVG } from '@/lib/assets';

const countColors: Record<string | number, string> = {
  3: '#fbbf24',
  2: '#f97316',
  1: '#f87171',
  'GO!': 'var(--correct)',
};

const countScale: Record<string | number, number> = {
  3: 1,
  2: 1.1,
  1: 1.2,
  'GO!': 1.3,
};

export default function CountdownOverlay({ sec, showGo }: {
  sec: number;
  showGo: boolean;
}) {
  const display = showGo ? 'GO!' : sec;
  const color = countColors[display] ?? 'var(--text-primary)';

  return (
    <motion.div
      className="flex-1 flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg-primary)' }}
    >
      {/* Decorative background dino */}
      <div className="absolute opacity-[0.03] pointer-events-none" style={{ transform: 'scale(3)', bottom: '5%', right: '5%' }}>
        <DinoSVG type="t-rex" size={200} />
      </div>
      <div className="absolute opacity-[0.03] pointer-events-none" style={{ transform: 'scale(2.5)', top: '5%', left: '5%' }}>
        <DinoSVG type="brontosaurus" size={200} />
      </div>

      <div className="absolute inset-0" style={{ backdropFilter: 'blur(4px)' }} />

      <AnimatePresence mode="wait">
        {showGo ? (
          <motion.div
            key="go"
            className="text-center relative z-10 flex flex-col items-center gap-4"
            initial={{ scale: 3, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          >
            <motion.div
              className="text-8xl font-bold font-display"
              style={{ color: 'var(--correct)' }}
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
            >
              <DinoSVG type="raptor" size={80} />
            </motion.div>
            <motion.div
              className="text-7xl sm:text-8xl font-bold font-display"
              style={{ color: 'var(--correct)', textShadow: '0 0 30px rgba(74,222,128,0.5)' }}
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
            className="relative z-10 flex flex-col items-center gap-2"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <motion.span
              className="text-8xl sm:text-9xl font-bold font-display"
              style={{
                color,
                textShadow: `0 0 40px ${color}44`,
              }}
              animate={{
                scale: [countScale[display] || 1, 1],
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              {sec}
            </motion.span>
            <span className="text-sm font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              Bersiap...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
