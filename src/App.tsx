/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Bookmark,
  BookMarked,
  Bot,
  Calculator,
  Camera,
  ClipboardCheck,
  Compass,
  FileText,
  Home,
  Languages,
  Layers,
  ListChecks,
  Menu,
  Moon,
  Search,
  Settings,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import type {
  ChapterId,
  Difficulty,
  ExplanationMode,
  Language,
  MathQuestion,
  QuestionType,
  SectionId,
  SolvedRecord,
  TestAttempt,
  ThemeMode,
} from './types';
import { NAV_ITEMS, t } from './data/i18n';
import {
  addSearchHistory,
  clearAllLearningProgress,
  clearSearchHistoryStorage,
  loadBookmarks,
  loadExplanationMode,
  loadFavourites,
  loadLanguage,
  loadSearchHistory,
  loadSolvedRecords,
  loadTestAttempts,
  loadTheme,
  saveExplanationMode,
  saveLanguage,
  saveSolvedRecord,
  saveTestAttempt,
  saveTheme,
  toggleBookmarkId,
  toggleFavouriteId,
} from './utils/storage';
import { HomeDashboard } from './components/HomeDashboard';
import { PracticeSection } from './components/PracticeSection';
import { AITeacherView } from './components/AITeacherView';
import { AISolverView } from './components/AISolverView';
import { NotebookScannerView } from './components/NotebookScannerView';
import { ResultsView, TestsView } from './components/TestsAndResultsView';
import { ProgressReportView } from './components/ProgressReportView';
import { SmartCalculatorView } from './components/SmartCalculatorView';
import { FormulaLibraryView } from './components/FormulaLibraryView';
import { GeometryToolsView } from './components/GeometryToolsView';
import { BookmarksView, SettingsView } from './components/BookmarksAndSettingsView';
import { SearchOverlay } from './components/SearchOverlay';

const SECTION_ICONS: Record<SectionId, React.ComponentType<{ className?: string }>> = {
  home: Home,
  chapters: Layers,
  objective: ListChecks,
  long: FileText,
  teacher: Bot,
  solver: Sparkles,
  scanner: Camera,
  tests: ClipboardCheck,
  results: Award,
  progress: BarChart3,
  calculator: Calculator,
  formulas: BookMarked,
  'geometry-tools': Compass,
  bookmarks: Bookmark,
  settings: Settings,
};

