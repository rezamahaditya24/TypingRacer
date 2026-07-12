import { motion } from 'framer-motion';

export function TrophyIcon({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className}>
      <defs>
        <linearGradient id="trophy-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M50 8c-8 0-14 6-14 14v4c-12 2-20 10-22 22-2 10 3 20 12 26 6 4 14 6 24 6s18-2 24-6c9-6 14-16 12-26-2-12-10-20-22-22v-4c0-8-6-14-14-14z" fill="url(#trophy-gold)" />
      <path d="M50 54c-10 0-18-8-18-18s8-18 18-18 18 8 18 18-8 18-18 18z" fill="#fef3c7" />
      <path d="M50 48c-6 0-12-5-12-12s5-12 12-12 12 5 12 12-5 12-12 12z" fill="#f59e0b" />
      <rect x="44" y="62" width="12" height="8" rx="2" fill="#d97706" />
      <rect x="36" y="70" width="28" height="6" rx="3" fill="#b45309" />
      <path d="M38 78c0 6 12 14 12 14s12-8 12-14H38z" fill="url(#trophy-gold)" />
    </svg>
  );
}

export function CrownIcon({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 70" fill="none" className={className}>
      <defs>
        <linearGradient id="crown-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <path d="M10 55l10-40 15 15 15-25 15 25 15-15 10 40H10z" fill="url(#crown-gold)" />
      <circle cx="20" cy="30" r="6" fill="#fef3c7" />
      <circle cx="50" cy="18" r="6" fill="#fef3c7" />
      <circle cx="80" cy="30" r="6" fill="#fef3c7" />
      <rect x="8" y="55" width="84" height="10" rx="3" fill="#b45309" />
      <path d="M30 55c0-6 8-10 20-10s20 4 20 10H30z" fill="#f59e0b" />
      <circle cx="50" cy="50" r="4" fill="#ef4444" />
    </svg>
  );
}

export function CheckeredFlagIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 100" fill="none" className={className}>
      <rect x="10" y="5" width="40" height="50" fill="white" rx="2" />
      {[0,1,2,3,4,5].map(row => 
        [0,1,2,3].map(col => {
          const isBlack = (row + col) % 2 === 0;
          return (
            <rect key={`${row}-${col}`}
              x={10 + col * 10} y={5 + row * 8.33}
              width="10" height="8.33"
              fill={isBlack ? '#1a1a2e' : 'white'}
            />
          );
        })
      )}
      <rect x="8" y="55" width="6" height="40" rx="2" fill="#8B4513" />
      <rect x="12" y="55" width="4" height="40" fill="#A0522D" />
      <path d="M6 55c0-3 4-5 8-5s8 2 8 5H6z" fill="#654321" />
    </svg>
  );
}

