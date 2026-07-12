'use client';

import { motion } from 'framer-motion';

interface SpeedHUDProps {
  wpm: number;
  accuracy: number;
  streakCount: number;
  pbDelta: number | null;
  maxWpm?: number;
}

export default function SpeedHUD({ wpm, accuracy, streakCount, pbDelta, maxWpm = 150 }: SpeedHUDProps) {
  const totalArcLen = 188.5;
  const wpmFill = totalArcLen * Math.min(wpm / maxWpm, 1);
  const wpmColor = wpm < 30 ? 'var(--wrong)' : wpm < 70 ? 'var(--accent-yellow)' : 'var(--correct)';

  const totalRingLen = 226.2;
  const accFill = totalRingLen * (accuracy / 100);
  const accColor = accuracy < 80 ? 'var(--wrong)' : accuracy < 95 ? 'var(--accent-yellow)' : 'var(--correct)';

  return (
    <div className="flex items-center gap-4 flex-wrap justify-center">
      {/* Speedometer */}
      <div className="text-center">
        <svg width="140" height="86" viewBox="0 0 140 86">
          <path d="M 10 76 A 60 60 0 0 0 130 76"
            fill="none" stroke="var(--bg-tertiary)" strokeWidth="10" strokeLinecap="round" />
          <motion.path
            d="M 10 76 A 60 60 0 0 0 130 76"
            fill="none" stroke={wpmColor} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${wpmFill} ${totalArcLen}`}
            animate={{ strokeDasharray: `${wpmFill} ${totalArcLen}` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
          />
          <text x="10" y="86" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">0</text>
          <text x="70" y="12" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">75</text>
          <text x="130" y="86" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="var(--font-mono)">150</text>
          <text x="70" y="62" textAnchor="middle" fontSize="24" fontWeight="700"
            fill={wpmColor} fontFamily="var(--font-mono)">{wpm}</text>
          <text x="70" y="76" textAnchor="middle" fontSize="9" fontWeight="600"
            fill="var(--text-muted)" fontFamily="var(--font-sans)">WPM</text>
        </svg>
        <p className="text-[9px] font-sans font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Kecepatan</p>
      </div>

      {/* Accuracy ring */}
      <div className="text-center">
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r="34" fill="none" stroke="var(--bg-tertiary)" strokeWidth="7" />
          <motion.circle
            cx="45" cy="45" r="34" fill="none" stroke={accColor} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={`${accFill} ${totalRingLen}`}
            animate={{ strokeDasharray: `${accFill} ${totalRingLen}` }}
            transition={{ type: 'spring', stiffness: 80, damping: 20 }}
            transform="rotate(-90 45 45)"
          />
          <text x="45" y="41" textAnchor="middle" fontSize="15" fontWeight="700"
            fill={accColor} fontFamily="var(--font-mono)">{accuracy}%</text>
          <text x="45" y="54" textAnchor="middle" fontSize="8" fontWeight="600"
            fill="var(--text-muted)" fontFamily="var(--font-sans)">akurasi</text>
        </svg>
        <p className="text-[9px] font-sans font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Akurasi</p>
      </div>

      {/* Streak + PB delta */}
      <div className="flex flex-col gap-2">
        {streakCount > 2 && (
          <motion.div
            className="rounded-2xl px-4 py-2 text-center"
            style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="font-mono text-xl font-bold" style={{ color: 'var(--accent-yellow)' }}>
              {streakCount}x
            </div>
            <div className="text-[9px] font-sans font-medium" style={{ color: 'var(--text-muted)' }}>
              kata benar
            </div>
          </motion.div>
        )}

        {pbDelta !== null && (
          <div className="rounded-2xl px-4 py-2" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}>
            <div className="text-[9px] font-sans font-medium mb-1" style={{ color: 'var(--text-muted)' }}>vs Personal Best</div>
            <div className="text-sm font-bold font-mono"
              style={{ color: pbDelta >= 0 ? 'var(--correct)' : 'var(--wrong)' }}>
              {pbDelta >= 0 ? '+' : ''}{pbDelta} WPM
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
