// =========================================================
// 🚀 SPECIES CONFIGURATION
// Define the sprite sheets for the different pets
// =========================================================

const SPRITE_DUMMY_FRAMES = { idle: [['#111111']] };
const EMPTY_PALETTE = { '#111111': '#111111' };

// Helper: build a Pochi spriteSheets config pointing to a specific colour folder
const makePochi = (id, name, folder) => ({
  id,
  name,
  spriteMode: 'sprite',
  palette: EMPTY_PALETTE,
  spriteSheets: {
    // ── All frames verified from AllCats.png row map ──────
    idle:      { src: `${folder}/Idle.png`,      frames: 6,  frameW: 64, frameH: 64 }, // Row 0
    run:       { src: `${folder}/Running.png`,   frames: 18, frameW: 64, frameH: 64 }, // Row 5-6 (alias of Walking)
    walk:      { src: `${folder}/Walking.png`,   frames: 18, frameW: 64, frameH: 64 }, // Row 5-6
    sickRun:   { src: `${folder}/SickRun.png`,   frames: 15, frameW: 64, frameH: 64 }, // Row 17-18
    sleep:     { src: `${folder}/Sleeping.png`,  frames: 4,  frameW: 64, frameH: 64 }, // Row 3
    eat:       { src: `${folder}/Happy.png`,     frames: 10, frameW: 64, frameH: 64 }, // Row 4
    sick:      { src: `${folder}/Hurt.png`,      frames: 4,  frameW: 64, frameH: 64 }, // alias of Crying (Row 10)
    dance:     { src: `${folder}/Dance.png`,     frames: 4,  frameW: 64, frameH: 64 }, // Row 11
    wait:      { src: `${folder}/Chilling.png`,  frames: 8,  frameW: 64, frameH: 64 }, // Row 12
    cry:       { src: `${folder}/Crying.png`,    frames: 4,  frameW: 64, frameH: 64 }, // Row 10
    bathe:     { src: `${folder}/Tickle.png`,    frames: 4,  frameW: 64, frameH: 64 }, // Row 14
    surprised: { src: `${folder}/Surprised.png`, frames: 3,  frameW: 64, frameH: 64 }, // Row 1
    excited:   { src: `${folder}/Excited.png`,   frames: 2,  frameW: 64, frameH: 64 }, // Row 13
    sleep2:    { src: `${folder}/Dead.png`,      frames: 1,  frameW: 64, frameH: 64 }, // Row 2
  },
  stages: [
    { id: 'adult', name, levelRange: [0, 999], frames: SPRITE_DUMMY_FRAMES },
  ],
});

// ── Pochi colour variants ─────────────────────────────────
// Same action set (AllCats row map), each colour has its own extracted sprites
const POCHI_CREAM  = makePochi('pochi',           'Pochi 奶油',  '/pets/pochi');
const POCHI_BLACK  = makePochi('pochi_black',     'Pochi 黑猫',  '/pets/pochi_black');
const POCHI_GREY   = makePochi('pochi_grey',      'Pochi 灰猫',  '/pets/pochi_grey');
const POCHI_GWHITE = makePochi('pochi_grey_white','Pochi 灰白猫','/pets/pochi_grey_white');
const POCHI_ORANGE = makePochi('pochi_orange',    'Pochi 橘猫',  '/pets/pochi_orange');
const POCHI_WHITE  = makePochi('pochi_white',     'Pochi 白猫',  '/pets/pochi_white');

// ── Original small orange cat ─────────────────────────────
const ORANGE_CAT = {
  id: 'orange',
  name: '小橘(经典款)',
  spriteMode: 'sprite',
  palette: EMPTY_PALETTE,
  spriteSheets: {
    idle:  { src: '/pets/orange/IdleCatt.png',  frames: 7,  frameW: 32, frameH: 32 },
    run:   { src: '/pets/orange/RunCatt.png',   frames: 7,  frameW: 32, frameH: 32 },
    sleep: { src: '/pets/orange/SleepCatt.png', frames: 3,  frameW: 32, frameH: 32 },
    eat:   { src: '/pets/orange/Liking.png',    frames: 18, frameW: 32, frameH: 32 },
    sick:  { src: '/pets/orange/HurtCattt.png', frames: 7,  frameW: 32, frameH: 32 },
    dance: { src: '/pets/orange/JumpCattt.png', frames: 13, frameW: 32, frameH: 32 },
    wait:  { src: '/pets/orange/Sittingg.png',  frames: 3,  frameW: 32, frameH: 32 },
    cry:   { src: '/pets/orange/DieCatt.png',   frames: 15, frameW: 32, frameH: 32 },
    bathe: { src: '/pets/orange/Sittingg.png',  frames: 3,  frameW: 32, frameH: 32 },
  },
  stages: [
    { id: 'adult', name: '小橘', levelRange: [0, 999], frames: SPRITE_DUMMY_FRAMES },
  ],
};

// ── Registry ──────────────────────────────────────────────
export const SPECIES_REGISTRY = {
  orange:           ORANGE_CAT,
  pochi:            POCHI_CREAM,
  pochi_black:      POCHI_BLACK,
  pochi_grey:       POCHI_GREY,
  pochi_grey_white: POCHI_GWHITE,
  pochi_orange:     POCHI_ORANGE,
  pochi_white:      POCHI_WHITE,
  mochi:            POCHI_CREAM, // backwards compat
  cat:              ORANGE_CAT,  // default
};

export const getStageData = (speciesId, level) => {
  const species = SPECIES_REGISTRY[speciesId] || ORANGE_CAT;
  const stage = species.stages[0];
  const sampleFrame = stage.frames.idle;
  return {
    palette: species.palette, frames: stage.frames,
    stageName: stage.name, stageId: stage.id,
    gridCols: sampleFrame[0].length, gridRows: sampleFrame.length,
  };
};

export const getCatStageData = (level) => getStageData('cat', level);
export default getCatStageData;
