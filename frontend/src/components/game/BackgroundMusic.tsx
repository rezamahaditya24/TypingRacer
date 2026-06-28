'use client';

import { useEffect, useRef, useCallback } from 'react';

declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

const YT_ID = 'JJCFQtTPq_8';

export default function BackgroundMusic({ enabled }: { enabled: boolean }) {
  const playerRef = useRef<any>(null);
  const apiReadyRef = useRef(false);

  const initPlayer = useCallback(() => {
    if (!apiReadyRef.current || !window.YT) return;
    if (playerRef.current) return;

    const div = document.getElementById('yt-player');
    if (!div) return;

    playerRef.current = new window.YT.Player('yt-player', {
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
          if (window.YT.PlayerState && event.data === window.YT.PlayerState.ENDED) {
            event.target.playVideo();
          }
        },
      },
    });
  }, [enabled]);

  useEffect(() => {
    if (typeof window.YT !== 'undefined' && window.YT.Player) {
      apiReadyRef.current = true;
      initPlayer();
      return;
    }

    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
      initPlayer();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript?.parentNode?.insertBefore(tag, firstScript);
    }
  }, [initPlayer]);

  useEffect(() => {
    if (!playerRef.current) return;
    if (enabled) {
      playerRef.current.unMute();
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [enabled]);

  return (
    <div id="yt-player" style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }} />
  );
}
