import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import type {
  ChapterId,
  Difficulty,
  ExplanationMode,
  Language,
  MathQuestion,
  QuestionType,
  TestAttempt,
} from '../types';
import { CHAPTERS } from '../data/chaptersAndFormulas';
import {
  checkStudentAnswer,
  getChapterQuestions,
  getCombinedQuestions,
  getQuestionById,
} from '../data/questionEngine';
import { t } from '../data/i18n';

const COUNTS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

interface TestsViewProps {
  language: Language;
  initialConfig?: {
    chapter: ChapterId | 'all';
    type: QuestionType;
    count: number;
    difficulty: Difficulty | 'all';
  } | null;
  onCompleteTest: (attempt: TestAttempt) => void;
}

export function TestsView({ language, initialConfig, onCompleteTest }: TestsViewProps) {
  const isUr = language === 'ur';

  const [mode, setMode] = useState<'chapter' | 'combined'>(
    initialConfig?.chapter === 'all' ? 'combined' : 'chapter'
  );
  const [chapterId, setChapterId] = useState<ChapterId>(
    initialConfig?.chapter && initialConfig.chapter !== 'all'
      ? initialConfig.chapter
      : 'numbers'
  );
  const [questionType, setQuestionType] = useState<QuestionType>(
    initialConfig?.type ?? 'objective'
  );
  const [count, setCount] = useState<number>(initialConfig?.count ?? 10);
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>(
    initialConfig?.difficulty ?? 'all'
  );

  // Active test session
  const [activeQuestions, setActiveQuestions] = useState<MathQuestion[] | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [reviewOpen, setReviewOpen] = useState(false);

  const startTest = () => {
    let list: MathQuestion[] = [];
    if (mode === 'combined') {
      list = getCombinedQuestions(questionType, count, difficulty);
    } else {
      const pool = getChapterQuestions(chapterId, questionType);
      const filtered =
        difficulty === 'all' ? pool : pool.filter((q) => q.difficulty === difficulty);
      list = filtered.slice(0, count);
    }
    setActiveQuestions(list);
    setCurrentIdx(0);
    setAnswers({});
    setReviewOpen(false);
  };

  const handleSubmit = () => {
    if (!activeQuestions || activeQuestions.length === 0) return;

    const results = activeQuestions.map((q) => {
      const ans = answers[q.id] ?? '';
      const ok = checkStudentAnswer(ans, q);
      return {
        questionId: q.id,
        userAnswer: ans,
        isCorrect: ok,
        marksEarned: ok ? q.marks : 0,
        maxMarks: q.marks,
      };
    });

    const correctCount = results.filter((r) => r.isCorrect).length;
    const incorrectCount = results.length - correctCount;
    const obtainedMarks = results.reduce((sum, r) => sum + r.marksEarned, 0);
    const totalMarks = results.reduce((sum, r) => sum + r.maxMarks, 0);
    const percentage = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;

    const chMeta = CHAPTERS.find((c) => c.id === chapterId);
    const titleEn =
      mode === 'combined'
        ? `Combined 5-Chapter ${questionType === 'objective' ? 'Objective' : 'Long'} Test`
        : `${chMeta?.titleEn} — ${questionType === 'objective' ? 'Objective' : 'Long'} Test`;
    const titleUr =
      mode === 'combined'
        ? `مجموعی پانچ ابواب ${questionType === 'objective' ? 'مختصر' : 'تفصیلی'} ٹیسٹ`
        : `${chMeta?.titleUr} — ${questionType === 'objective' ? 'مختصر' : 'تفصیلی'} ٹیسٹ`;

    const attempt: TestAttempt = {
      id: `test-${Date.now()}`,
      titleEn,
      titleUr,
      mode,
      chapterId: mode === 'combined' ? 'all' : chapterId,
      questionType,
      difficulty,
      questionIds: activeQuestions.map((q) => q.id),
      answers,
      results,
      totalQuestions: activeQuestions.length,
      correctCount,
      incorrectCount,
      obtainedMarks,
      totalMarks,
      percentage,
      submittedAt: new Date().toISOString(),
    };

    onCompleteTest(attempt);
    setActiveQuestions(null);
  };

  // Setup Screen
  if (!activeQuestions) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {t(language, 'noTimerNote')} · {t(language, 'noMcqNotice')}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'ٹیسٹ سینٹر (بغیر ٹائمر)' : 'Class 8 Self-Paced Test System'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {isUr
              ? 'کسی ایک باب یا پانچوں ابواب کا مشترکہ ٹیسٹ بنائیں۔ وقت کی کوئی قید نہیں۔'
              : 'Configure an Individual Chapter Test or a Combined Five-Chapter Test. Answer at your own pace with Next, Previous, Review, and Submit controls.'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
          {/* Testing Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              {isUr ? 'ٹیسٹ کا طریقہ' : 'Testing Mode'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('chapter')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'chapter'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {isUr ? 'انفرادی باب کا ٹیسٹ' : 'Individual Chapter Test'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isUr ? 'کسی ایک باب پر توجہ مرکوز کریں' : 'Focus deeply on one selected chapter'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('combined')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  mode === 'combined'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  {isUr ? 'پانچوں ابواب کا مجموعی ٹیسٹ' : 'Combined Five-Chapter Test'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {isUr ? 'تمام 5 ابواب سے متوازن سوالات' : 'Balanced mix across all 5 Class 8 chapters'}
                </div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mode === 'chapter' && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                  {t(language, 'selectChapter')}
                </label>
                <select
                  value={chapterId}
                  onChange={(e) => setChapterId(e.target.value as ChapterId)}
                  className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
                >
                  {CHAPTERS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.number}. {isUr ? c.titleUr : c.titleEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {isUr ? 'سوالات کی قسم' : 'Question Type'}
              </label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="objective">{t(language, 'objectiveTitle')}</option>
                <option value="long">{t(language, 'longTitle')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t(language, 'questionCount')}
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100 tabular-nums"
              >
                {COUNTS.map((c) => (
                  <option key={c} value={c}>
                    {c} {t(language, 'questionCount')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                {t(language, 'difficulty')}
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty | 'all')}
                className="w-full min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
              >
                <option value="all">{t(language, 'allDifficulties')}</option>
                <option value="easy">{t(language, 'easy')}</option>
                <option value="medium">{t(language, 'medium')}</option>
                <option value="hard">{t(language, 'hard')}</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={startTest}
            className="min-h-[46px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t(language, 'takeTest')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Active Test Runner
  const currentQ = activeQuestions[currentIdx];
  const answeredCount = Object.values(answers).filter((v) => v.trim().length > 0).length;

  return (
    <div className="space-y-5">
      {/* Top Test Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {t(language, 'noTimerNote')} · {answeredCount} / {activeQuestions.length}{' '}
            {isUr ? 'جوابات دیے گئے' : 'answered'}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isUr ? `سوال ${currentIdx + 1} از ${activeQuestions.length}` : `Question ${currentIdx + 1} of ${activeQuestions.length}`}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setReviewOpen((r) => !r)}
            className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{t(language, 'reviewAnswers')}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="min-h-[40px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>{t(language, 'submitTest')}</span>
          </button>
        </div>
      </div>

      {/* Review Drawer */}
      {reviewOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'جوابات کا جائزہ (کسی بھی سوال پر کلک کریں)' : 'Answer Review — Jump to Any Question'}
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {activeQuestions.map((q, idx) => {
              const hasAns = Boolean((answers[q.id] ?? '').trim());
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    setCurrentIdx(idx);
                    setReviewOpen(false);
                  }}
                  className={`py-2 rounded-lg text-xs font-semibold tabular-nums border cursor-pointer ${
                    idx === currentIdx
                      ? 'bg-blue-600 text-white border-blue-600'
                      : hasAns
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Question Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span>{isUr ? currentQ.topicUr : currentQ.topicEn}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{currentQ.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {currentQ.marks} {isUr ? 'نمبر' : 'Marks'}
          </span>
        </div>

        <div className="space-y-2">
          <p
            className={`text-lg font-semibold text-slate-900 dark:text-slate-100 ${
              isUr ? 'font-urdu text-right' : ''
            }`}
            dir={isUr ? 'rtl' : 'ltr'}
          >
            {isUr ? currentQ.questionUr : currentQ.questionEn}
          </p>
          <p
            className={`text-sm text-slate-500 dark:text-slate-400 ${
              isUr ? 'text-left' : 'font-urdu text-right'
            }`}
            dir={isUr ? 'ltr' : 'rtl'}
          >
            {isUr ? currentQ.questionEn : currentQ.questionUr}
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            {t(language, 'yourAnswer')}
          </label>
          <input
            type="text"
            value={answers[currentQ.id] ?? ''}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [currentQ.id]: e.target.value }))
            }
            placeholder={
              isUr ? 'اپنا تحریری جواب یہاں لکھیں...' : 'Type your exact answer here...'
            }
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t(language, 'previous')}</span>
          </button>

          {currentIdx < activeQuestions.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIdx((i) => Math.min(activeQuestions.length - 1, i + 1))}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t(language, 'next')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{t(language, 'submitTest')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface ResultsViewProps {
  language: Language;
  defaultExplanationMode: ExplanationMode;
  attempts: TestAttempt[];
  selectedAttemptId: string | null;
  onSelectAttempt: (id: string) => void;
  onGoToTests: () => void;
}

export function ResultsView({
  language,
  defaultExplanationMode,
  attempts,
  selectedAttemptId,
  onSelectAttempt,
  onGoToTests,
}: ResultsViewProps) {
  const isUr = language === 'ur';
  const [expMode, setExpMode] = useState<ExplanationMode>(defaultExplanationMode);

  const activeAttempt = useMemo(() => {
    if (attempts.length === 0) return null;
    if (selectedAttemptId) {
      return attempts.find((a) => a.id === selectedAttemptId) ?? attempts[0];
    }
    return attempts[0];
  }, [attempts, selectedAttemptId]);

  if (!activeAttempt) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-4">
        <Award className="w-10 h-10 text-blue-600 mx-auto" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'ابھی تک کوئی ٹیسٹ جمع نہیں کرایا گیا' : 'No Test Results Yet'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isUr
              ? 'اپنا مکمل رزلٹ کارڈ دیکھنے کے لیے پہلے ایک ٹیسٹ مکمل کریں۔'
              : 'Complete a chapter or combined test to view your full Result Card and detailed explanations.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToTests}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer"
        >
          {t(language, 'takeTest')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Attempt Switcher */}
      {attempts.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isUr ? 'گذشتہ ٹیسٹ منتخب کریں' : 'Select Test Result Card'}
          </span>
          <select
            value={activeAttempt.id}
            onChange={(e) => onSelectAttempt(e.target.value)}
            className="min-h-[40px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
          >
            {attempts.map((a) => (
              <option key={a.id} value={a.id}>
                {(isUr ? a.titleUr : a.titleEn)} — {a.percentage}% ({new Date(a.submittedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Complete Result Card */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isUr ? 'مکمل رزلٹ کارڈ' : 'Complete Result Card'} ·{' '}
              {new Date(activeAttempt.submittedAt).toLocaleString()}
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {isUr ? activeAttempt.titleUr : activeAttempt.titleEn}
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setExpMode('short')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                expMode === 'short'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(language, 'shortExplanation')}
            </button>
            <button
              type="button"
              onClick={() => setExpMode('detailed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                expMode === 'detailed'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {t(language, 'detailedExplanation')}
            </button>
          </div>
        </div>

        {/* 5 KPI Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t(language, 'totalQuestions')}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
              {activeAttempt.totalQuestions}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-700 dark:text-emerald-300">
              {t(language, 'correctAnswers')}
            </div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 tabular-nums mt-1">
              {activeAttempt.correctCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <div className="text-xs text-rose-700 dark:text-rose-300">
              {t(language, 'incorrectAnswers')}
            </div>
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 tabular-nums mt-1">
              {activeAttempt.incorrectCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {t(language, 'obtainedMarks')}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
              {activeAttempt.obtainedMarks} / {activeAttempt.totalMarks}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 col-span-2 sm:col-span-1">
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {t(language, 'percentage')}
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 tabular-nums mt-1">
              {activeAttempt.percentage}%
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Question-by-Question Breakdown */}
      <div className="space-y-4">
        {activeAttempt.results.map((rec, idx) => {
          const q = getQuestionById(rec.questionId);
          if (!q) return null;
          return (
            <article
              key={rec.questionId}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                  {rec.isCorrect ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Q{idx + 1} · {t(language, 'correctStatus')}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-300">
                      <XCircle className="w-4 h-4" />
                      <span>
                        Q{idx + 1} · {t(language, 'incorrectStatus')}
                      </span>
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono tabular-nums text-slate-500">
                  {rec.marksEarned} / {rec.maxMarks} {isUr ? 'نمبر' : 'Marks'}
                </span>
              </div>

              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {isUr ? q.questionUr : q.questionEn}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-500 block">
                    {isUr ? 'آپ کا جواب' : 'Your Answer'}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                    {rec.userAnswer.trim() || (isUr ? 'جواب نہیں دیا گیا' : 'Not answered')}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <span className="text-xs text-blue-700 dark:text-blue-300 block">
                    {t(language, 'correctAnswer')}
                  </span>
                  <span className="font-mono font-semibold text-blue-800 dark:text-blue-200 tabular-nums">
                    {q.correctAnswer}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-semibold text-slate-500">English Explanation</div>
                  <p>{expMode === 'short' ? q.shortExplanationEn : q.detailedExplanationEn}</p>
                  {expMode === 'detailed' && (
                    <ol className="list-decimal list-inside pt-1 space-y-0.5">
                      {q.stepsEn.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
                <div
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-1 font-urdu text-right"
                  dir="rtl"
                >
                  <div className="font-semibold text-slate-500">اردو وضاحت</div>
                  <p>{expMode === 'short' ? q.shortExplanationUr : q.detailedExplanationUr}</p>
                  {expMode === 'detailed' && (
                    <ol className="list-decimal list-inside pt-1 space-y-0.5">
                      {q.stepsUr.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
