import type {
  ExplanationMode,
  Language,
  SolvedRecord,
  TestAttempt,
  ThemeMode,
} from '../types';

const KEYS = {
  language: 'math2_lang',
  theme: 'math2_theme',
  explanationMode: 'math2_exp_mode',
  solved: 'math2_solved_records',
  tests: 'math2_test_attempts',
  bookmarks: 'math2_bookmarks',
  favourites: 'math2_favourites',
  searchHistory: 'math2_search_history',
  calcHistory: 'math2_calc_history',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function loadLanguage(): Language {
  return safeRead<Language>(KEYS.language, 'en');
}

export function saveLanguage(lang: Language): void {
  safeWrite(KEYS.language, lang);
}

export function loadTheme(): ThemeMode {
  return safeRead<ThemeMode>(KEYS.theme, 'light');
}

export function saveTheme(theme: ThemeMode): void {
  safeWrite(KEYS.theme, theme);
}

export function loadExplanationMode(): ExplanationMode {
  return safeRead<ExplanationMode>(KEYS.explanationMode, 'detailed');
}

export function saveExplanationMode(mode: ExplanationMode): void {
  safeWrite(KEYS.explanationMode, mode);
}

export function loadSolvedRecords(): Record<string, SolvedRecord> {
  return safeRead<Record<string, SolvedRecord>>(KEYS.solved, {});
}

export function saveSolvedRecord(record: SolvedRecord): Record<string, SolvedRecord> {
  const current = loadSolvedRecords();
  const updated = { ...current, [record.questionId]: record };
  safeWrite(KEYS.solved, updated);
  return updated;
}

export function loadTestAttempts(): TestAttempt[] {
  return safeRead<TestAttempt[]>(KEYS.tests, []);
}

export function saveTestAttempt(attempt: TestAttempt): TestAttempt[] {
  const current = loadTestAttempts();
  const updated = [attempt, ...current].slice(0, 50);
  safeWrite(KEYS.tests, updated);
  return updated;
}

export function loadBookmarks(): string[] {
  return safeRead<string[]>(KEYS.bookmarks, []);
}

export function toggleBookmarkId(id: string): string[] {
  const current = loadBookmarks();
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [id, ...current];
  safeWrite(KEYS.bookmarks, updated);
  return updated;
}

export function loadFavourites(): string[] {
  return safeRead<string[]>(KEYS.favourites, []);
}

export function toggleFavouriteId(id: string): string[] {
  const current = loadFavourites();
  const updated = current.includes(id)
    ? current.filter((x) => x !== id)
    : [id, ...current];
  safeWrite(KEYS.favourites, updated);
  return updated;
}

export function loadSearchHistory(): string[] {
  return safeRead<string[]>(KEYS.searchHistory, []);
}

export function addSearchHistory(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return loadSearchHistory();
  const current = loadSearchHistory().filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );
  const updated = [trimmed, ...current].slice(0, 10);
  safeWrite(KEYS.searchHistory, updated);
  return updated;
}

export function clearSearchHistoryStorage(): string[] {
  safeWrite(KEYS.searchHistory, []);
  return [];
}

export interface CalcHistoryEntry {
  id: string;
  input: string;
  answer: string;
  timestamp: string;
}

export function loadCalcHistory(): CalcHistoryEntry[] {
  return safeRead<CalcHistoryEntry[]>(KEYS.calcHistory, []);
}

export function addCalcHistory(input: string, answer: string): CalcHistoryEntry[] {
  const current = loadCalcHistory();
  const entry: CalcHistoryEntry = {
    id: `calc-${Date.now()}`,
    input,
    answer,
    timestamp: new Date().toISOString(),
  };
  const filtered = current.filter((c) => c.input !== input);
  const updated = [entry, ...filtered].slice(0, 20);
  safeWrite(KEYS.calcHistory, updated);
  return updated;
}

export function clearCalcHistoryStorage(): CalcHistoryEntry[] {
  safeWrite(KEYS.calcHistory, []);
  return [];
}

export function clearAllLearningProgress(): void {
  localStorage.removeItem(KEYS.solved);
  localStorage.removeItem(KEYS.tests);
  localStorage.removeItem(KEYS.bookmarks);
  localStorage.removeItem(KEYS.favourites);
  localStorage.removeItem(KEYS.searchHistory);
  localStorage.removeItem(KEYS.calcHistory);
}
