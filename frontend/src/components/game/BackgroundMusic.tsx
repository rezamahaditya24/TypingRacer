'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT?: {
      Player: any;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_ID = 'JJCFQtTPq_8';

export default function BackgroundMusic({ enabled }: { enabled: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    const onReady = () => {
      if (!window.YT?.Player || !containerRef.current) return;
      if (playerRef.current) return;
      initialized.current = true;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: YT_ID,
        height: '1',
        width: '1',
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playlist: YT_ID,
          enablejsapi: 1,
        },
        events: {
          onReady: (event: any) => {
            event.target.setVolume(20);
            if (enabled) event.target.playVideo();
          },
          onStateChange: (event: any) => {
            if (window.YT?.PlayerState && event.data === window.YT.PlayerState.ENDED) {
              event.target.playVideo();
            }
          },
        },
      });
    };

    if (window.YT?.Player) {
      onReady();
      return;
    }

    window.onYouTubeIframeAPIReady = onReady;

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
        initialized.current = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current) return;
    if (enabled) {
      try { playerRef.current.unMute(); playerRef.current.playVideo(); } catch {}
    } else {
      try { playerRef.current.pauseVideo(); } catch {}
    }
  }, [enabled]);

  return <div ref={containerRef} style={{ display: 'none' }} />;
}
