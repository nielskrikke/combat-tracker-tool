export interface Condition {
  id: string;
  name: string;
  duration: number; // in rounds, Infinity for permanent
}

export interface InventoryItem {
  name: string;
  amount: number;
  url?: string;
  description?: string;
}

export interface Participant {
  id:string;
  name: string;
  initiative: number;
  hp?: number;
  maxHp?: number;
  tempHp?: number;
  ac: number;
  conditions: Condition[];
  type: 'player' | 'creature' | 'dmpc';
  level?: number; // For players/dmpcs
  cr?: number; // For creatures
  statblockUrl?: string;
  characterSheetUrl?: string;
  description?: string; // Custom description field
  damageVulnerabilities?: string[];
  damageResistances?: string[];
  damageImmunities?: string[];
  conditionImmunities?: string[];
  legendaryResistances?: number;
  legendaryResistancesUsed?: number;
  legendaryActions?: number;
  legendaryActionsUsed?: number;
  inventory?: InventoryItem[];
  dexterityModifier?: number;
  dexApiUrl?: string; // To fetch stats for creatures from API
}

export interface LogEntry {
  id: string;
  round: number;
  actorName: string;
  message: string;
  type: 'damage' | 'healing' | 'condition_add' | 'condition_remove' | 'death' | 'info' | 'turn_start';
}

export interface MonsterSummary {
  index: string;
  name: string;
  url: string;
  challenge_rating: number;
  type: string;
  size: string;
  alignment: string;
  legendary_actions?: any[];
  // Fields for AddParticipantForm pre-loading
  hit_points: number;
  armor_class: { value: number; type: string }[];
  dexterity: number;
  damage_vulnerabilities: string[];
  damage_resistances: string[];
  damage_immunities: string[];
  condition_immunities: { name: string; [key: string]: any }[];
  special_abilities?: { name: string; [key: string]: any }[];
}

export interface MagicItemSummary {
  index: string;
  name: string;
  url: string;
  rarity: { name: string };
  equipment_category: { name: string };
  requires_attunement: string;
  desc: string[];
}