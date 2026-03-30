import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";

// =========================================================
// 🎨 硬核手工像素帧数据 (Matrix)
// =========================================================
const PALETTE = {
  "#": "#1e293b", // Outline
  w: "#ffffff", // Body/Bone
  p: "#f472b6", // Pink cheeks
  s: "#cbd5e1", // Shadow
  r: "#ef4444", // Red (Meat/Heart)
  b: "#3b82f6", // Blue (Ball pattern)
  y: "#fde047", // Yellow (Alert)
  o: "#93c5fd", // Light blue (Bubble)
  z: "#3b82f6", // Dark blue (Zzz)
  ".": "transparent",
};

const SPRITE_FRAMES = {
  idle: [
    "................",
    ".......#....#...",
    "......#w#..#w#..",
    ".....#wpw##wpw#.",
    ".....#wwwwwwww#.",
    "..##.#ww#ww#ww#.",
    ".#ww##wwwwwwww#.",
    ".#wwwwwwwppwww#.",
    "..##wwwssswwww#.",
    "...#wwwwwwwww#..",
    "...##ww###ww#...",
    ".....##...##....",
    "................",
    "................",
  ],
  walk1: [
    "................",
    ".......#....#...",
    "......#w#..#w#..",
    ".....#wpw##wpw#.",
    ".....#wwwwwwww#.",
    ".....#ww#ww#ww#.",
    "..##.#wwwwwwww#.",
    ".#ww##wwwppwww#.",
    ".#wwwwwssswwww#.",
    "..##wwwwwwwww#..",
    "...##ww###ww#...",
    ".....#....##....",
    "................",
    "................",
  ],
  walk2: [
    "................",
    "..##...#....#...",
    ".#ww#.#w#..#w#..",
    ".#ww##wpw##wpw#.",
    "..##.#wwwwwwww#.",
    ".....#ww#ww#ww#.",
    ".....#wwwwwwww#.",
    ".....#wwwppwww#.",
    ".....#wssswwww#.",
    ".....#wwwwwwwww#",
    ".....##ww###w#..",
    "......##...#....",
    "................",
    "................",
  ],
  eat: [
    "................",
    ".......#....#...",
    "......#w#..#w#..",
    ".....#wpw##wpw#.",
    "..##.#wwwwwwww#.",
    ".#ww##ww#ww#ww#.",
    ".#wwwwwwwwwwww#.",
    "..##wwww#ppwww#.", // Mouth open
    "...#wwwssswwww#.",
    "...#wwwwwwwww#..",
    "...##w#####w#...",
    ".....#.....#....",
    "................",
    "................",
  ],
  sleep: [
    "................",
    "................",
    "................",
    ".......#....#...",
    "......#w#..#w#..",
    ".....#wpw##wpw#.",
    "..##.#wwwwwwww#.",
    ".#ww##wwwwwwww#.",
    ".#wwwwww#ww#ww#.", // closed eyes higher up
    "..##wwwwwppwww#.",
    "...#wwwwwwwww#..",
    "...##ww###ww#...",
    ".....##...##....",
    "................",
  ],
};

// 物品 (8x8 或者 12x12 根据实际设计，编译器统一按数组渲染)
const ITEM_FRAMES = {
  meat: [
    "........",
    "...##...",
    "..#ww#..",
    ".#rrrr#.",
    ".#rrwr#.",
    ".#rrrr#.",
    "..####..",
    "........",
  ],
  ball: [
    "........",
    "..####..",
    ".#wwww#.",
    ".#wbww#.",
    ".#wwbw#.",
    ".#wwww#.",
    "..####..",
    "........",
  ],
  soap: [
    "........",
    "..####..",
    ".#oooo#.",
    ".#owoo#.",
    ".#oooo#.",
    "..####..",
    "........",
    "........",
  ],
  bubble: [
    "........",
    "..oooo..",
    ".o.oo.o.",
    ".oooooo.",
    "..oooo..",
    "........",
    "........",
    "........",
  ],
  zzz: [
    "........",
    "........",
    "..zzzz..",
    "....z...",
    "...z....",
    "..zzzz..",
    "........",
    "........",
  ],
  heart: [
    "........",
    "..r..r..",
    ".rrrrrr.",
    ".rrrrrr.",
    "..rrrr..",
    "...rr...",
    "........",
    "........",
  ],
  note: [
    "...##...",
    "..#.#...",
    "..#.#...",
    ".##.#...",
    ".##.....",
    "........",
    "........",
    "........",
  ],
  alert: [
    "...#....",
    "..#y#...",
    "..#y#...",
    "..#y#...",
    "...#....",
    "..#y#...",
    "...#....",
    "........",
  ],
  pill: [
    "........",
    "..####..",
    ".#wwww#.",
    ".#rwrw#.",
    ".#rwrw#.",
    ".#rrrr#.",
    "..####..",
    "........",
  ],
  bathTub: [
    "............",
    ".##########.",
    "#wwwwwwwwww#",
    "#wwwwwwwwww#",
    "#wwswwwwwww#",
    ".########.#.",
    "..##....##..",
    "............",
  ],
};

