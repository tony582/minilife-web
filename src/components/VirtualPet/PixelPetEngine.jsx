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
      bedPosition = null, // { xPct, yPct } from roomConfig
    },
    ref,
  ) => {
    const requestRef = useRef();

    // Keep latest prop values in refs so the rAF game loop never uses stale closures
    const isSleepingRef = useRef(isSleeping);
    const isSickRef = useRef(isSick);
    const bedPositionRef = useRef(bedPosition);
    useEffect(() => { isSleepingRef.current = isSleeping; }, [isSleeping]);
    useEffect(() => { isSickRef.current = isSick; }, [isSick]);
    useEffect(() => { bedPositionRef.current = bedPosition; }, [bedPosition]);

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
      items: [],
      lastTime: 0,
    });
    
    const initSleepRef = useRef(false);

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
      
      const cat = gameState.current.cat;
      
      // If sleeping, re-snap position using the NEW dimensions
      if (cat.state === 'sleeping') {
        const bp = bedPositionRef.current;
        if (bp) {
          cat.x = width * bp.xPct;
          cat.y = height * (1 - bp.yPct);
        } else {
          cat.x = width * 0.5;
          cat.y = height * 0.65;
        }
      } else if (cat.state === 'idle' || cat.state === 'wander' || cat.state === 'walk_to_target' || cat.state === 'walk_to_bed') {
        // Only reset the Y coordinate to the floor if on the floor logically
        cat.y = height * 0.75;
      }
      
      const leftBound = width * 0.25;
      const rightBound = width * 0.75;
      if (cat.state !== 'sleeping') {
        if (cat.x > rightBound) cat.x = rightBound;
        if (cat.x < leftBound) cat.x = leftBound;
      }
    }, [width, height]);

    const updateGame = useCallback(
      (time) => {
        if (!gameState.current.lastTime) gameState.current.lastTime = time;
        const dt = time - gameState.current.lastTime;
        gameState.current.lastTime = time;
        const state = gameState.current;
        const cat = state.cat;

        // --- 动画与 AI 状态机 ---
        const currentSick = isSickRef.current;
        const currentSleeping = isSleepingRef.current;
        const currentBedPos = bedPositionRef.current;

        // Default sleep position when no bed is placed: center of the floor
        const fallbackBedX = state.screenW * 0.5;
        const fallbackBedY = state.screenH * 0.65;

        // Instant teleport on first load if sleeping
        if (!initSleepRef.current) {
          if (currentSleeping) {
            const targetX = currentBedPos ? state.screenW * currentBedPos.xPct : fallbackBedX;
            const targetY = currentBedPos ? state.screenH * (1 - currentBedPos.yPct) : fallbackBedY;
            cat.x = targetX;
            cat.y = targetY;
            cat.state = "sleeping";
            cat.frameKey = "sleep";
            initSleepRef.current = true;
          } else {
            initSleepRef.current = true;
          }
        }

        if (currentSick && cat.state !== "eating") {
          cat.state = "sick";
          cat.frameKey = "sickRun";
          cat.dx = 0;
          cat.bounceY = 0;
        } else if (currentSleeping) {
          if (cat.state !== "sleeping" && cat.state !== "walk_to_bed") {
            // Start walking to bed
            cat.state = "walk_to_bed";
            cat.frameKey = "walk";
            cat.dx = 0;
            cat.bounceY = 0;
          }
          
          if (cat.state === "walk_to_bed") {
            // Calculate bed target position
            const bedX = currentBedPos ? state.screenW * currentBedPos.xPct : fallbackBedX;
            const bedY = currentBedPos ? state.screenH * (1 - currentBedPos.yPct) : fallbackBedY;
            
            const dirX = bedX - cat.x;
            const dirY = bedY - cat.y;
            const dist = Math.sqrt(dirX * dirX + dirY * dirY);
            cat.facingLeft = dirX < 0;
            
            if (dist > 5) {
              const speed = 0.12;
              cat.x += (dirX / dist) * speed * dt;
              cat.y += (dirY / dist) * speed * dt;
              cat.frameKey = "walk";
            } else {
              // Arrived at bed!
              cat.x = bedX;
              cat.y = bedY;
              cat.state = "sleeping";
              cat.frameKey = Math.random() < 0.5 ? "sleep" : "sleep2";
              if (onStateChange) onStateChange("sleeping");
            }
          } else {
            // Already sleeping at bed — keep whichever sleep variant was chosen
            if (cat.frameKey !== "sleep" && cat.frameKey !== "sleep2") cat.frameKey = "sleep";
            cat.dx = 0;
            cat.bounceY = 0;
          }
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
                if (roll < 0.25) {
                  // Gentle wander — cat strolls to a new spot
                  cat.state = "wander";
                  cat.dx = (Math.random() > 0.5 ? 1 : -1) * (0.02 + Math.random() * 0.02) * activityMult;
                  cat.timer = 2000 + Math.random() * 3000;
                } else if (roll < 0.40) {
                  // Look around — just face the other direction
                  cat.facingLeft = !cat.facingLeft;
                  cat.timer = 3000 + Math.random() * 3000;
                } else {
                  // Stay idle — just sit there peacefully
                  cat.timer = 3000 + Math.random() * 5000;
                }
              }
            }
          } else if (cat.state === "sleeping") {
            cat.frameKey = "sleep";
            if (!currentSleeping) {
              cat.state = "idle";
              cat.timer = 2000;
              cat.y = state.floorY;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "bathing") {
            cat.frameKey = "bathe"; // Mochi uses bathe bathtub animation
            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              cat.y = state.floorY;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "wander" || cat.state === "walk_to_target") {
            // Use 'walk' for calm wandering, 'run' for rushing to food
            cat.frameKey = cat.state === "walk_to_target" && state.items[0]?.type === "hiddenFood" ? "run" : "walk";

            if (cat.state === "wander") {
              cat.x += cat.dx * dt;
              cat.y += (state.floorY - cat.y) * 0.005 * dt; // Gradually return to floorY
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
              
              // Move towards exact target.x and target.y
              let targetX = target.x;
              const targetY = target.y !== undefined ? target.y : state.floorY;
              
              if (isFoodTarget) {
                 // The target is the CENTER of the bowl. We must stop 5-6% away from center based on which side the cat is on.
                 const offset = state.screenW * 0.055;
                 targetX = cat.x < target.x ? target.x - offset : target.x + offset;
              }
              
              const dirX = targetX - cat.x;
              const dirY = targetY - cat.y;
              cat.facingLeft = dirX < 0;

              const dist = Math.sqrt(dirX*dirX + dirY*dirY);
              if (dist > 5) {
                let speed = 0.08;
                if (isFoodTarget) {
                  speed = 0.45 - (satiety / 100) * 0.3;
                } else {
                  speed = 0.04 + (satiety / 100) * 0.08;
                }
                cat.dx = (dirX / dist) * speed;
                const dy = (dirY / dist) * speed;
                cat.x += cat.dx * dt;
                cat.y += dy * dt;
              } else {
                cat.x = targetX;
                cat.y = targetY;
                cat.state = isFoodTarget ? "eating" : "playing";
                cat.timer = isFoodTarget ? 3000 : 3000;
                cat.frameKey = isFoodTarget ? "eat" : "dance";
                // Force pet to face the food once arrived
                if (isFoodTarget) {
                   cat.facingLeft = cat.x > target.x;
                }
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
            cat.frameKey = "wait"; // Use chilling anim for play — dance is reserved for click reactions
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "reacting") {
            // Click reaction — plays surprised or excited then returns to idle
            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
            }
          } else if (cat.state === "yawning" || cat.state === "staring" || cat.state === "grooming" || cat.state === "chase_tail") {
             // Catch all fallbacks based on timer
             cat.timer -= dt;
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
      feed: (x, y) => {
        // Drop food at the center-bottom bowl
        gameState.current.items.push({
          id: Math.random(),
          type: "hiddenFood",
          x: x !== undefined ? x : gameState.current.screenW * 0.40,
          y: y !== undefined ? y : gameState.current.screenH * 0.82, // Dynamic bowl height position
          dy: 0,
        });

        // IMMEDIATELY FORCE THE CAT TO NOTICE IT if it is in an interruptible state
        const cat = gameState.current.cat;
        if (cat.state !== "eating" && cat.state !== "sleeping" && cat.state !== "walk_to_bed" && cat.state !== "bathing") {
            cat.state = "walk_to_target";
            cat.timer = 0;
        }
      },
      play: () => {
        // Drop a random toy as an invisible target for the cat to run to
        const leftBound = gameState.current.screenW * 0.25;
        const rightBound = gameState.current.screenW * 0.75;
        gameState.current.items.push({
           id: Math.random(),
           type: "hiddenToy",
           x: leftBound + Math.random() * (rightBound - leftBound),
           y: gameState.current.floorY,
           dy: 0,
        });
      },
      bathe: () => {
        gameState.current.cat.state = "bathing";
        gameState.current.cat.frameKey = "bathe";
        gameState.current.cat.timer = 5000;
        gameState.current.cat.x = gameState.current.screenW * 0.5;
        gameState.current.cat.y = gameState.current.screenH * 0.85; // Visual vertical center for the water tub bottom segment
        if (onStateChange) onStateChange("bathing");
      },
      sleep: () => {
        // Just reset to walk_to_bed - the game loop will handle walking + sleeping
        if (gameState.current.cat.state !== 'walk_to_bed' && gameState.current.cat.state !== 'sleeping') {
          gameState.current.cat.state = "walk_to_bed";
          gameState.current.cat.frameKey = "walk";
        }
      },
      triggerHeart: () => {
        // Maybe trigger cry or dance depending on some input, but doing a no-op is fine!
      },
      heal: () => {
        gameState.current.cat.state = "idle";
        gameState.current.cat.timer = 2000;
      },
      cry: () => {
        // Used by hospital scene — pet cries while sick
        gameState.current.cat.state = "reacting";
        gameState.current.cat.frameKey = "cry";
        gameState.current.cat.timer = 4000;
        // Instantly force to the center of the viewport floor
        gameState.current.cat.x = gameState.current.screenW * 0.5;
        gameState.current.cat.y = gameState.current.screenH * 0.85;
      },
      _forceFrameKey: (key) => {
        // Emergency override — for scene-specific animations
        gameState.current.cat.state = "reacting";
        gameState.current.cat.frameKey = key;
        gameState.current.cat.timer = 99999; // Hold until manually reset
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
              className="absolute z-10"
              style={{
                left: item.x,
                bottom: '25%',
                width: 24,
                height: 16,
                backgroundImage: 'url(/pets/items/PinkBall-Sheet.png)',
                backgroundSize: '120px 16px',
                backgroundPosition: '0 0',
                imageRendering: 'pixelated',
                transform: `translate(-50%, 0) scale(${(state.screenW / 512) * 2.5})`,
                transformOrigin: 'center bottom',
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
            // Trigger click reaction: surprised / excited / dance (3 options)
            const cat = gameState.current.cat;
            if (cat.state !== 'eating' && cat.state !== 'sleeping' && cat.state !== 'bathing') {
              cat.state = 'reacting';
              const r = Math.random();
              cat.frameKey = r < 0.33 ? 'surprised' : r < 0.66 ? 'excited' : 'dance';
              cat.timer = 1500 + Math.random() * 1000;
            }
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
            const baseScale = 1.4; // Relative to original pixel art
            // Cap at 1.0 — no upscaling beyond native 512px room width on desktop
            const responsiveMultiplier = Math.min(state.screenW / 512, 1.0);
            const scale = frameH > 100 ? 1 : (baseScale * responsiveMultiplier);

            const displayWidth = frameW * scale;
            const displayHeight = frameH * scale;
            
            // For eating, sick and dance we can speed it up or slow it down
            let animationSpeed = 120;
            if (frameKey === "sick" || frameKey === "sickRun") animationSpeed = 180;
            else if (frameKey === "run" || frameKey === "dance") animationSpeed = 100;
            else if (frameKey === "walk") animationSpeed = 140;
            else if (frameKey === "surprised" || frameKey === "excited") animationSpeed = 160;
            else if (frameKey === "sleep2") animationSpeed = 500; // Single frame — show it slow
            
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
