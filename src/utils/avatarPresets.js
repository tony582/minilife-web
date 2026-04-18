// ─── MiniLife Avatar Presets ───────────────────────────────────────────────
// Curated Miniavs seeds — all child-appropriate (no glasses, earrings, facial hair)
// Format stored in DB: "miniavs:SeedName"

export const GIRL_AVATAR_SEEDS = ['Lily', 'Sofia', 'Xiao', 'Mila', 'Bubu', 'Cherry', 'Lele', 'Nini'];
export const BOY_AVATAR_SEEDS  = ['Noah', 'Rex', 'Bao', 'Ace', 'Pangpang', 'Bear', 'Paisley', 'Maple'];

// Convert a stored avatar string → display URL
export const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('data:image/') || avatar.startsWith('http')) return avatar;
    if (avatar.startsWith('miniavs:')) {
        const seed = avatar.slice(8);
        // Restrict to child-safe features via API params
        return `https://api.dicebear.com/8.x/miniavs/svg?seed=${encodeURIComponent(seed)}&radius=50&glasses[]=&earrings[]=&facialHair[]=`;
    }
    return null; // emoji or unknown — handled separately
};

// Wrap a seed string into the stored format
export const seedToAvatar = (seed) => `miniavs:${seed}`;

// Detect gender from stored avatar (for legacy + miniavs)
export const detectGender = (avatar) => {
    if (!avatar) return 'girl';
    if (avatar.startsWith('miniavs:')) {
        const seed = avatar.slice(8);
        return BOY_AVATAR_SEEDS.includes(seed) ? 'boy' : 'girl';
    }
    // Legacy emoji-based detection
    const boyEmojis = ['👦', '🧑‍🚀', '🦸‍♂️', '🕵️‍♂️', '👼'];
    return boyEmojis.includes(avatar) ? 'boy' : 'girl';
};

// Default avatar seed for each gender
export const DEFAULT_BOY_AVATAR  = seedToAvatar('Noah');
export const DEFAULT_GIRL_AVATAR = seedToAvatar('Lily');