// =========================================================
// 🧱 像素编译器
// =========================================================
const PIXEL_SIZE = 5;

const compileShadows = (frameArray) => {
  let shadows = [];
  for (let y = 0; y < frameArray.length; y++) {
    for (let x = 0; x < frameArray[y].length; x++) {
      const char = frameArray[y][x];
      if (PALETTE[char] && PALETTE[char] !== "transparent") {
        shadows.push(
          `${x * PIXEL_SIZE}px ${y * PIXEL_SIZE}px 0 ${PALETTE[char]}`,
        );
      }
    }
  }
  return shadows.join(", ");
};

const precompiledShadows = {
  idle: compileShadows(SPRITE_FRAMES.idle),
  walk1: compileShadows(SPRITE_FRAMES.walk1),
  walk2: compileShadows(SPRITE_FRAMES.walk2),
  eat: compileShadows(SPRITE_FRAMES.eat),
  sleep: compileShadows(SPRITE_FRAMES.sleep),
  meat: compileShadows(ITEM_FRAMES.meat),
  ball: compileShadows(ITEM_FRAMES.ball),
  soap: compileShadows(ITEM_FRAMES.soap),
  bubble: compileShadows(ITEM_FRAMES.bubble),
  zzz: compileShadows(ITEM_FRAMES.zzz),
  heart: compileShadows(ITEM_FRAMES.heart),
  note: compileShadows(ITEM_FRAMES.note),
  alert: compileShadows(ITEM_FRAMES.alert),
  pill: compileShadows(ITEM_FRAMES.pill),
  bathTub: compileShadows(ITEM_FRAMES.bathTub),
};

