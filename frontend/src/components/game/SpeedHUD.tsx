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
  const wpmColor = wpm < 30 ? 'var(--wrong)' : wpm < 70 ? '#fbbf24' : 'var(--correct)';

  const totalRingLen = 226.2;
  const accFill = totalRingLen * (accuracy / 100);
  const accColor = accuracy < 80 ? 'var(--wrong)' : accuracy < 95 ? '#fbbf24' : 'var(--correct)';

  return (
    <div className="flex items-center gap-4 flex-wrap">
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
          <text x="8" y="86" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="inherit">0</text>
          <text x="70" y="12" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="inherit">75</text>
          <text x="132" y="86" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="inherit">150</text>
          <text x="70" y="62" textAnchor="middle" fontSize="24" fontWeight="500"
            fill={wpmColor} fontFamily="monospace">{wpm}</text>
          <text x="70" y="76" textAnchor="middle" fontSize="9"
            fill="var(--text-muted)" fontFamily="inherit">WPM</text>
        </svg>
        <p className="text-[9px]" style={{ color: 'var(--text-muted)', marginTop: -2 }}>Kecepatan</p>
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
          <text x="45" y="41" textAnchor="middle" fontSize="15" fontWeight="500"
            fill={accColor} fontFamily="monospace">{accuracy}%</text>
          <text x="45" y="54" textAnchor="middle" fontSize="8"
            fill="var(--text-muted)" fontFamily="inherit">akurasi</text>
        </svg>
        <p className="text-[9px]" style={{ color: 'var(--text-muted)', marginTop: -2 }}>Akurasi</p>
      </div>

      {/* Streak + PB delta */}
      <div className="flex flex-col gap-2">
        {streakCount > 2 && (
          <motion.div
            className="rounded-lg px-3 py-2 text-center"
            style={{ background: 'var(--bg-tertiary)' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="font-mono text-xl font-medium" style={{ color: '#fbbf24' }}>
              {streakCount}x
            </div>
            <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
              kata benar berturut
            </div>
          </motion.div>
        )}

        {pbDelta !== null && (
          <div className="rounded-lg px-3 py-2" style={{ background: 'var(--bg-tertiary)' }}>
            <div className="text-[9px] mb-1" style={{ color: 'var(--text-muted)' }}>vs Personal Best</div>
            <div className="text-sm font-medium"
              style={{ color: pbDelta >= 0 ? 'var(--correct)' : 'var(--wrong)' }}>
              {pbDelta >= 0 ? '+' : ''}{pbDelta} WPM
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
