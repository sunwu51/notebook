'use client'
import React, { useEffect, useRef } from 'react';
import 'asciinema-player/dist/bundle/asciinema-player.css';

const AsciinemaPlayer = ({ src, options }) => {
  const playerRef = useRef(null);
  const hasInitialized = useRef(false);
  useEffect(() => {
    // 动态导入 asciinema-player 以确保它只在客户端加载
    import('asciinema-player').then((asciinemaPlayer) => {
      if (playerRef.current && !hasInitialized.current) {
        asciinemaPlayer.create(src, playerRef.current, options);
        hasInitialized.current = true;
      }
    });
  }, []);

  return <div ref={playerRef} ></div>;
};

export default AsciinemaPlayer;