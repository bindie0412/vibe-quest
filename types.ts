
export type EntryType = 'FIXED' | 'TASK';
export type Priority = 'Low' | 'Medium' | 'High';
export type Difficulty = 'Easy' | 'Normal' | 'Hard';
export type PersonaExpression = 'HAPPY' | 'NEUTRAL' | 'SAD' | 'ANGRY' | 'FOCUSED';
export type EntryStatus = 'ACTIVE' | 'COMPLETED' | 'INVALID';

export interface RepeatConfig {
  type: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: string[];
  dayOfMonth?: number;
}

export interface ScheduleEntry {
  id: string;
  title: string;
  memo: string;
  type: EntryType;
  dayOfWeek?: string;
  category?: string;
  date: string;
  startTime: string;
  endTime: string;
  projectId: string; 
  completed: boolean;
  status: EntryStatus;
  priority: Priority;
  difficulty: Difficulty;
  estimatedDuration: number;
  tags: string[];
  isLocked: boolean; 
  isRepeating: boolean;
  repeatConfig: RepeatConfig;
  xpEarned?: number;
  isPenaltyDeducted?: boolean;
  counterValue?: number;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  difficulty?: Difficulty;
}

export type ShopItemType = 'AVATAR' | 'EDIT_TICKET' | 'THEME' | 'QUOTE_PACK';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: ShopItemType;
  icon: string;
  owned: boolean;
  count?: number; 
  value?: string; 
}

export interface Achievement {
  id: string;
  category: 'COMBAT' | 'STUDY' | 'LIFE' | 'COLLECT' | 'MYSTIC';
  title: string;
  description: string;
  icon: string;
  rewardXp: number;
}

export interface Persona {
  level: number;
  xp: number;
  nextLevelXp: number;
  flameCount: number;
  avatar: string;
  decorations: string[];
  expression: PersonaExpression;
  unlockedAchievements: string[];
  lastActivityDate?: string;
  inventory: {
    editTickets: number;
    unlockedThemes: string[];
    unlockedQuotePacks: string[];
  };
}

export interface UserSettings {
  wakeTime: string;
  sleepTime: string;
  hasOnboarded: boolean;
  currentTheme: string;
}
