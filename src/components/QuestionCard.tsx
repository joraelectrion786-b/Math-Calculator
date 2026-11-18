import { useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Eye,
  EyeOff,
  Heart,
  MessageSquareText,
  XCircle,
} from 'lucide-react';
import type { ExplanationMode, Language, MathQuestion } from '../types';
import { CHAPTERS } from '../data/chaptersAndFormulas';
import { checkStudentAnswer } from '../data/questionEngine';
import { t } from '../data/i18n';

interface QuestionCardProps {
  question: MathQuestion;
  index: number;
  language: Language;
  defaultExplanationMode: ExplanationMode;
  isBookmarked: boolean;
  isFavourite: boolean;
  previousAnswer?: { userAnswer: string; isCorrect: boolean };
  onSubmitAnswer: (question: MathQuestion, userAnswer: string, isCorrect: boolean) => void;
  onToggleBookmark: (id: string) => void;
  onToggleFavourite: (id: string) => void;
  onAskTeacher: (question: MathQuestion) => void;
}

export function QuestionCard({
  question,
  index,
  language,
  defaultExplanationMode,
  isBookmarked,
  isFavourite,
  previousAnswer,
  onSubmitAnswer,
  onToggleBookmark,
  onToggleFavourite,
  onAskTeacher,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState(previousAnswer?.userAnswer ?? '');
  const [checkedState, setCheckedState] = useState<'idle' | 'correct' | 'incorrect'>(
    previousAnswer ? (previousAnswer.isCorrect ? 'correct' : 'incorrect') : 'idle'
  );
  const [showSolution, setShowSolution] = useState(false);
  const [expMode, setExpMode] = useState<ExplanationMode>(defaultExplanationMode);
  const [solutionLang, setSolutionLang] = useState<'active' | 'both'>('both');

  const chapter = CHAPTERS.find((c) => c.id === question.chapterId);
  const isUr = language === 'ur';

  const handleCheck = () => {
    if (!inputValue.trim()) return;
    const ok = checkStudentAnswer(inputValue, question);
    setCheckedState(ok ? 'correct' : 'incorrect');
    onSubmitAnswer(question, inputValue.trim(), ok);
    if (!ok) {
      setShowSolution(true);
    }
  };

  const diffLabel =
    question.difficulty === 'easy'
      ? t(language, 'easy')
      : question.difficulty === 'medium'
      ? t(language, 'medium')
      : t(language, 'hard');

  return (
    <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 transition-colors">
      {/* Unboxed clean metadata header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
            Q{index + 1}
          </span>
          <span aria-hidden="true">·</span>
          <span>{isUr ? chapter?.titleUr : chapter?.titleEn}</span>
          <span aria-hidden="true">·</span>
          <span>{isUr ? question.topicUr : question.topicEn}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">{diffLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {question.marks} {isUr ? 'نمبر' : 'Marks'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleBookmark(question.id)}
            aria-label={isBookmarked ? t(language, 'bookmarked') : t(language, 'bookmark')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
              isBookmarked
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline whitespace-nowrap">
              {isBookmarked ? t(language, 'bookmarked') : t(language, 'bookmark')}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavourite(question.id)}
            aria-label={isFavourite ? t(language, 'favourited') : t(language, 'favourite')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-[36px] ${
              isFavourite
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavourite ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline whitespace-nowrap">
              {isFavourite ? t(language, 'favourited') : t(language, 'favourite')}
            </span>
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mt-4 space-y-2">
        <p
          className={`text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 leading-relaxed ${
            isUr ? 'font-urdu text-right' : 'text-left'
          }`}
          dir={isUr ? 'rtl' : 'ltr'}
        >
          {isUr ? question.questionUr : question.questionEn}
        </p>
        <p
          className={`text-sm text-slate-500 dark:text-slate-400 ${
            isUr ? 'text-left' : 'font-urdu text-right'
          }`}
          dir={isUr ? 'ltr' : 'rtl'}
        >
          {isUr ? question.questionEn : question.questionUr}
        </p>
      </div>

      {/* Written Answer Bar (No MCQs) */}
      <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (checkedState !== 'idle') setCheckedState('idle');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCheck();
          }}
          placeholder={t(language, 'yourAnswer')}
          className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCheck}
            disabled={!inputValue.trim()}
            className="min-h-[44px] px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t(language, 'checkAnswer')}
          </button>
          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showSolution ? t(language, 'hideSolution') : t(language, 'showSolution')}</span>
          </button>
        </div>
      </div>

      {/* Verification Feedback */}
      {checkedState !== 'idle' && (
        <div
          className={`mt-3 flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm ${
            checkedState === 'correct'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:border-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {checkedState === 'correct' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" />
            )}
            <span>
              {checkedState === 'correct'
                ? t(language, 'correctStatus')
                : t(language, 'incorrectStatus')}
            </span>
          </div>
          <span className="font-mono font-semibold tabular-nums">
            {t(language, 'correctAnswer')}: {question.correctAnswer}
          </span>
        </div>
      )}

      {/* Expandable Bilingual Explanation & Steps */}
      {showSolution && (
        <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setExpMode('short')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
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
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  expMode === 'detailed'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {t(language, 'detailedExplanation')}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSolutionLang((m) => (m === 'both' ? 'active' : 'both'))}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
              >
                {solutionLang === 'both' ? 'English + اردو' : isUr ? 'اردو' : 'English'}
              </button>

              <button
                type="button"
                onClick={() => onAskTeacher(question)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors whitespace-nowrap"
              >
                <MessageSquareText className="w-3.5 h-3.5" />
                <span>{t(language, 'askTeacher')}</span>
              </button>
            </div>
          </div>

          {/* Correct Answer Box */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {t(language, 'correctAnswer')}
            </span>
            <span className="font-mono text-base font-bold text-blue-700 dark:text-blue-300 tabular-nums">
              {question.correctAnswer}
            </span>
          </div>

          {/* Explanation Text (Urdu + English) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(solutionLang === 'both' || !isUr) && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  English Explanation
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                  {expMode === 'short' ? question.shortExplanationEn : question.detailedExplanationEn}
                </p>
                {expMode === 'detailed' && (
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2">
                    {question.stepsEn.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}

            {(solutionLang === 'both' || isUr) && (
              <div
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 font-urdu text-right"
                dir="rtl"
              >
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  اردو وضاحت
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-loose">
                  {expMode === 'short' ? question.shortExplanationUr : question.detailedExplanationUr}
                </p>
                {expMode === 'detailed' && (
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2">
                    {question.stepsUr.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Formulas & Calculation Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {t(language, 'formulasUsed')}
              </div>
              <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                {question.formulas.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                {t(language, 'calculationSteps')}
              </div>
              <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 tabular-nums">
                {question.calculationSteps.map((step, i) => (
                  <li key={i}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
