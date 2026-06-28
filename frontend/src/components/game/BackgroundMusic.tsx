'use client';

const YT_ID = 'JJCFQtTPq_8';

export default function BackgroundMusic({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <iframe
      src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&controls=0&loop=1&playlist=${YT_ID}`}
      style={{ display: 'none' }}
      allow="autoplay"
      title="bg-music"
    />
  );
}
