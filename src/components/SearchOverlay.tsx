import { useMemo, useState } from 'react';
import { BookMarked, CheckCircle2, Clock, Layers, Search, Trash2, X } from 'lucide-react';
import type { ChapterId, Language, MathQuestion, SectionId, SolvedRecord } from '../types';
import { CHAPTERS, FORMULAS } from '../data/chaptersAndFormulas';
import { getAllQuestionsFlat } from '../data/questionEngine';
import { t } from '../data/i18n';

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  language: Language;
  solvedRecords: Record<string, SolvedRecord>;
  searchHistory: string[];
  onRecordSearch: (query: string) => void;
  onClearHistory: () => void;
  onNavigateSection: (section: SectionId, chapterId?: ChapterId) => void;
  onOpenQuestionInTeacher: (q: MathQuestion) => void;
}

export function SearchOverlay({
  open,
  onClose,
  language,
  solvedRecords,
  searchHistory,
  onRecordSearch,
  onClearHistory,
  onNavigateSection,
  onOpenQuestionInTeacher,
}: SearchOverlayProps) {
  const isUr = language === 'ur';
  const [query, setQuery] = useState('');
  const [chapterFilter, setChapterFilter] = useState<ChapterId | 'all'>('all');

  const allQuestions = useMemo(() => getAllQuestionsFlat(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { chapters: [], formulas: [], solved: [], questions: [] };

    const chapters = CHAPTERS.filter((c) => {
      if (chapterFilter !== 'all' && c.id !== chapterFilter) return false;
      return (
        c.titleEn.toLowerCase().includes(q) ||
        c.titleUr.includes(q) ||
        c.subtitleEn.toLowerCase().includes(q) ||
        c.subtitleUr.includes(q)
      );
    });

    const formulas = FORMULAS.filter((f) => {
      if (chapterFilter !== 'all' && f.chapterId !== chapterFilter) return false;
      return (
        f.nameEn.toLowerCase().includes(q) ||
        f.nameUr.includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.explanationEn.toLowerCase().includes(q)
      );
    }).slice(0, 6);

    const matchingQuestions = allQuestions.filter((item) => {
      if (chapterFilter !== 'all' && item.chapterId !== chapterFilter) return false;
      return (
        item.questionEn.toLowerCase().includes(q) ||
        item.questionUr.includes(q) ||
        item.topicEn.toLowerCase().includes(q) ||
        item.topicUr.includes(q) ||
        item.correctAnswer.toLowerCase().includes(q)
      );
    });

    const solved = matchingQuestions
      .filter((item) => Boolean(solvedRecords[item.id]))
      .slice(0, 5);
    const questions = matchingQuestions.slice(0, 8);

    return { chapters, formulas, solved, questions };
  }, [query, chapterFilter, allQuestions, solvedRecords]);

  if (!open) return null;

  const commitQuery = (val: string) => {
    setQuery(val);
    if (val.trim().length >= 2) {
      onRecordSearch(val.trim());
    }
  };

  const hasAnyResult =
    results.chapters.length +
      results.formulas.length +
      results.solved.length +
      results.questions.length >
    0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center p-4 sm:pt-16">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  onRecordSearch(query.trim());
                }
              }}
              placeholder={t(language, 'searchPlaceholder')}
              className="w-full min-h-[42px] pl-10 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value as ChapterId | 'all')}
            className="min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200"
          >
            <option value="all">{t(language, 'allChapters')}</option>
            {CHAPTERS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.number}. {isUr ? c.titleUr : c.titleEn}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="min-w-[40px] min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {!query.trim() ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t(language, 'recentSearches')}</span>
                </span>
                {searchHistory.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearHistory}
                    className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{t(language, 'clearHistory')}</span>
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {isUr
                    ? 'کوئی لفظ لکھیں مثلاً: Pythagoras, triangle, cylinder, اوسط، مساوات'
                    : 'Try searching: Pythagoras, trapezium, compound interest, mean, cylinder, or Urdu terms.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((h, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => commitQuery(h)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : !hasAnyResult ? (
            <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {t(language, 'searchNoResults')}
            </div>
          ) : (
            <div className="space-y-5">
              {results.chapters.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isUr ? 'ابواب' : 'Chapters'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {results.chapters.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          onRecordSearch(query);
                          onNavigateSection('chapters', c.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left cursor-pointer"
                      >
                        <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {c.number}. {isUr ? c.titleUr : c.titleEn}
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-0.5">
                          {isUr ? c.subtitleUr : c.subtitleEn}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.formulas.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>{isUr ? 'فارمولے' : 'Formulas'}</span>
                  </div>
                  <div className="space-y-2">
                    {results.formulas.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          onRecordSearch(query);
                          onNavigateSection('formulas');
                          onClose();
                        }}
                        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {isUr ? f.nameUr : f.nameEn}
                        </span>
                        <span className="font-mono text-xs text-blue-600 dark:text-blue-400">
                          {f.formula}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.solved.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isUr ? 'پہلے سے حل شدہ سوالات' : 'Previously Solved Questions'}</span>
                  </div>
                  <div className="space-y-2">
                    {results.solved.map((q) => (
                      <button
                        key={`s-${q.id}`}
                        type="button"
                        onClick={() => {
                          onRecordSearch(query);
                          onNavigateSection('bookmarks');
                          onClose();
                        }}
                        className="w-full p-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-left cursor-pointer"
                      >
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {isUr ? q.questionUr : q.questionEn}
                        </div>
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5 font-mono">
                          {t(language, 'correctAnswer')}: {q.correctAnswer}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.questions.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isUr ? 'سوالات' : 'Questions'}
                  </div>
                  <div className="space-y-2">
                    {results.questions.map((q) => (
                      <div
                        key={q.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
                      >
                        <div className="flex-1 min-w-[200px]">
                          <div className="text-xs text-slate-500">
                            {isUr ? q.topicUr : q.topicEn} · {q.type === 'objective' ? 'Objective' : 'Long'} · {q.difficulty}
                          </div>
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mt-0.5">
                            {isUr ? q.questionUr : q.questionEn}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              onRecordSearch(query);
                              onNavigateSection(q.type === 'objective' ? 'objective' : 'long', q.chapterId);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                          >
                            {isUr ? 'کھولیں' : 'Practice'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onRecordSearch(query);
                              onOpenQuestionInTeacher(q);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium cursor-pointer"
                          >
                            {t(language, 'askTeacher')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
