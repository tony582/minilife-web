// =========================================================
// 🚀 SPECIES CONFIGURATION
// Define the sprite sheets for the different pets
// =========================================================

const SPRITE_DUMMY_FRAMES = { idle: [['#111111']] };
const EMPTY_PALETTE = { '#111111': '#111111' };

const MOCHI_CAT = {
  id: 'mochi',
  name: 'Mochi(百变小猫)',
  spriteMode: 'sprite',
  palette: EMPTY_PALETTE,
  spriteSheets: {
    idle:  { src: '/pets/mochi/Idle.png', frames: 10, frameW: 32, frameH: 32 },
    run:   { src: '/pets/mochi/Excited.png', frames: 12, frameW: 32, frameH: 32 },
    sleep: { src: '/pets/mochi/Sleep.png', frames: 4, frameW: 32, frameH: 32 },
    eat:   { src: '/pets/mochi/Eating.png', frames: 15, frameW: 32, frameH: 32 },
    sick:  { src: '/pets/mochi/catsick1.png', frames: 5, frameW: 32, frameH: 32 },
    dance: { src: '/pets/mochi/Dance.png', frames: 4, frameW: 32, frameH: 32 },
    wait:  { src: '/pets/mochi/Waiting.png', frames: 4, frameW: 32, frameH: 32 },
    cry:   { src: '/pets/mochi/Cry.png', frames: 4, frameW: 32, frameH: 32 },
    bathe: { src: '/pets/mochi/Bathtab.png', frames: 14, frameW: 32, frameH: 512 },
  },
  stages: [
    { id: 'adult', name: 'Mochi', levelRange: [0, 999], frames: SPRITE_DUMMY_FRAMES },
  ],
};

const ORANGE_CAT = {
  id: 'orange',
  name: '小橘(经典款)',
  spriteMode: 'sprite',
  palette: EMPTY_PALETTE,
  spriteSheets: {
    idle:  { src: '/pets/orange/IdleCatt.png', frames: 7, frameW: 32, frameH: 32 },
    run:   { src: '/pets/orange/RunCatt.png', frames: 7, frameW: 32, frameH: 32 },
    sleep: { src: '/pets/orange/SleepCatt.png', frames: 3, frameW: 32, frameH: 32 },
    eat:   { src: '/pets/orange/Liking.png', frames: 18, frameW: 32, frameH: 32 },
    sick:  { src: '/pets/orange/HurtCattt.png', frames: 7, frameW: 32, frameH: 32 },
    dance: { src: '/pets/orange/JumpCattt.png', frames: 13, frameW: 32, frameH: 32 },
    wait:  { src: '/pets/orange/Sittingg.png', frames: 3, frameW: 32, frameH: 32 },
    cry:   { src: '/pets/orange/DieCatt.png', frames: 15, frameW: 32, frameH: 32 },
    bathe: { src: '/pets/orange/Sittingg.png', frames: 3, frameW: 32, frameH: 32 },
  },
  stages: [
    { id: 'adult', name: '小橘', levelRange: [0, 999], frames: SPRITE_DUMMY_FRAMES },
  ],
};

export const SPECIES_REGISTRY = {
  orange: ORANGE_CAT,
  mochi: MOCHI_CAT,
  cat: ORANGE_CAT, // Defaulting cat to Orange to give "Normal Walk" out of the box
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
