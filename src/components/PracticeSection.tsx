import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, ClipboardCheck, Layers } from 'lucide-react';
import type {
  ChapterId,
  Difficulty,
  ExplanationMode,
  Language,
  MathQuestion,
  QuestionType,
  SolvedRecord,
} from '../types';
import { CHAPTERS } from '../data/chaptersAndFormulas';
import { getChapterQuestions, getCombinedQuestions } from '../data/questionEngine';
import { t } from '../data/i18n';
import { QuestionCard } from './QuestionCard';
import { Chapter3DEmblem } from './MathVisuals';

const QUESTION_COUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface PracticeSectionProps {
  mode: 'chapters' | 'objective' | 'long';
  selectedChapter: ChapterId | 'all';
  onSelectChapter: (chapter: ChapterId | 'all') => void;
  language: Language;
  defaultExplanationMode: ExplanationMode;
  solvedRecords: Record<string, SolvedRecord>;
  bookmarks: string[];
  favourites: string[];
  onSubmitAnswer: (q: MathQuestion, userAnswer: string, isCorrect: boolean) => void;
  onToggleBookmark: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onAskTeacher: (q: MathQuestion) => void;
  onStartTestForSelection: (
    chapter: ChapterId | 'all',
    type: QuestionType,
    count: number,
    difficulty: Difficulty | 'all'
  ) => void;
}