// =========================================================
// 🚀 ENGINE COMPONENT
// =========================================================
const PixelPetEngine = forwardRef(
  (
    {
      width = 240,
      height = 180,
      scale = 1,
      onStateChange,
      onPetClick,
      isSick = false,
      isSleeping = false,
      isDirty = false,
      satiety = 50,
    },
    ref,
  ) => {
    const requestRef = useRef();

    const gameState = useRef({
      screenW: width,
      screenH: height,
      floorY: height * 0.75, // 动态地板高度
      cat: {
        x: width / 2,
        y: height * 0.75,
        dx: 0,
        state: "idle",
        timer: 2000,
        bounceY: 0,
        facingLeft: false,
        frameKey: "idle",
      },
      items: [],
      particles: [],
      lastTime: 0,
    });

    const [, setTick] = useState(0);

    // 当外部容器尺寸变化时更新物理边界
    useEffect(() => {
      gameState.current.screenW = width;
      gameState.current.screenH = height;
      gameState.current.floorY = height * 0.75;
      // 强制把猫咪拽回地面
      gameState.current.cat.y = height * 0.75;
      if (gameState.current.cat.x > width) gameState.current.cat.x = width - 40;
    }, [width, height]);

    const updateGame = useCallback(
      (time) => {
        if (!gameState.current.lastTime) gameState.current.lastTime = time;
        const dt = time - gameState.current.lastTime;
        gameState.current.lastTime = time;
        const state = gameState.current;
        const cat = state.cat;

        // --- 物品掉落物理 ---
        state.items.forEach((item) => {
          // items land on the floor
          if (item.y < state.floorY) {
            item.dy += 0.002 * dt;
            item.y += item.dy * dt;
            if (item.y > state.floorY) {
              item.y = state.floorY;
              item.dy = -item.dy * 0.4; // bounce
            }
          }
        });

        // --- 粒子物理 (浮起或飘动) ---
        state.particles = state.particles.filter((p) => p.life > 0);
        state.particles.forEach((p) => {
          p.life -= dt;
          p.y += p.vy * dt;
          p.x += p.vx * dt;
          p.opacity = Math.max(0, p.life / p.maxLife);
        });

        // --- 动画与 AI 状态机 ---
        if (isSick && cat.state !== "eating") {
          cat.state = "sick";
          cat.frameKey = "sleep";
          cat.dx = 0;
          cat.bounceY = Math.sin(time / 50) * 2; // Fast tremble

          if (Math.random() < 0.02) {
            state.particles.push({
              id: Math.random(),
              x: cat.x + (Math.random() - 0.5) * 20,
              y: cat.y - Math.random() * 20 - 20,
              vx: (Math.random() - 0.5) * 0.02,
              vy: -0.05,
              type: "alert",
              life: 1000,
              maxLife: 1000,
              opacity: 1,
            });
          }
        } else if (isSleeping) {
          cat.state = "sleeping";
          cat.frameKey = "sleep";
          cat.dx = 0;
          cat.bounceY = Math.sin(time / 400) * 3;
          if (Math.random() < 0.01) {
            state.particles.push({
              id: Math.random(),
              x: cat.x + (cat.facingLeft ? -10 : 10),
              y: cat.y - 40,
              vx: (Math.random() - 0.5) * 0.01,
              vy: -0.02,
              type: "zzz",
              life: 2000,
              maxLife: 2000,
              opacity: 1,
            });
          }
        } else {
          if (isDirty && Math.random() < 0.05) {
            state.particles.push({
              id: Math.random(),
              x: cat.x + (Math.random() - 0.5) * 40,
              y: cat.y - Math.random() * 40,
              vx: (Math.random() - 0.5) * 0.03,
              vy: (Math.random() - 0.5) * 0.03,
              type: "alert",
              life: 800,
              maxLife: 800,
              opacity: 1,
            }); // using alert (yellow dot) as flies/stink
          }

          if (cat.state === "idle") {
            cat.timer -= dt;
            cat.bounceY = 0;
            cat.frameKey = "idle";

            if (cat.timer <= 0) {
              if (state.items.length > 0) {
                cat.state = "walk_to_target";
              } else {
                // 🎲 Random behavior selection with personality!
                const roll = Math.random();
                if (roll < 0.35) {
                  // 35% — Wander around
                  cat.state = "wander";
                  cat.dx = (Math.random() > 0.5 ? 1 : -1) * (0.04 + Math.random() * 0.04);
                  cat.timer = 1500 + Math.random() * 3000;
                } else if (roll < 0.50) {
                  // 15% — Yawn (mouth open, stretch)
                  cat.state = "yawning";
                  cat.timer = 1500;
                  cat.frameKey = "eat"; // mouth open = yawn
                } else if (roll < 0.65) {
                  // 15% — Stare at player (face screen, blink)
                  cat.state = "staring";
                  cat.timer = 2500;
                  cat.facingLeft = true; // face toward viewer
                } else if (roll < 0.78) {
                  // 13% — Groom / lick fur
                  cat.state = "grooming";
                  cat.timer = 2000;
                } else if (roll < 0.85) {
                  // 7% — Chase own tail (spin)
                  cat.state = "chase_tail";
                  cat.timer = 2500;
                } else {
                  // 15% — Stay idle longer
                  cat.timer = 1000 + Math.random() * 2000;
                }
              }
            }
          } else if (cat.state === "sleeping") {
            cat.frameKey = "sleep";
            cat.bounceY = Math.sin(time / 400) * 3; // breath smoothy

            // Spawn zzz particles occasionally
            if (Math.random() < 0.01) {
              state.particles.push({
                id: Math.random(),
                x: cat.x + (cat.facingLeft ? -10 : 10),
                y: cat.y - 40,
                vx: (Math.random() - 0.5) * 0.02,
                vy: -0.02,
                type: "zzz",
                life: 2000,
                maxLife: 2000,
                opacity: 1,
              });
            }

            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.bounceY = 0;
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "bathing") {
            cat.frameKey = "idle";
            cat.bounceY = Math.abs(Math.sin(time / 200)) * 5;

            // Spawn soap bubbles heavily
            if (Math.random() < 0.1) {
              state.particles.push({
                id: Math.random(),
                x: cat.x + (Math.random() - 0.5) * 60,
                y: cat.y - Math.random() * 40,
                vx: (Math.random() - 0.5) * 0.04,
                vy: -0.05,
                type: "bubble",
                life: 1500,
                maxLife: 1500,
                opacity: 1,
              });
            }

            cat.timer -= dt;
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.bounceY = 0;
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "wander" || cat.state === "walk_to_target") {
            const steps = ["walk1", "idle", "walk2", "idle"];
            cat.frameKey = steps[Math.floor(time / 150) % 4];

            if (cat.state === "wander") {
              cat.x += cat.dx * dt;
              cat.facingLeft = cat.dx < 0;

              // Boundaries
              if (cat.x < 30) {
                cat.x = 30;
                cat.dx *= -1;
                cat.facingLeft = false;
              }
              if (cat.x > state.screenW - 30) {
                cat.x = state.screenW - 30;
                cat.dx *= -1;
                cat.facingLeft = true;
              }

              cat.timer -= dt;
              if (state.items.length > 0) {
                cat.state = "walk_to_target";
              } else if (cat.timer <= 0) {
                cat.state = "idle";
                cat.timer = 1000 + Math.random() * 2000;
              }
            } else {
              const target = state.items[0];
              if (!target) {
                cat.state = "idle";
                return;
              }

              const isFoodTarget =
                target.type === "meat" || target.type === "hiddenFood";
              // If it is food, we must force the cat to eat from the right side of the bowl!
              // We offset the target X by +40px.
              const targetX = isFoodTarget ? target.x + 40 : target.x;
              const dir = targetX - cat.x;

              // Face movement direction
              cat.facingLeft = dir < 0;

              if (Math.abs(dir) > 5) {
                // BIOS DYNAMIC SPEED CALCULATION:
                let speed = 0.08;
                if (isFoodTarget) {
                  // 1. If running towards food, hunger makes it FAST (0 = 0.45 px/ms, 100 = 0.15 px/ms)
                  speed = 0.45 - (satiety / 100) * 0.3;
                } else {
                  // 2. If just wandering around, hunger makes it SLUGGISH (0 = 0.04 px/ms, 100 = 0.12 px/ms)
                  speed = 0.04 + (satiety / 100) * 0.08;
                }

                cat.dx = Math.sign(dir) * speed;
                cat.x += cat.dx * dt;
              } else {
                // Arrived!
                if (isFoodTarget) cat.facingLeft = true; // Face left to eat the bowl which is on the left

                cat.state = isFoodTarget ? "eating" : "playing";
                cat.timer = isFoodTarget ? 1500 : 2000;
                cat.frameKey = isFoodTarget ? "eat" : "idle";

                state.particles.push({
                  id: Math.random(),
                  x: cat.x,
                  y: cat.y - 30,
                  vx: (Math.random() - 0.5) * 0.05,
                  vy: -0.05,
                  type: isFoodTarget ? "heart" : "note",
                  life: 1200,
                  maxLife: 1200,
                  opacity: 1,
                });
                state.items.shift();
                if (onStateChange) onStateChange(cat.state);
              }
            }
          } else if (cat.state === "eating") {
            cat.timer -= dt;
            cat.frameKey = Math.floor(time / 150) % 2 === 0 ? "eat" : "idle";
            if (cat.timer <= 0) {
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          } else if (cat.state === "playing") {
            cat.timer -= dt;
            cat.frameKey = "walk2";
            cat.bounceY = Math.abs(Math.sin(time / 120)) * 12;
            if (cat.timer <= 0) {
              cat.bounceY = 0;
              cat.state = "idle";
              cat.timer = 2000;
              if (onStateChange) onStateChange("idle");
            }
          // ═══ NEW PERSONALITY BEHAVIORS ═══
          } else if (cat.state === "yawning") {
            cat.timer -= dt;
            // Alternate between mouth-open and closed for a big yawn
            cat.frameKey = Math.floor(time / 300) % 2 === 0 ? "eat" : "idle";
            cat.bounceY = Math.sin(time / 300) * 2; // Slight stretch
            if (cat.timer <= 0) {
              cat.bounceY = 0;
              cat.state = "idle";
              cat.timer = 1500 + Math.random() * 1500;
            }
          } else if (cat.state === "staring") {
            cat.timer -= dt;
            cat.facingLeft = true; // Always face the player
            // Blink effect: mostly idle, occasionally "sleep" frame (closed eyes)
            const blinkCycle = Math.floor(time / 200) % 20;
            cat.frameKey = blinkCycle === 0 || blinkCycle === 1 ? "sleep" : "idle";
            cat.bounceY = Math.sin(time / 500) * 1.5; // Gentle head tilt
            if (cat.timer <= 0) {
              cat.bounceY = 0;
              cat.state = "idle";
              cat.timer = 1000 + Math.random() * 2000;
              // Sometimes emit a heart after staring (affection)
              if (Math.random() < 0.4) {
                state.particles.push({
                  id: Math.random(), x: cat.x, y: cat.y - 35,
                  vx: 0, vy: -0.03, type: "heart",
                  life: 1200, maxLife: 1200, opacity: 1,
                });
              }
            }
          } else if (cat.state === "grooming") {
            cat.timer -= dt;
            // Alternate eat frame (head down licking) with idle
            cat.frameKey = Math.floor(time / 250) % 3 === 0 ? "eat" : "idle";
            cat.bounceY = Math.abs(Math.sin(time / 150)) * 3;
            // Sparkle particles while grooming
            if (Math.random() < 0.04) {
              state.particles.push({
                id: Math.random(),
                x: cat.x + (Math.random() - 0.5) * 30,
                y: cat.y - 10 - Math.random() * 20,
                vx: (Math.random() - 0.5) * 0.02, vy: -0.03,
                type: "bubble", life: 800, maxLife: 800, opacity: 1,
              });
            }
            if (cat.timer <= 0) {
              cat.bounceY = 0;
              cat.state = "idle";
              cat.timer = 1500 + Math.random() * 1500;
            }
          } else if (cat.state === "chase_tail") {
            cat.timer -= dt;
            // Rapid direction flipping = spinning in place
            const spinCycle = Math.floor(time / 200) % 4;
            cat.facingLeft = spinCycle < 2;
            cat.frameKey = spinCycle % 2 === 0 ? "walk1" : "walk2";
            cat.bounceY = Math.abs(Math.sin(time / 100)) * 6;
            // Occasional note particles (playful)
            if (Math.random() < 0.05) {
              state.particles.push({
                id: Math.random(),
                x: cat.x + (Math.random() - 0.5) * 20,
                y: cat.y - 30, vx: (Math.random() - 0.5) * 0.04, vy: -0.04,
                type: "note", life: 1000, maxLife: 1000, opacity: 1,
              });
            }
            if (cat.timer <= 0) {
              cat.bounceY = 0;
              cat.state = "idle";
              cat.timer = 2000;
            }
          }
        }

        setTick((t) => t + 1);
        requestRef.current = requestAnimationFrame(updateGame);
      },
      [width, height, onStateChange, satiety],
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
        gameState.current.items.push({
          id: Math.random(),
          type: "hiddenFood",
          x:
            x !== undefined
              ? x
              : 30 + Math.random() * (gameState.current.screenW - 60),
          y: gameState.current.cat.y, // Spawn on floor, no falling
          dy: 0,
        });
      },
      play: () => {
        gameState.current.items.push({
          id: Math.random(),
          type: "ball",
          x: 30 + Math.random() * (gameState.current.screenW - 60),
          y: 0,
          dy: 0,
        });
      },
      bathe: () => {
        gameState.current.cat.state = "bathing";
        gameState.current.cat.timer = 3000; // 3 seconds bathing
        if (onStateChange) onStateChange("bathing");
        // Drop soap
        gameState.current.items.push({
          id: Math.random(),
          type: "soap",
          x: gameState.current.cat.x + 20,
          y: 0,
          dy: 0,
        });
      },
      sleep: () => {
        gameState.current.cat.state = "sleeping";
        gameState.current.cat.timer = 5000; // 5 seconds sleeping
        if (onStateChange) onStateChange("sleeping");
      },
      triggerHeart: () => {
        gameState.current.particles.push({
          id: Math.random(),
          x: gameState.current.cat.x,
          y: gameState.current.cat.y - 40,
          vx: 0,
          vy: -0.03,
          type: "heart",
          life: 1500,
          maxLife: 1500,
          opacity: 1,
        });
      },
      heal: () => {
        gameState.current.items.push({
          id: Math.random(),
          type: "pill",
          x: gameState.current.cat.x + 20,
          y: 0,
          dy: 0,
        });
        // also trigger heart
        gameState.current.particles.push({
          id: Math.random(),
          x: gameState.current.cat.x,
          y: gameState.current.cat.y - 40,
          vx: 0,
          vy: -0.03,
          type: "heart",
          life: 1500,
          maxLife: 1500,
          opacity: 1,
        });
      },
    }));

    // =========================================================
    // 🎨 RENDER
    // 只渲染图层结构，不带背景包裹，宽高由外部父组件提供控制
    // =========================================================
    const state = gameState.current;

    return (
      <div
        className="relative overflow-hidden pointer-events-none"
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale})`,
          transformOrigin: "center",
        }}
      >
        {/* 虚拟地平线引导（可选，主要用于调试） */}
        {/* <div className="absolute w-full h-px bg-white/20" style={{ top: state.floorY }}></div> */}

        {/* ITEMS */}
        {state.items.map((item) => {
          if (item.type === "hiddenFood") return null;
          return (
            <div
              key={item.id}
              className="absolute z-10"
              style={{
                left: item.x,
                top: item.y,
                transform: `translate(-50%, -50%) rotate(${item.dy * 50}deg)`,
              }}
            >
              <div
                style={{
                  width: `${PIXEL_SIZE}px`,
                  height: `${PIXEL_SIZE}px`,
                  boxShadow: precompiledShadows[item.type],
                  transform: `translate(-${4 * PIXEL_SIZE}px, -${4 * PIXEL_SIZE}px)`,
                }}
              />
            </div>
          );
        })}
        {/* PET (Clickable!) */}
        <div
          className="absolute z-20 origin-bottom cursor-pointer"
          style={{
            left: state.cat.x,
            top: state.cat.y,
            transform: `
            translate(-50%, calc(-100% - ${state.cat.bounceY}px)) 
            scaleX(${state.cat.facingLeft ? -1 : 1}) 
          `,
            willChange: "transform left top",
            pointerEvents: "auto",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (onPetClick) onPetClick({ x: state.cat.x, y: state.cat.y });
          }}
        >
          <div
            style={{
              width: `${PIXEL_SIZE}px`,
              height: `${PIXEL_SIZE}px`,
              boxShadow: precompiledShadows[state.cat.frameKey],
              transform: `translate(-${8 * PIXEL_SIZE}px, -${14 * PIXEL_SIZE}px)`,
            }}
          />
        </div>

        {/* PARTICLES */}
        {state.particles.map((p) => (
          <div
            key={p.id}
            className="absolute z-30"
            style={{
              left: p.x,
              top: p.y,
              opacity: p.opacity,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: `${PIXEL_SIZE}px`,
                height: `${PIXEL_SIZE}px`,
                boxShadow: precompiledShadows[p.type],
                transform: `translate(-${4 * PIXEL_SIZE}px, -${4 * PIXEL_SIZE}px)`,
              }}
            />
          </div>
        ))}
      </div>
    );
  },
);

export default PixelPetEngine;
