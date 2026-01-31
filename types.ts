
export enum Category {
  FAMILY = 'Family',
  SCHOOL = 'School',
  ANIMALS = 'Animals',
  FOOD = 'Food',
  BODY = 'Body',
  COLORS = 'Colors',
  CUSTOM = 'Custom',
  NOTEBOOK = 'Notebook' // For reviewed words
}

export enum Difficulty {
  BEGINNER = 'Beginner', 
  INTERMEDIATE = 'Intermediate'
}

export interface Word {
  id: string;
  english: string;
  chinese: string;
  emoji: string;
  category: Category;
  pronunciation?: string;
  phonetic?: string;
  isMastered?: boolean;
}

export interface MagicList {
  id: string;
  title: string;
  emoji: string;
  words: Word[];
  createdAt: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: number;
}

export interface UserProgress {
  stars: number;
  level: number;
  exp: number;
  streak: number;
  lastVisit: number;
  learnedWordIds: string[];
  failedWordIds: string[];
}

export type ViewState = 'home' | 'learn' | 'quiz' | 'result' | 'generator' | 'spelling' | 'notebook';

export interface QuizQuestion {
  targetWord: Word;
  options: Word[];
}

export interface AIModelConfig {
  model: string;
  temperature: number;
  topK: number;
  topP: number;
  customApiKey?: string;
}