export function MedalGold({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="url(#medal-gold)" />
      <circle cx="40" cy="40" r="24" fill="#fef3c7" />
      <circle cx="40" cy="40" r="18" fill="#f59e0b" />
      <text x="40" y="46" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">1</text>
      <path d="M20 60l-8 14 14-4z" fill="#d97706" />
      <path d="M60 60l8 14-14-4z" fill="#d97706" />
      <defs>
        <radialGradient id="medal-gold" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function MedalSilver({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="url(#medal-silver)" />
      <circle cx="40" cy="40" r="24" fill="#f1f5f9" />
      <circle cx="40" cy="40" r="18" fill="#94a3b8" />
      <text x="40" y="46" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">2</text>
      <path d="M20 60l-8 14 14-4z" fill="#64748b" />
      <path d="M60 60l8 14-14-4z" fill="#64748b" />
      <defs>
        <radialGradient id="medal-silver" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function MedalBronze({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <circle cx="40" cy="40" r="30" fill="url(#medal-bronze)" />
      <circle cx="40" cy="40" r="24" fill="#fef3c7" />
      <circle cx="40" cy="40" r="18" fill="#d97706" />
      <text x="40" y="46" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">3</text>
      <path d="M20 60l-8 14 14-4z" fill="#92400e" />
      <path d="M60 60l8 14-14-4z" fill="#92400e" />
      <defs>
        <radialGradient id="medal-bronze" cx="0.4" cy="0.4" r="0.6">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const dinoColors: Record<string, string> = {
  't-rex': '#f97316',
  'triceratops': '#22d3ee',
  'raptor': '#4ade80',
  'stegosaurus': '#fbbf24',
  'brontosaurus': '#a78bfa',
};

export function DinoSVG({ type, size = 48, animated = false }: { type: string; size?: number; animated?: boolean }) {
  const color = dinoColors[type] || '#4ade80';
  const darkColor = color + 'cc';
  const lightColor = color + '44';

  const animProps = animated ? {
    animate: { y: [0, -2, 0] },
    transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' as const },
  } : {};

  const Wrapper = animated ? motion.svg : 'svg';

  switch (type) {
    case 't-rex':
      return (
        <Wrapper width={size} height={size} viewBox="0 0 100 100" fill="none" {...(animated ? animProps : {})}>
          <ellipse cx="50" cy="65" rx="25" ry="20" fill={color} />
          <ellipse cx="50" cy="65" rx="25" ry="20" fill={darkColor} opacity={0.3} />
          <rect x="48" y="78" width="6" height="16" rx="3" fill={darkColor} />
          <rect x="56" y="75" width="6" height="14" rx="3" fill={color} />
          <rect x="30" y="60" width="32" height="10" rx="4" fill={color} />
          <ellipse cx="50" cy="40" rx="18" ry="20" fill={color} />
          <circle cx="44" cy="35" r="3" fill="white" />
          <circle cx="56" cy="35" r="3" fill="white" />
          <circle cx="44" cy="35" r="1.5" fill="#1a1a2e" />
          <circle cx="56" cy="35" r="1.5" fill="#1a1a2e" />
          <path d="M38 42 Q42 48 50 48 Q58 48 62 42" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M65 18 Q75 5 82 15 Q88 25 78 28 L72 45" fill={color} />
          <path d="M65 18 Q75 5 82 15 Q88 25 78 28" fill={darkColor} opacity={0.5} />
          <circle cx="78" cy="18" r="2" fill={darkColor} />
          <rect x="15" y="65" width="14" height="6" rx="3" fill={color} />
          <circle cx="22" cy="68" r="2" fill={darkColor} />
        </Wrapper>
      );
    case 'triceratops':
      return (
        <Wrapper width={size} height={size} viewBox="0 0 100 100" fill="none" {...(animated ? animProps : {})}>
          <ellipse cx="55" cy="65" rx="28" ry="20" fill={color} />
          <ellipse cx="55" cy="65" rx="28" ry="20" fill={darkColor} opacity={0.3} />
          <rect x="53" y="78" width="6" height="16" rx="3" fill={darkColor} />
          <rect x="62" y="75" width="6" height="14" rx="3" fill={color} />
          <rect x="32" y="60" width="32" height="10" rx="4" fill={color} />
          <ellipse cx="52" cy="38" rx="22" ry="18" fill={color} />
          <path d="M30 20 Q40 5 55 10 Q70 15 75 30" fill={lightColor} />
          <path d="M55 10 Q70 15 75 30 Q68 18 55 12z" fill={darkColor} />
          <path d="M38 26 L30 18 L28 26" stroke={darkColor} strokeWidth="2" fill={lightColor} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M48 22 L44 14 L42 22" stroke={darkColor} strokeWidth="2" fill={lightColor} strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="46" cy="34" r="3" fill="white" />
          <circle cx="58" cy="34" r="3" fill="white" />
          <circle cx="46" cy="34" r="1.5" fill="#1a1a2e" />
          <circle cx="58" cy="34" r="1.5" fill="#1a1a2e" />
          <path d="M40 42 Q44 47 52 47 Q60 47 64 42" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="15" y="68" width="14" height="6" rx="3" fill={color} />
          <circle cx="22" cy="71" r="2" fill={darkColor} />
        </Wrapper>
      );
    case 'raptor':
      return (
        <Wrapper width={size} height={size} viewBox="0 0 100 100" fill="none" {...(animated ? animProps : {})}>
          <ellipse cx="48" cy="65" rx="22" ry="16" fill={color} />
          <ellipse cx="48" cy="65" rx="22" ry="16" fill={darkColor} opacity={0.3} />
          <rect x="28" y="62" width="40" height="8" rx="4" fill={color} />
          <rect x="48" y="75" width="5" height="18" rx="2.5" fill={darkColor} />
          <rect x="55" y="72" width="5" height="16" rx="2.5" fill={color} />
          <path d="M68 56 L90 50 L75 60" fill={color} />
          <path d="M68 56 L90 50 L75 60" fill={darkColor} opacity={0.4} />
          <ellipse cx="48" cy="38" rx="18" ry="22" fill={color} />
          <path d="M40 10 Q45 25 40 35" stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M40 10 Q38 5 35 8" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="42" cy="34" r="3" fill="white" />
          <circle cx="54" cy="34" r="3" fill="white" />
          <circle cx="42" cy="34" r="1.5" fill="#1a1a2e" />
          <circle cx="54" cy="34" r="1.5" fill="#1a1a2e" />
          <path d="M36 42 Q42 48 50 48 Q58 48 62 42" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M60 30 L72 25 L68 32" fill={darkColor} />
          <rect x="12" y="65" width="14" height="6" rx="3" fill={color} />
          <circle cx="19" cy="68" r="2" fill={darkColor} />
        </Wrapper>
      );
    case 'stegosaurus':
      return (
        <Wrapper width={size} height={size} viewBox="0 0 100 100" fill="none" {...(animated ? animProps : {})}>
          <ellipse cx="55" cy="68" rx="30" ry="20" fill={color} />
          <ellipse cx="55" cy="68" rx="30" ry="20" fill={darkColor} opacity={0.3} />
          <rect x="20" y="40" width="8" height="14" rx="3" fill={color} />
          <rect x="34" y="34" width="8" height="18" rx="3" fill={color} />
          <rect x="48" y="30" width="8" height="22" rx="3" fill={color} />
          <rect x="62" y="34" width="8" height="18" rx="3" fill={color} />
          <rect x="76" y="40" width="8" height="14" rx="3" fill={color} />
          {[20,34,48,62,76].map((x) => (
            <rect key={x} x={x+1} y={40} width="6" height="14" rx="2" fill={lightColor} />
          ))}
          <rect x="54" y="80" width="6" height="14" rx="3" fill={darkColor} />
          <rect x="62" y="78" width="6" height="12" rx="3" fill={color} />
          <ellipse cx="50" cy="48" rx="20" ry="18" fill={color} />
          <circle cx="44" cy="44" r="3" fill="white" />
          <circle cx="56" cy="44" r="3" fill="white" />
          <circle cx="44" cy="44" r="1.5" fill="#1a1a2e" />
          <circle cx="56" cy="44" r="1.5" fill="#1a1a2e" />
          <path d="M38 50 Q42 54 50 54 Q58 54 62 50" stroke={darkColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <rect x="14" y="70" width="14" height="6" rx="3" fill={color} />
          <circle cx="21" cy="73" r="2" fill={darkColor} />
        </Wrapper>
      );
    case 'brontosaurus':
      return (
        <Wrapper width={size} height={size} viewBox="0 0 100 100" fill="none" {...(animated ? animProps : {})}>
          <ellipse cx="60" cy="70" rx="30" ry="18" fill={color} />
          <ellipse cx="60" cy="70" rx="30" ry="18" fill={darkColor} opacity={0.3} />
          <rect x="20" y="62" width="50" height="12" rx="6" fill={color} />
          <rect x="60" y="82" width="6" height="14" rx="3" fill={darkColor} />
          <rect x="68" y="80" width="6" height="12" rx="3" fill={color} />
          <path d="M30 55 Q28 20 40 12 Q52 4 55 20" fill={color} stroke={color} strokeWidth="2" />
          <path d="M30 55 Q28 20 40 12 Q52 4 55 20" fill={darkColor} opacity={0.2} />
          <circle cx="44" cy="16" r="8" fill={color} />
          <circle cx="42" cy="14" r="2.5" fill="white" />
          <circle cx="46" cy="14" r="2.5" fill="white" />
          <circle cx="42" cy="14" r="1.2" fill="#1a1a2e" />
          <circle cx="46" cy="14" r="1.2" fill="#1a1a2e" />
          <path d="M38 20 Q42 24 48 24" stroke={darkColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <rect x="10" y="72" width="16" height="6" rx="3" fill={color} />
          <circle cx="18" cy="75" r="2" fill={darkColor} />
        </Wrapper>
      );
    default:
      return null;
  }
}

export function ConfettiParticle({ color, delay, index }: { color: string; delay: number; index: number }) {
  const size = 6 + Math.random() * 8;
  const startX = Math.random() * 100;
  const duration = 2 + Math.random() * 2;

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: -20,
        width: size,
        height: size * 0.6,
        borderRadius: 2,
        background: color,
        zIndex: 9999,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ y: '100vh', rotate: 720 + Math.random() * 360, opacity: 0 }}
      transition={{ duration, delay, repeat: Infinity, repeatDelay: duration + Math.random() }}
    />
  );
}

export function ConfettiEffect({ active }: { active: boolean }) {
  if (!active) return null;

  const colors = ['#4ade80', '#22d3ee', '#fbbf24', '#f97316', '#f87171', '#a78bfa', '#f472b6', '#fbbf24'];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {colors.map((color, i) => (
        <ConfettiParticle key={i} color={color} delay={i * 0.1} index={i} />
      ))}
    </div>
  );
}