export default function App() {
  const [section, setSection] = useState<SectionId>('home');
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>('all');
  const [language, setLanguage] = useState<Language>(() => loadLanguage());
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());
  const [explanationMode, setExplanationMode] = useState<ExplanationMode>(() =>
    loadExplanationMode()
  );

  const [solvedRecords, setSolvedRecords] = useState<Record<string, SolvedRecord>>(() =>
    loadSolvedRecords()
  );
  const [testAttempts, setTestAttempts] = useState<TestAttempt[]>(() => loadTestAttempts());
  const [bookmarks, setBookmarks] = useState<string[]>(() => loadBookmarks());
  const [favourites, setFavourites] = useState<string[]>(() => loadFavourites());
  const [searchHistory, setSearchHistory] = useState<string[]>(() => loadSearchHistory());

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [teacherPrompt, setTeacherPrompt] = useState<string | undefined>(undefined);
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [testPrefill, setTestPrefill] = useState<{
    chapter: ChapterId | 'all';
    type: QuestionType;
    count: number;
    difficulty: Difficulty | 'all';
  } | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    saveExplanationMode(explanationMode);
  }, [explanationMode]);

  const handleNavigate = (nextSection: SectionId, chapterId?: ChapterId) => {
    if (chapterId) setSelectedChapter(chapterId);
    setSection(nextSection);
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitAnswer = (q: MathQuestion, userAnswer: string, isCorrect: boolean) => {
    const updated = saveSolvedRecord({
      questionId: q.id,
      chapterId: q.chapterId,
      type: q.type,
      userAnswer,
      isCorrect,
      solvedAt: new Date().toISOString(),
    });
    setSolvedRecords(updated);
  };

  const handleToggleBookmark = (id: string) => {
    setBookmarks(toggleBookmarkId(id));
  };

  const handleToggleFavourite = (id: string) => {
    setFavourites(toggleFavouriteId(id));
  };

  const handleAskTeacher = (q: MathQuestion) => {
    const prompt =
      language === 'ur'
        ? `براہ کرم مجھے یہ سوال مرحلہ وار سمجھائیں: ${q.questionUr} (${q.questionEn})`
        : `Please teach me how to solve this Class 8 question step-by-step: ${q.questionEn}`;
    setTeacherPrompt(prompt);
    setSection('teacher');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartTestForSelection = (
    chapter: ChapterId | 'all',
    type: QuestionType,
    count: number,
    difficulty: Difficulty | 'all'
  ) => {
    setTestPrefill({ chapter, type, count, difficulty });
    setSection('tests');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteTest = (attempt: TestAttempt) => {
    const updatedAttempts = saveTestAttempt(attempt);
    setTestAttempts(updatedAttempts);
    // Also record solved questions into progress
    let latestSolved = loadSolvedRecords();
    for (const res of attempt.results) {
      const chId = (
        res.questionId.startsWith('num-')
          ? 'numbers'
          : res.questionId.startsWith('alg-')
          ? 'algebra'
          : res.questionId.startsWith('mea-')
          ? 'measurement'
          : res.questionId.startsWith('geo-')
          ? 'geometry'
          : 'statistics'
      ) as ChapterId;
      if (res.userAnswer.trim()) {
        latestSolved = saveSolvedRecord({
          questionId: res.questionId,
          chapterId: chId,
          type: attempt.questionType,
          userAnswer: res.userAnswer,
          isCorrect: res.isCorrect,
          solvedAt: attempt.submittedAt,
        });
      }
    }
    setSolvedRecords(latestSolved);
    setSelectedAttemptId(attempt.id);
    setSection('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetProgress = () => {
    clearAllLearningProgress();
    setSolvedRecords({});
    setTestAttempts([]);
    setBookmarks([]);
    setFavourites([]);
    setSearchHistory([]);
    setSelectedAttemptId(null);
  };

  const isUr = language === 'ur';

  const groupLabels: Record<'learn' | 'ai' | 'tools' | 'personal', string> = {
    learn: isUr ? 'اسباق اور سوالات' : 'Curriculum',
    ai: isUr ? 'اے آئی معاونت' : 'AI Studio',
    tools: isUr ? 'ٹیسٹ اور ٹولز' : 'Assessments & Tools',
    personal: isUr ? 'ذاتی ریکارڈ' : 'Saved & Preferences',
  };

  const renderNavLinks = () => (
    <div className="space-y-5">
      {(['learn', 'ai', 'tools', 'personal'] as const).map((groupKey) => (
        <div key={groupKey} className="space-y-1">
          <div className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500">
            {groupLabels[groupKey]}
          </div>
          {NAV_ITEMS.filter((n) => n.group === groupKey).map((item) => {
            const Icon = SECTION_ICONS[item.id];
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{isUr ? item.labelUr : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="lg:hidden min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => handleNavigate('home')}
            className="text-base sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t(language, 'brandTitle')}
          </button>
        </div>

        {/* Center Search Trigger */}
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex items-center gap-2.5 flex-1 max-w-md min-h-[40px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm hover:border-blue-400 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span className="truncate">{t(language, 'searchPlaceholder')}</span>
        </button>

        {/* Right Controls: Search (mobile), Language Switch, Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="sm:hidden min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setLanguage((l) => (l === 'en' ? 'ur' : 'en'))}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>{t(language, 'languageLabel')}</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme((th) => (th === 'light' ? 'dark' : 'light'))}
            aria-label="Toggle Light/Dark theme"
            className="min-w-[40px] min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="hidden md:inline">
              {theme === 'light' ? t(language, 'darkMode') : t(language, 'lightMode')}
            </span>
          </button>
        </div>
      </header>

      {/* Main Workspace Split */}
      <div className="flex-1 flex max-w-[1480px] w-full mx-auto">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/40 p-4 overflow-y-auto">
          {renderNavLinks()}
        </aside>

        {/* Mobile Drawer Navigation */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/60"
              onClick={() => setMobileNavOpen(false)}
            />
            <aside className="relative z-10 w-72 max-w-[82vw] bg-white dark:bg-slate-900 h-full p-4 overflow-y-auto border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {t(language, 'brandTitle')}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation"
                  className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {renderNavLinks()}
            </aside>
          </div>
        )}

        {/* Active Section Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {section === 'home' && (
            <HomeDashboard
              language={language}
              solvedRecords={solvedRecords}
              testAttempts={testAttempts}
              bookmarksCount={bookmarks.length + favourites.length}
              onNavigate={handleNavigate}
            />
          )}

          {(section === 'chapters' || section === 'objective' || section === 'long') && (
            <PracticeSection
              mode={section}
              selectedChapter={selectedChapter}
              onSelectChapter={setSelectedChapter}
              language={language}
              defaultExplanationMode={explanationMode}
              solvedRecords={solvedRecords}
              bookmarks={bookmarks}
              favourites={favourites}
              onSubmitAnswer={handleSubmitAnswer}
              onToggleBookmark={handleToggleBookmark}
              onToggleFavourite={handleToggleFavourite}
              onAskTeacher={handleAskTeacher}
              onStartTestForSelection={handleStartTestForSelection}
            />
          )}

          {section === 'teacher' && (
            <AITeacherView
              language={language}
              defaultExplanationMode={explanationMode}
              initialPrompt={teacherPrompt}
              onClearInitialPrompt={() => setTeacherPrompt(undefined)}
            />
          )}

          {section === 'solver' && (
            <AISolverView language={language} defaultExplanationMode={explanationMode} />
          )}

          {section === 'scanner' && (
            <NotebookScannerView language={language} defaultExplanationMode={explanationMode} />
          )}

          {section === 'tests' && (
            <TestsView
              language={language}
              initialConfig={testPrefill}
              onCompleteTest={handleCompleteTest}
            />
          )}

          {section === 'results' && (
            <ResultsView
              language={language}
              defaultExplanationMode={explanationMode}
              attempts={testAttempts}
              selectedAttemptId={selectedAttemptId}
              onSelectAttempt={setSelectedAttemptId}
              onGoToTests={() => handleNavigate('tests')}
            />
          )}

          {section === 'progress' && (
            <ProgressReportView
              language={language}
              solvedRecords={solvedRecords}
              testAttempts={testAttempts}
              onViewTestResult={(id) => {
                setSelectedAttemptId(id);
                handleNavigate('results');
              }}
            />
          )}

          {section === 'calculator' && (
            <SmartCalculatorView
              language={language}
              defaultExplanationMode={explanationMode}
            />
          )}

          {section === 'formulas' && <FormulaLibraryView language={language} />}

          {section === 'geometry-tools' && <GeometryToolsView language={language} />}

          {section === 'bookmarks' && (
            <BookmarksView
              language={language}
              defaultExplanationMode={explanationMode}
              bookmarks={bookmarks}
              favourites={favourites}
              solvedRecords={solvedRecords}
              onSubmitAnswer={handleSubmitAnswer}
              onToggleBookmark={handleToggleBookmark}
              onToggleFavourite={handleToggleFavourite}
              onAskTeacher={handleAskTeacher}
            />
          )}

          {section === 'settings' && (
            <SettingsView
              language={language}
              theme={theme}
              explanationMode={explanationMode}
              onChangeLanguage={setLanguage}
              onChangeTheme={setTheme}
              onChangeExplanationMode={setExplanationMode}
              onResetProgress={handleResetProgress}
            />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        language={language}
        solvedRecords={solvedRecords}
        searchHistory={searchHistory}
        onRecordSearch={(q) => setSearchHistory(addSearchHistory(q))}
        onClearHistory={() => setSearchHistory(clearSearchHistoryStorage())}
        onNavigateSection={handleNavigate}
        onOpenQuestionInTeacher={handleAskTeacher}
      />
    </div>
  );
}
