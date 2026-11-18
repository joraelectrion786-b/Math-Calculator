import { useMemo, useState } from 'react';
import { Bookmark, CheckCircle2, Heart, Moon, Sun, Trash2, XCircle } from 'lucide-react';
import type {
  ExplanationMode,
  Language,
  MathQuestion,
  SolvedRecord,
  ThemeMode,
} from '../types';
import { getQuestionById } from '../data/questionEngine';
import { QuestionCard } from './QuestionCard';
import { t } from '../data/i18n';

interface BookmarksViewProps {
  language: Language;
  defaultExplanationMode: ExplanationMode;
  bookmarks: string[];
  favourites: string[];
  solvedRecords: Record<string, SolvedRecord>;
  onSubmitAnswer: (q: MathQuestion, userAnswer: string, isCorrect: boolean) => void;
  onToggleBookmark: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onAskTeacher: (q: MathQuestion) => void;
}

export function BookmarksView({
  language,
  defaultExplanationMode,
  bookmarks,
  favourites,
  solvedRecords,
  onSubmitAnswer,
  onToggleBookmark,
  onToggleFavourite,
  onAskTeacher,
}: BookmarksViewProps) {
  const isUr = language === 'ur';
  const [tab, setTab] = useState<'bookmarks' | 'favourites' | 'solved'>('bookmarks');

  const list = useMemo(() => {
    const ids =
      tab === 'bookmarks'
        ? bookmarks
        : tab === 'favourites'
        ? favourites
        : Object.keys(solvedRecords).reverse();

    return ids
      .map((id) => getQuestionById(id))
      .filter((q): q is MathQuestion => Boolean(q));
  }, [tab, bookmarks, favourites, solvedRecords]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'محفوظ شدہ سوالات اور سابقہ مشق' : 'Saved Questions & History'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isUr
              ? 'اپنے بک مارک، پسندیدہ اور پہلے سے حل کیے گئے سوالات دوبارہ دیکھیں۔'
              : 'Access your bookmarked questions, favourites, and previously solved problems anytime.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setTab('bookmarks')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              tab === 'bookmarks'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>
              {isUr ? 'بک مارکس' : 'Bookmarks'} ({bookmarks.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('favourites')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              tab === 'favourites'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>
              {isUr ? 'پسندیدہ' : 'Favourites'} ({favourites.length})
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTab('solved')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap ${
              tab === 'solved'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isUr ? 'حل شدہ' : 'Solved'} ({Object.keys(solvedRecords).length})
            </span>
          </button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          {tab === 'bookmarks'
            ? isUr
              ? 'ابھی کوئی سوال بک مارک نہیں کیا گیا۔ کسی بھی سوال پر بک مارک آئیکن دبائیں۔'
              : 'No bookmarked questions yet. Click Bookmark on any question card to save it here.'
            : tab === 'favourites'
            ? isUr
              ? 'ابھی کوئی پسندیدہ سوال محفوظ نہیں ہے۔'
              : 'No favourite questions yet. Click Favourite on any question card to save it here.'
            : isUr
            ? 'ابھی تک کوئی سوال حل نہیں کیا گیا۔'
            : 'No solved questions yet. Check answers in Objective or Long questions to build your history.'}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              language={language}
              defaultExplanationMode={defaultExplanationMode}
              isBookmarked={bookmarks.includes(q.id)}
              isFavourite={favourites.includes(q.id)}
              previousAnswer={
                solvedRecords[q.id]
                  ? {
                      userAnswer: solvedRecords[q.id].userAnswer,
                      isCorrect: solvedRecords[q.id].isCorrect,
                    }
                  : undefined
              }
              onSubmitAnswer={onSubmitAnswer}
              onToggleBookmark={onToggleBookmark}
              onToggleFavourite={onToggleFavourite}
              onAskTeacher={onAskTeacher}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SettingsViewProps {
  language: Language;
  theme: ThemeMode;
  explanationMode: ExplanationMode;
  onChangeLanguage: (lang: Language) => void;
  onChangeTheme: (theme: ThemeMode) => void;
  onChangeExplanationMode: (mode: ExplanationMode) => void;
  onResetProgress: () => void;
}

export function SettingsView({
  language,
  theme,
  explanationMode,
  onChangeLanguage,
  onChangeTheme,
  onChangeExplanationMode,
  onResetProgress,
}: SettingsViewProps) {
  const isUr = language === 'ur';
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {isUr ? 'ترتیبات (Settings)' : 'Platform Settings'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {isUr
            ? 'اپنی زبان، تھیم اور وضاحت کی ترجیحات منتخب کریں۔ کوئی لاگ ان درکار نہیں۔'
            : 'Customize your learning language, Light/Dark theme, and default explanation depth. Saved locally without an account.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800">
        {/* Language */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'پلیٹ فارم کی زبان' : 'Interface & Explanation Language'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isUr ? 'انگریزی اور اردو کے درمیان تبدیل کریں' : 'Switch between English and Urdu'}
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('ur')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                language === 'ur'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              اردو (Urdu)
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'ظاہری تھیم' : 'Appearance Mode'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isUr ? 'لائٹ یا ڈارک موڈ منتخب کریں' : 'Choose Light Mode or Dark Mode'}
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>{t(language, 'lightMode')}</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>{t(language, 'darkMode')}</span>
            </button>
          </div>
        </div>

        {/* Explanation Mode */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'بنیادی وضاحت کا انداز' : 'Default Explanation Depth'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isUr
                ? 'سوالات اور اے آئی جوابات کے لیے مختصر یا تفصیلی وضاحت'
                : 'Select Short or Detailed explanation mode by default'}
            </div>
          </div>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => onChangeExplanationMode('short')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                explanationMode === 'short'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(language, 'shortExplanation')}
            </button>
            <button
              type="button"
              onClick={() => onChangeExplanationMode('detailed')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                explanationMode === 'detailed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(language, 'detailedExplanation')}
            </button>
          </div>
        </div>

        {/* Reset Local Progress */}
        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'مقامی ریکارڈ صاف کریں' : 'Reset Local Study Data'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isUr
                ? 'حل شدہ سوالات، ٹیسٹ نتائج اور بک مارکس حذف کریں'
                : 'Clears solved history, test results, bookmarks, and search history on this device'}
            </div>
          </div>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isUr ? 'ڈیٹا صاف کریں' : 'Reset Progress'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                {isUr ? 'جی ہاں، صاف کریں' : 'Confirm Reset'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>{isUr ? 'منسوخ' : 'Cancel'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
