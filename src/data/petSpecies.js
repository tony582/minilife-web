// ═══════════════════════════════════════════════
// 🐾 MiniLife — Pet Species Data
// Data-driven species architecture for multi-species support
// ═══════════════════════════════════════════════

// Shared palette for all cat growth stages
const CAT_PALETTE = {
  "#": "#1e293b",
  w: "#ffffff",
  p: "#f472b6",
  s: "#cbd5e1",
  y: "#fbbf24",
  ".": "transparent",
};

// ─────────────────────────────────────────
// STAGE 1: KITTEN (奶猫) Lv.0~5
// Grid: 12 cols × 10 rows — big head, tiny body
// ─────────────────────────────────────────
const KITTEN_FRAMES = {
  idle: [
    "............",
    "....#...#...",
    "...#w#.#w#..",
    "...#wwwwww#.",
    "...#w#ww#w#.",
    ".#.#wwwwww#.",
    ".#w#wwppww#.",
    "..##wwswww#.",
    "...##..##...",
    "............",
  ],
  walk1: [
    "............",
    "....#...#...",
    "...#w#.#w#..",
    "...#wwwwww#.",
    "...#w#ww#w#.",
    ".#.#wwwwww#.",
    ".#w#wwppww#.",
    "..##wwswww#.",
    "...#...##...",
    "............",
  ],
  walk2: [
    "............",
    "....#...#...",
    "...#w#.#w#..",
    "...#wwwwww#.",
    "...#w#ww#w#.",
    ".#.#wwwwww#.",
    ".#w#wwppww#.",
    "..##wwswww#.",
    "....#.##....",
    "............",
  ],
  eat: [
    "............",
    "............",
    "....#...#...",
    "...#w#.#w#..",
    "...#wwwwww#.",
    ".#.#w#ww#w#.",
    ".#w#wwppww#.",
    "..##ww#www#.",
    "...##..##...",
    "............",
  ],
  sleep: [
    "............",
    "............",
    "....#...#...",
    "...#w#.#w#..",
    "...#wwwwww#.",
    ".#.#wwwwww#.",
    ".#w#wwppww#.",
    "..##wwswww#.",
    "...##..##...",
    "............",
  ],
};

// ─────────────────────────────────────────
// STAGE 2: YOUNG CAT (小猫) Lv.6~12
// Grid: 16 cols × 14 rows — balanced proportions
// ─────────────────────────────────────────
const YOUNG_FRAMES = {
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
    "..##wwww#ppwww#.",
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
    ".#wwwwww#ww#ww#.",
    "..##wwwwwppwww#.",
    "...#wwwwwwwww#..",
    "...##ww###ww#...",
    ".....##...##....",
    "................",
  ],
};

// ─────────────────────────────────────────
// STAGE 3: ADULT CAT (成猫) Lv.13+
// Grid: 16 cols × 14 rows — same shape + golden bell collar
// ─────────────────────────────────────────
const ADULT_FRAMES = {
  idle: [
    "................",
    ".......#....#...",
    "......#w#..#w#..",
    ".....#wpw##wpw#.",
    ".....#wwwwwwww#.",
    "..##.#ww#ww#ww#.",
    ".#ww##wwwwwwww#.",
    ".#wwwwwwwppwww#.",
    "..##wwwsyswwww#.",
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
    ".#wwwwwsyswwww#.",
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
    ".....#wsyswwww#.",
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
    "..##wwww#ppwww#.",
    "...#wwwsyswwww#.",
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
    ".#wwwwww#ww#ww#.",
    "..##wwwwwppwww#.",
    "...#wwwwwwwww#..",
    "...##ww###ww#...",
    ".....##...##....",
    "................",
  ],
};

// ═══════════════════════════════════════════════
// Species Registry
// ═══════════════════════════════════════════════
const CAT_SPECIES = {
  id: 'cat',
  name: '小猫咪',
  palette: CAT_PALETTE,
  stages: [
    { id: 'kitten', name: '奶猫',  levelRange: [0, 5],  frames: KITTEN_FRAMES },
    { id: 'young',  name: '小猫',  levelRange: [6, 12], frames: YOUNG_FRAMES },
    { id: 'adult',  name: '成猫',  levelRange: [13, 30], frames: ADULT_FRAMES },
  ],
};

/**
 * Get the correct sprite stage data for a cat at the given level.
 * Returns { palette, frames, stageName, gridCols, gridRows }
 */
export const getCatStageData = (level) => {
  const stage = CAT_SPECIES.stages.find(
    s => level >= s.levelRange[0] && level <= s.levelRange[1]
  ) || CAT_SPECIES.stages[CAT_SPECIES.stages.length - 1];

  const sampleFrame = stage.frames.idle;
  return {
    palette: CAT_SPECIES.palette,
    frames: stage.frames,
    stageName: stage.name,
    stageId: stage.id,
    gridCols: sampleFrame[0].length,
    gridRows: sampleFrame.length,
  };
};

export { CAT_SPECIES };
export default getCatStageData;
