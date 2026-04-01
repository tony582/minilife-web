import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { getStageData, SPECIES_REGISTRY } from '../../data/petSpecies';

// =========================================================
// 🚀 SPRITE ONLY PET ENGINE (Powered by CatMegaBundle)
// =========================================================
const PixelPetEngine = forwardRef(
  (
    {
      width = 240,
      height = 180,
      onStateChange,
      onPetClick,
      isSick = false,
      isSleeping = false,
      isDirty = false,
      satiety = 50,
      species = 'mochi',
      activityMult = 1.0,
      bondLevel = 1,
    },
    ref,
  ) => {
    const requestRef = useRef();

    const gameState = useRef({
      screenW: width,
      screenH: height,
      floorY: height * 0.75,
      cat: {
        x: width / 2,
        y: height * 0.75,
        dx: 0,
        state: "idle",
        timer: 2000,
        bounceY: 0,
        facingLeft: false,
        frameKey: "idle", // 'idle', 'run', 'eat', 'sleep', 'sick', 'dance', 'wait', 'cry'
      },
      items: [],
      lastTime: 0,
    });

    const [, setTick] = useState(0);

    // Dynamic stage data based on species + bond level
    const speciesData = SPECIES_REGISTRY[species] || SPECIES_REGISTRY['mochi'];
    
    // Get the current spritesheet config
    const spriteConfig = speciesData?.spriteSheets;

    // Preload sprite images into browser cache
    useEffect(() => {
      if (spriteConfig) {
        Object.values(spriteConfig).forEach(sheet => {
          const img = new Image();
          img.src = sheet.src;
        });
      }
    }, [spriteConfig]);

    useEffect(() => {
      gameState.current.screenW = width;
      gameState.current.screenH = height;
      gameState.current.floorY = height * 0.75;
      gameState.current.cat.y = height * 0.75;
      
      const leftBound = width * 0.25;
      const rightBound = width * 0.75;
      if (gameState.current.cat.x > rightBound) gameState.current.cat.x = rightBound;
      if (gameState.current.cat.x < leftBound) gameState.current.cat.x = leftBound;
    }, [width, height]);

    const updateGame = useCallback(
      (time) => {
        if (!gameState.current.lastTime) gameState.current.lastTime = time;
        const dt = time - gameState.current.lastTime;
        gameState.current.lastTime = time;
        const state = gameState.current;
        const cat = state.cat;

        // --- 动画与 AI 状态机 ---
        if (isSick && cat.state !== "eating") {
          cat.state = "sick";
          cat.frameKey = "sick";
          cat.dx = 0;
          cat.bounceY = 0;
        } else if (isSleeping) {
          cat.state = "sleeping";
          cat.frameKey = "sleep";
          cat.dx = 0;
          cat.bounceY = 0;
          cat.x = state.screenW * 0.70; // Map directly onto pixel bed
        } else {
          // Normal states
          if (cat.state === "idle") {
            cat.timer -= dt;
            cat.bounceY = 0;
            cat.frameKey = "idle";

            if (cat.timer <= 0) {
              if (state.items.length > 0) {
                cat.state = "walk_to_target";
              } else {
                const roll = Math.random();
                const wanderChance = 0.35 * activityMult;
                if (roll < wanderChance) {
                  cat.state = "wander";
                  cat.dx = (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.04) * activityMult;
                  cat.timer = 1500 + Math.random() * 3000;
                } else if (roll < 0.50) {
                  cat.state = "yawning";
                  cat.timer = 1500;
                  cat.frameKey = "wait"; // mapping to wait animation
                } else if (roll < 0.65) {
                  cat.state = "staring";
                  cat.timer = 2500;
                  cat.facingLeft = true;
                  cat.frameKey = "idle";
                } else if (roll < 0.78) {
                  cat.state = "grooming";
                  cat.timer = 2000;
                  cat.frameKey = "wait";
                } else if (roll < 0.85) {
                  cat.state = "chase_tail";
                  cat.timer = 2500;
                  cat.frameKey = "run";
                } else {
                  cat.timer = 1000 + Math.random() * 2000;
                }
              }
            }
          } else if (cat.state === "sleeping") {
            cat.frameKey = "sleep";
            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "bathing") {
            cat.frameKey = "wait"; // Mochi waits in bathtub
            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "wander" || cat.state === "walk_to_target") {
            cat.frameKey = "run"; // mapping to run (excited)

            if (cat.state === "wander") {
              cat.x += cat.dx * dt;
              cat.facingLeft = cat.dx < 0;

              const leftBound = state.screenW * 0.25;
              const rightBound = state.screenW * 0.75;
              if (cat.x < leftBound) { cat.x = leftBound; cat.dx *= -1; cat.facingLeft = false; }
              if (cat.x > rightBound) { cat.x = rightBound; cat.dx *= -1; cat.facingLeft = true; }

              cat.timer -= dt;
              if (state.items.length > 0) {
                cat.state = "walk_to_target";
              } else if (cat.timer <= 0) {
                cat.state = "idle";
                cat.timer = 1000 + Math.random() * 2000;
              }
            } else {
              const target = state.items[0];
              if (!target) { cat.state = "idle"; return; }

              const isFoodTarget = target.type === "hiddenFood";
              const targetX = isFoodTarget ? target.x + 40 : target.x;
              const dir = targetX - cat.x;
              cat.facingLeft = dir < 0;

              if (Math.abs(dir) > 5) {
                let speed = 0.08;
                if (isFoodTarget) {
                  speed = 0.45 - (satiety / 100) * 0.3;
                } else {
                  speed = 0.04 + (satiety / 100) * 0.08;
                }
                cat.dx = Math.sign(dir) * speed;
                cat.x += cat.dx * dt;
              } else {
                cat.state = isFoodTarget ? "eating" : "playing";
                cat.timer = isFoodTarget ? 3000 : 3000;
                cat.frameKey = isFoodTarget ? "eat" : "dance";
                state.items.shift();
                if (onStateChange) onStateChange(cat.state);
              }
            }
          } else if (cat.state === "eating") {
            cat.timer -= dt;
            cat.frameKey = "eat";
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "playing") {
            cat.timer -= dt;
            cat.frameKey = "dance"; // Cat plays wildly
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "yawning" || cat.state === "staring" || cat.state === "grooming" || cat.state === "chase_tail") {
             // Catch all fallbacks based on timer
             cat.timer -= dt;
             // Only update facing if chase_tail
             if(cat.state === "chase_tail") {
                const spinCycle = Math.floor(time / 200) % 4;
                cat.facingLeft = spinCycle < 2;
             }
             if (cat.timer <= 0) {
               cat.state = "idle";
               cat.timer = 1500 + Math.random() * 1500;
             }
          }
        }

        setTick((t) => t + 1);
        requestRef.current = requestAnimationFrame(updateGame);
      },
      [width, height, onStateChange, satiety, activityMult],
    );

    useEffect(() => {
      requestRef.current = requestAnimationFrame(updateGame);
      return () => cancelAnimationFrame(requestRef.current);
    }, [updateGame]);

    // ==========================
    // EXPOSED IMPERATIVE API
    // ==========================
    useImperativeHandle(ref, () => ({
      feed: (x) => {
        // Drop food somewhere on the allowed floor bounds
        const leftBound = gameState.current.screenW * 0.25;
        const rightBound = gameState.current.screenW * 0.75;
        gameState.current.items.push({
          id: Math.random(),
          type: "hiddenFood",
          x: x !== undefined ? x : leftBound + Math.random() * (rightBound - leftBound),
          y: gameState.current.cat.y,
          dy: 0,
        });
      },
      play: () => {
        // Drop a random toy as an invisible target for the cat to run to
        const leftBound = gameState.current.screenW * 0.25;
        const rightBound = gameState.current.screenW * 0.75;
        gameState.current.items.push({
           id: Math.random(),
           type: "hiddenToy",
           x: leftBound + Math.random() * (rightBound - leftBound),
           y: gameState.current.cat.y,
           dy: 0,
        });
      },
      bathe: () => {
        gameState.current.cat.state = "bathing";
        gameState.current.cat.timer = 3000;
        if (onStateChange) onStateChange("bathing");
      },
      sleep: () => {
        gameState.current.cat.state = "sleeping";
        gameState.current.cat.timer = 5000;
        if (onStateChange) onStateChange("sleeping");
      },
      triggerHeart: () => {
        // Maybe trigger cry or dance depending on some input, but doing a no-op is fine!
      },
      heal: () => {
        gameState.current.cat.state = "idle";
        gameState.current.cat.timer = 2000;
      },
    }));

    // =========================================================
    // 🎨 RENDER — Pure Sprite Engine
    // =========================================================
    const state = gameState.current;

    return (
      <div
        className="relative overflow-hidden pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      >
        {/* ITEMS (Toys) */}
        {state.items.map((item) => (
          item.type === 'hiddenToy' ? (
            <div
              key={item.id}
              className="absolute z-10 bottom-0"
              style={{
                left: item.x,
                bottom: '25%', // Roughly floor level
                width: 32,
                height: 32,
                backgroundImage: 'url(/pets/items/PinkBall-Sheet.png)',
                backgroundSize: '128px 32px', // 4 frames of 32x32
                backgroundPosition: `-${Math.floor(Date.now() / 150) % 4 * 32}px 0`,
                imageRendering: 'pixelated',
                transform: 'translate(-50%, 0)',
              }}
            />
          ) : null
        ))}

        {/* PET */}
        <div
          className="absolute z-20 origin-bottom cursor-pointer drop-shadow-lg"
          style={{
            left: state.cat.x,
            top: state.cat.y,
            willChange: "transform",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onPetClick) onPetClick({ x: state.cat.x, y: state.cat.y });
          }}
        >
          {spriteConfig && (() => {
            const frameKey = state.cat.frameKey || 'idle';
            const sheet = spriteConfig[frameKey] || spriteConfig.idle;
            if (!sheet) return null;
            
            const frameW = sheet.frameW || 32;
            const frameH = sheet.frameH || 32;
            // Native room is 512px. The container scales it to state.screenW.
            // Responsive scale keeps the cat visually cohesive across all device widths.
            const baseScale = 2.5; // Base visual multiplier relative to original pixel art
            const responsiveMultiplier = state.screenW / 512;
            const scale = frameH > 100 ? 1 : (baseScale * responsiveMultiplier);

            const displayWidth = frameW * scale;
            const displayHeight = frameH * scale;
            
            // For eating, sick and dance we can speed it up or slow it down
            let animationSpeed = 120;
            if (frameKey === "sick") animationSpeed = 200;
            else if (frameKey === "run" || frameKey === "dance") animationSpeed = 100;
            
            const frameIndex = Math.floor(Date.now() / animationSpeed) % sheet.frames;
            
            return (
              <div style={{
                width: displayWidth,
                height: displayHeight,
                overflow: 'hidden',
                backgroundImage: `url(${sheet.src})`,
                backgroundSize: `${sheet.frames * displayWidth}px ${displayHeight}px`,
                backgroundPosition: `-${frameIndex * displayWidth}px 0`,
                backgroundRepeat: 'no-repeat',
                imageRendering: 'pixelated',
                transform: `translate(-${displayWidth / 2}px, -${displayHeight + state.cat.bounceY}px) scaleX(${state.cat.facingLeft ? -1 : 1})`,
                backfaceVisibility: 'hidden',
              }} />
            );
          })()}
        </div>
      </div>
    );
  },
);

export default PixelPetEngine;
