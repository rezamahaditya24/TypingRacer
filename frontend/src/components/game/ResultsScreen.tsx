'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useRace } from '@/hooks/useRace';
import { DINO_LIST, DINO_COLORS } from '@/lib/constants';
import { DinoSVG, TrophyIcon, CrownIcon, MedalGold, MedalSilver, MedalBronze, ConfettiEffect } from '@/lib/assets';

const API_HOST = (process.env.NEXT_PUBLIC_WS_HOST || 'ws://localhost:3001').replace(/^ws/, 'http');

function PositionPodium({ results }: { results: { id: string; name: string; dino: string; rank: number; wpm: number; accuracy: number }[] }) {
  const podiumOrder = [2, 1, 3];
  const heights = ['h-20', 'h-28', 'h-16'];
  const medals = [MedalSilver, MedalGold, MedalBronze];

  return (
    <div className="flex items-end gap-3 justify-center">
      {podiumOrder.map((rank, idx) => {
        const r = results.find(res => res.rank === rank);
        if (!r) return <div key={rank} className="w-20" />;
        const MedalComponent = medals[idx];
        const color = DINO_COLORS[r.dino as keyof typeof DINO_COLORS] || 'var(--accent)';
        const isWinner = rank === 1;

        return (
          <motion.div
            key={r.id}
            className={`flex flex-col items-center justify-end gap-2 w-20 sm:w-24 ${heights[idx]} rounded-t-3xl p-3`}
            style={{
              background: isWinner
                ? `linear-gradient(180deg, ${color}33, var(--bg-secondary))`
                : 'var(--bg-tertiary)',
              border: isWinner ? `2px solid ${color}` : '1px solid var(--border-color)',
              boxShadow: isWinner ? `0 0 30px ${color}33, var(--card-shadow)` : 'var(--card-shadow)',
            }}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + idx * 0.15, type: 'spring', stiffness: 100, damping: 15 }}
          >
            <MedalComponent />
            <DinoSVG type={r.dino} size={32} />
            <span className="text-[10px] font-bold font-sans text-center leading-tight" style={{ color: 'var(--text-primary)' }}>
              {r.name.length > 8 ? r.name.slice(0, 7) + '..' : r.name}
            </span>
            <span className="text-[10px] font-bold font-mono" style={{ color: isWinner ? color : 'var(--text-secondary)' }}>
              {r.wpm} WPM
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function ResultsScreen({ race, isHost, onRematch, onPlayAgain, wpmHistory, previousBestWpm, token }: {
  race: ReturnType<typeof useRace>;
  isHost: boolean;
  onRematch: () => void;
  onPlayAgain: () => void;
  wpmHistory?: { time: number; wpm: number }[];
  previousBestWpm?: number;
  token?: string | null;
}) {
  const [rematchSent, setRematchSent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(true), 300);
    return () => clearTimeout(t);
  }, []);

  const winner = race.results.find(r => r.rank === 1);
  const myResult = race.results.find(r => r.id === race.playerId);

  const handleShare = async () => {
    if (!myResult || !token) return;
    try {
      const r = await fetch(`${API_HOST}/api/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ wpm: myResult.wpm, accuracy: myResult.accuracy, textId: race.text.slice(0, 20) }),
      });
      const data = await r.json();
      if (data.id) setShareLink(data.id);
    } catch {}
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-4 gap-6" style={{ minHeight: '90vh' }}>
      <ConfettiEffect active={showConfetti} />

      {/* Winner announcement */}
      {winner && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
          >
            <TrophyIcon size={56} className="mx-auto mb-2" />
          </motion.div>
          <div className="text-2xl font-bold font-display mt-1" style={{ color: 'var(--accent-yellow)' }}>
            {winner.name} menang!
          </div>
          <div className="text-sm font-sans mt-1" style={{ color: 'var(--text-secondary)' }}>
            {winner.wpm} WPM · {winner.accuracy}% akurasi
          </div>
        </motion.div>
      )}

      <motion.h1
        className="text-2xl sm:text-3xl font-bold font-display"
        style={{ color: 'var(--accent)' }}
        initial={{ scale: 0, rotate: -5 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12 }}
      >
        Race Complete!
      </motion.h1>

      {/* XP banner */}
      {token && myResult && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 text-sm font-bold font-sans py-2 px-4 rounded-full"
          style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(74,222,128,.2)' }}
        >
          ✨ +{(myResult as any).xpEarned || 0} XP
        </motion.div>
      )}

      {/* Podium */}
      <PositionPodium results={race.results} />

      {/* Results list */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        {race.results.map((r, i) => {
          const dinoColor = DINO_COLORS[r.dino as keyof typeof DINO_COLORS] || 'var(--accent)';
          const isWinner = r.rank === 1;
          return (
            <motion.div
              key={r.id}
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1, duration: 0.35, ease: 'easeOut' }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{
                  background: 'var(--bg-secondary)',
                  border: isWinner ? `2px solid ${dinoColor}` : '1px solid var(--border-color)',
                  boxShadow: isWinner ? `0 0 20px ${dinoColor}22` : 'var(--card-shadow)',
                }}
              >
                <span
                  className="text-xl font-bold font-display w-8 text-center"
                  style={{ color: isWinner ? dinoColor : 'var(--text-muted)' }}
                >
                  #{r.rank}
                </span>
                <DinoSVG type={r.dino} size={32} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold font-sans text-sm" style={{ color: 'var(--text-primary)' }}>
                    {r.name}
                  </div>
                  <div className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {r.wpm} WPM · {r.accuracy}% akurasi · {(r.timeMs / 1000).toFixed(1)}s
                  </div>
                </div>
                {previousBestWpm && r.wpm > previousBestWpm && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.15, type: 'spring' }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold font-sans px-2 py-1 rounded-full"
                    style={{ background: 'rgba(74,222,128,.15)', color: 'var(--correct)', border: '1px solid rgba(74,222,128,.3)' }}
                  >
                    ✦ PB +{r.wpm - previousBestWpm} WPM
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* WPM chart */}
      {wpmHistory && wpmHistory.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-md p-4 rounded-2xl"
          style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
        >
          <h3 className="text-sm font-bold font-display mb-3" style={{ color: 'var(--text-secondary)' }}>
            Kecepatan per 3 Detik
          </h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={wpmHistory}>
              <XAxis
                dataKey="time"
                tick={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 'auto']}
                tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                width={30}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [`${value} WPM`, 'Kecepatan']}
              />
              <Line
                type="monotone"
                dataKey="wpm"
                stroke="var(--accent)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 4, fill: 'var(--accent)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {isHost && (
          <motion.button
            onClick={() => { onRematch(); setRematchSent(true); }}
            disabled={rematchSent}
            className="px-6 py-3 rounded-2xl font-bold font-display transition-all btn-accent disabled:opacity-30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Balapan Ulang
          </motion.button>
        )}
        <motion.button
          onClick={onPlayAgain}
          className="px-6 py-3 rounded-2xl font-bold font-display transition-all btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Main Baru
        </motion.button>
      </div>

      {/* Share */}
      {token && myResult && !shareLink && (
        <button
          onClick={handleShare}
          className="text-xs font-sans font-medium underline flex items-center gap-1"
          style={{ color: 'var(--text-muted)' }}
        >
          Tantang teman
        </button>
      )}

      {shareLink && (
        <div className="text-center">
          <button
            onClick={() => {
              navigator.clipboard.writeText(`Aku baru ${myResult?.wpm} WPM di Dino Dash! Coba kalahin: ${window.location.origin}?challenge=${shareLink}`);
              setShareCopied(true);
            }}
            className="text-xs font-sans underline"
            style={{ color: 'var(--accent)' }}
          >
            {shareCopied ? '✓ Tersalin!' : 'Salin link tantangan'}
          </button>
        </div>
      )}
    </div>
  );
}
