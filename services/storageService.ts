
import { MagicList, UserProgress } from '../types';

const MAGIC_LISTS_KEY = 'wonderwords_saved_lists';
const USER_PROGRESS_KEY = 'wonderwords_user_progress';

export const getSavedMagicLists = (): MagicList[] => {
  try {
    const stored = localStorage.getItem(MAGIC_LISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load magic lists", e);
    return [];
  }
};

export const saveMagicList = (list: MagicList) => {
  const current = getSavedMagicLists();
  const updated = [list, ...current].slice(0, 10);
  localStorage.setItem(MAGIC_LISTS_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteMagicList = (id: string) => {
  const current = getSavedMagicLists();
  const updated = current.filter(l => l.id !== id);
  localStorage.setItem(MAGIC_LISTS_KEY, JSON.stringify(updated));
  return updated;
};

// --- User Progress Persistence ---

export const INITIAL_PROGRESS: UserProgress = {
  stars: 0,
  level: 1,
  exp: 0,
  streak: 0,
  lastVisit: 0,
  learnedWordIds: [],
  failedWordIds: [],
};

export const getUserProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(USER_PROGRESS_KEY);
    if (!stored) return INITIAL_PROGRESS;
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_PROGRESS;
  }
};

export const saveUserProgress = (progress: UserProgress) => {
  localStorage.setItem(USER_PROGRESS_KEY, JSON.stringify(progress));
};

export const addStars = (amount: number) => {
  const p = getUserProgress();
  p.stars += amount;
  p.exp += amount * 10;
  
  // Simple Level Up logic: level = floor(exp/500) + 1
  const newLevel = Math.floor(p.exp / 500) + 1;
  if (newLevel > p.level) {
    p.level = newLevel;
  }
  
  saveUserProgress(p);
  return p;
};

export const markWordLearned = (wordId: string) => {
    const p = getUserProgress();
    if (!p.learnedWordIds.includes(wordId)) {
        p.learnedWordIds.push(wordId);
        saveUserProgress(p);
    }
};

export const markWordFailed = (wordId: string) => {
    const p = getUserProgress();
    if (!p.failedWordIds.includes(wordId)) {
        p.failedWordIds.push(wordId);
        saveUserProgress(p);
    }
};
