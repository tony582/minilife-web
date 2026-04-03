import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * PetBoxTeaser — A cute cat-in-a-box sprite animation used as the entry point
 * to the Virtual Pet Dashboard. Randomly cycles through 3 box animations.
 * 
 * Box1: Cat looking left/right in box (12 frames)
 * Box2: Cat waving paw from box (10 frames)
 * Box3: Cat blinking/nodding in box (12 frames)
 */

const BOX_SPRITES = [
  { src: '/pets/pochi/Box1.png', frames: 12 },
  { src: '/pets/pochi/Box2.png', frames: 10 },
  { src: '/pets/pochi/Box3.png', frames: 12 },
];

const FRAME_W = 64;
const FRAME_H = 64;
const ANIMATION_SPEED = 150; // ms per frame

export default function PetBoxTeaser({ size = 120, onClick }) {
  const canvasRef = useRef(null);
  const [images, setImages] = useState([]);
  const stateRef = useRef({
    currentSprite: 0,
    currentFrame: 0,
    lastFrameTime: 0,
    pauseTimer: 0,
    isPaused: false,
  });

  // Preload all box sprite sheets
  useEffect(() => {
    const loaded = [];
    let count = 0;
    BOX_SPRITES.forEach((sprite, i) => {
      const img = new Image();
      img.onload = () => {
        loaded[i] = img;
        count++;
        if (count === BOX_SPRITES.length) {
          setImages([...loaded]);
        }
      };
      img.src = sprite.src;
    });
  }, []);

  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext('2d');
    const s = stateRef.current;

    if (!s.lastFrameTime) s.lastFrameTime = timestamp;
    const dt = timestamp - s.lastFrameTime;

    if (s.isPaused) {
      s.pauseTimer -= dt;
      if (s.pauseTimer <= 0) {
        s.isPaused = false;
        // Pick a new random animation
        s.currentSprite = Math.floor(Math.random() * BOX_SPRITES.length);
        s.currentFrame = 0;
      }
    } else if (dt >= ANIMATION_SPEED) {
      s.lastFrameTime = timestamp;
      s.currentFrame++;

      const spriteData = BOX_SPRITES[s.currentSprite];
      if (s.currentFrame >= spriteData.frames) {
        // Animation finished — pause briefly then switch
        s.currentFrame = 0;
        s.isPaused = true;
        s.pauseTimer = 1500 + Math.random() * 2000; // 1.5-3.5s pause
      }
    }

    // Draw
    const scale = size / FRAME_H;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const img = images[s.currentSprite];
    if (img) {
      const sx = s.currentFrame * FRAME_W;
      ctx.drawImage(
        img,
        sx, 0, FRAME_W, FRAME_H,
        0, 0, FRAME_W * scale, FRAME_H * scale
      );
    }

    requestAnimationFrame(animate);
  }, [images, size]);

  useEffect(() => {
    if (images.length === 0) return;
    const id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [animate, images]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        imageRendering: 'pixelated',
        cursor: 'pointer',
      }}
    />
  );
}