export function PracticeSection({
  mode,
  selectedChapter,
  onSelectChapter,
  language,
  defaultExplanationMode,
  solvedRecords,
  bookmarks,
  favourites,
  onSubmitAnswer,
  onToggleBookmark,
  onToggleFavourite,
  onAskTeacher,
  onStartTestForSelection,
}: PracticeSectionProps) {
  const [questionType, setQuestionType] = useState<QuestionType>(
    mode === 'long' ? 'long' : 'objective'
  );
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all');
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 10;

  const activeType: QuestionType =
    mode === 'objective' ? 'objective' : mode === 'long' ? 'long' : questionType;

  const questions = useMemo(() => {
    let pool: MathQuestion[] = [];
    if (selectedChapter === 'all') {
      pool = getCombinedQuestions(activeType, questionCount, difficulty);
    } else {
      const allForChapter = getChapterQuestions(selectedChapter, activeType);
      const filtered =
        difficulty === 'all'
          ? allForChapter
          : allForChapter.filter((q) => q.difficulty === difficulty);
      pool = filtered.slice(0, questionCount);
    }
    return pool;
  }, [selectedChapter, activeType, questionCount, difficulty]);

  const totalPages = Math.max(1, Math.ceil(questions.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visibleQuestions = questions.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const isUr = language === 'ur';

  const getChapterStats = (chapterId: ChapterId) => {
    const solved = Object.values(solvedRecords).filter((r) => r.chapterId === chapterId);
    const correct = solved.filter((r) => r.isCorrect).length;
    return { solvedCount: solved.length, correctCount: correct, total: 200 };
  };

  const activeChapterMeta = CHAPTERS.find((c) => c.id === selectedChapter);

  return (
    <div className="space-y-6">
      {/* Chapter Selector & Combined Dashboard Grid (always visible in 'chapters' mode, compact selector in 'objective'/'long') */}
      {mode === 'chapters' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isUr ? 'پانچ ریاضی ابواب اور مجموعی ڈیش بورڈ' : 'Five Mathematics Chapters & Combined Dashboard'}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isUr
                  ? 'کسی ایک باب یا پانچوں ابواب کے مجموعی ڈیش بورڈ سے مختصر اور تفصیلی سوالات کی مشق کریں۔'
                  : 'Open any individual Class 8 chapter or practice across all five chapters combined.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectChapter('all');
                setPage(1);
              }}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedChapter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t(language, 'allChapters')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {CHAPTERS.map((ch) => {
              const stats = getChapterStats(ch.id);
              const isSelected = selectedChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => {
                    onSelectChapter(ch.id);
                    setPage(1);
                  }}
                  className={`text-left p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isUr ? `باب ${ch.number}` : `Chapter 0${ch.number}`} · 200 {isUr ? 'سوالات' : 'Questions'}
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {isUr ? ch.titleUr : ch.titleEn}
                      </h2>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {isUr ? ch.subtitleUr : ch.subtitleEn}
                      </p>
                    </div>
                    <Chapter3DEmblem chapterId={ch.id} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                      <span>
                        {isUr ? 'حل شدہ' : 'Solved'}: {stats.solvedCount} / {stats.total}
                      </span>
                      <span>
                        {isUr ? 'درست' : 'Correct'}: {stats.correctCount}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 transition-all"
                        style={{ width: `${Math.min(100, Math.round((stats.solvedCount / stats.total) * 100))}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Workspace Header + Filter Controls */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5" />
              <span>
                {selectedChapter === 'all'
                  ? t(language, 'allChapters')
                  : isUr
                  ? `باب ${activeChapterMeta?.number}: ${activeChapterMeta?.titleUr}`
                  : `Chapter ${activeChapterMeta?.number}: ${activeChapterMeta?.titleEn}`}
              </span>
              <span aria-hidden="true">·</span>
              <span>{t(language, 'noMcqNotice')}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {activeType === 'objective' ? t(language, 'objectiveTitle') : t(language, 'longTitle')}
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              onStartTestForSelection(selectedChapter, activeType, questionCount, difficulty)
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>{t(language, 'takeTest')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Chapter dropdown */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {t(language, 'selectChapter')}
            </label>
            <select
              value={selectedChapter}
              onChange={(e) => {
                onSelectChapter(e.target.value as ChapterId | 'all');
                setPage(1);
              }}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="all">{t(language, 'allChapters')}</option>
              {CHAPTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.number}. {isUr ? c.titleUr : c.titleEn}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type Toggle (when inside Chapters mode) */}
          {mode === 'chapters' ? (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {isUr ? 'سوالات کی قسم' : 'Question Section'}
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl min-h-[42px]">
                <button
                  type="button"
                  onClick={() => {
                    setQuestionType('objective');
                    setPage(1);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    questionType === 'objective'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isUr ? 'مختصر' : 'Objective'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuestionType('long');
                    setPage(1);
                  }}
                  className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    questionType === 'long'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isUr ? 'تفصیلی' : 'Long'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {isUr ? 'سوالات کی قسم' : 'Question Type'}
              </label>
              <div className="min-h-[42px] px-3 flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-700 dark:text-slate-200">
                {activeType === 'objective' ? t(language, 'objectiveTitle') : t(language, 'longTitle')}
              </div>
            </div>
          )}

          {/* Question Count Selector: 10..100 */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {t(language, 'questionCount')} (10–100)
            </label>
            <select
              value={questionCount}
              onChange={(e) => {
                setQuestionCount(Number(e.target.value));
                setPage(1);
              }}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm tabular-nums"
            >
              {QUESTION_COUNTS.map((cnt) => (
                <option key={cnt} value={cnt}>
                  {cnt} {t(language, 'questionCount')}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              {t(language, 'difficulty')}
            </label>
            <select
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value as Difficulty | 'all');
                setPage(1);
              }}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm"
            >
              <option value="all">{t(language, 'allDifficulties')}</option>
              <option value="easy">{t(language, 'easy')}</option>
              <option value="medium">{t(language, 'medium')}</option>
              <option value="hard">{t(language, 'hard')}</option>
            </select>
          </div>
        </div>
      </section>

      {/* Questions List */}
      <div className="space-y-4">
        {visibleQuestions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
            {isUr
              ? 'اس فلٹر کے تحت کوئی سوال دستیاب نہیں۔'
              : 'No questions match the current filter. Try selecting All Levels.'}
          </div>
        ) : (
          visibleQuestions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={(safePage - 1) * PAGE_SIZE + i}
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
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {isUr
              ? `صفحہ ${safePage} از ${totalPages} (کل ${questions.length} سوالات)`
              : `Page ${safePage} of ${totalPages} (${questions.length} questions loaded)`}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium disabled:opacity-40 cursor-pointer"
            >
              {t(language, 'previous')}
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium disabled:opacity-40 cursor-pointer"
            >
              {t(language, 'next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
