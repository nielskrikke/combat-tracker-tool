import type { Participant } from '../types';

export interface DifficultyInfo {
  difficulty: 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  adjustedXp: number;
  totalRawXp: number;
  partyThresholds: {
    easy: number;
    medium: number;
    hard: number;
    deadly: number;
  };
  playerCount: number;
  creatureCount: number;
}

// CR to XP mapping from DMG
const CR_XP_MAP: { [key: number]: number } = {
  0: 10, 0.125: 25, 0.25: 50, 0.5: 100,
  1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800,
  6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900,
  11: 7200, 12: 8400, 13: 10000, 14: 11500, 15: 13000,
  16: 15000, 17: 18000, 18: 20000, 19: 22000, 20: 25000,
  21: 33000, 22: 41000, 23: 50000, 24: 62000, 25: 75000,
  26: 90000, 27: 105000, 28: 120000, 29: 135000, 30: 155000,
};

// Per-character XP thresholds by level from DMG
const XP_THRESHOLDS: [number, number, number, number][] = [
  // Easy, Medium, Hard, Deadly
  [25, 50, 75, 100],       // Level 1
  [50, 100, 150, 200],     // Level 2
  [75, 150, 225, 400],     // Level 3
  [125, 250, 375, 500],    // Level 4
  [250, 500, 750, 1100],   // Level 5
  [300, 600, 900, 1400],   // Level 6
  [350, 750, 1100, 1700],  // Level 7
  [450, 900, 1400, 2100],  // Level 8
  [550, 1100, 1600, 2400], // Level 9
  [600, 1200, 1900, 2800], // Level 10
  [800, 1600, 2400, 3600], // Level 11
  [1000, 2000, 3000, 4500],// Level 12
  [1100, 2200, 3400, 5100],// Level 13
  [1250, 2500, 3800, 5700],// Level 14
  [1400, 2800, 4300, 6400],// Level 15
  [1600, 3200, 4800, 7200],// Level 16
  [2000, 3900, 5900, 8800],// Level 17
  [2100, 4200, 6300, 9500],// Level 18
  [2400, 4900, 7300, 10900],// Level 19
  [2800, 5700, 8500, 12700],// Level 20
];

function getEncounterMultiplier(numCreatures: number): number {
  if (numCreatures === 1) return 1;
  if (numCreatures === 2) return 1.5;
  if (numCreatures >= 3 && numCreatures <= 6) return 2;
  if (numCreatures >= 7 && numCreatures <= 10) return 2.5;
  if (numCreatures >= 11 && numCreatures <= 14) return 3;
  if (numCreatures >= 15) return 4;
  return 1; // Default for 0 creatures
}

export function calculateDifficulty(participants: Participant[]): DifficultyInfo | null {
  const creatures = participants.filter(p => 
    (p.type === 'creature' || p.type === 'dmpc') && typeof p.cr === 'number'
  );

  const players = participants.filter(p => {
    if (p.type === 'player') return !!p.level;
    if (p.type === 'dmpc') {
      // Count as player only if they have a level AND are not already counted as a creature (by having a CR)
      return !!p.level && typeof p.cr !== 'number';
    }
    return false;
  });

  if (players.length === 0 || creatures.length === 0) {
    return null;
  }

  // Calculate party XP thresholds
  const partyThresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };
  players.forEach(p => {
    const levelIndex = (p.level ?? 1) - 1;
    if (levelIndex >= 0 && levelIndex < XP_THRESHOLDS.length) {
      const thresholds = XP_THRESHOLDS[levelIndex];
      partyThresholds.easy += thresholds[0];
      partyThresholds.medium += thresholds[1];
      partyThresholds.hard += thresholds[2];
      partyThresholds.deadly += thresholds[3];
    }
  });

  // Calculate total creature XP
  const totalRawXp = creatures.reduce((sum, c) => {
    return sum + (CR_XP_MAP[c.cr!] || 0);
  }, 0);

  // Apply multiplier
  const multiplier = getEncounterMultiplier(creatures.length);
  const adjustedXp = Math.floor(totalRawXp * multiplier);

  // Determine difficulty
  let difficulty: DifficultyInfo['difficulty'] = 'Trivial';
  if (adjustedXp >= partyThresholds.deadly) {
    difficulty = 'Deadly';
  } else if (adjustedXp >= partyThresholds.hard) {
    difficulty = 'Hard';
  } else if (adjustedXp >= partyThresholds.medium) {
    difficulty = 'Medium';
  } else if (adjustedXp >= partyThresholds.easy) {
    difficulty = 'Easy';
  }

  return {
    difficulty,
    adjustedXp,
    totalRawXp,
    partyThresholds,
    playerCount: players.length,
    creatureCount: creatures.length,
  };
}
