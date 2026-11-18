import { BarChart3, CheckCircle2, Eye, XCircle } from 'lucide-react';
import type { Language, SolvedRecord, TestAttempt } from '../types';
import { CHAPTERS } from '../data/chaptersAndFormulas';
import { Chapter3DEmblem } from './MathVisuals';

interface ProgressReportViewProps {
  language: Language;
  solvedRecords: Record<string, SolvedRecord>;
  testAttempts: TestAttempt[];
  onViewTestResult: (attemptId: string) => void;
}

export function ProgressReportView({
  language,
  solvedRecords,
  testAttempts,
  onViewTestResult,
}: ProgressReportViewProps) {
  const isUr = language === 'ur';
  const TOTAL_BANK_QUESTIONS = 1000; // 5 chapters × (100 objective + 100 long)
  const solvedList = Object.values(solvedRecords);
  const totalSolved = solvedList.length;
  const remaining = Math.max(0, TOTAL_BANK_QUESTIONS - totalSolved);
  const correctCount = solvedList.filter((r) => r.isCorrect).length;
  const incorrectCount = totalSolved - correctCount;
  const overallPct = Math.round((totalSolved / TOTAL_BANK_QUESTIONS) * 100);
  const accuracyPct = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'کارکردگی اور پیشرفت رپورٹ' : 'Student Progress Report'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isUr
                ? 'آپ کی تمام مشقیں اور ٹیسٹ ریکارڈ مقامی طور پر محفوظ ہیں۔'
                : 'Overall Class 8 Mathematics mastery, chapter-by-chapter completion, and saved test history.'}
            </p>
          </div>
          <div className="text-right tabular-nums">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {isUr ? 'مجموعی درستگی' : 'Overall Accuracy'}
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {accuracyPct}%
            </div>
          </div>
        </div>

        {/* Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">{isUr ? 'کل حل شدہ سوالات' : 'Total Solved'}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
              {totalSolved}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500">{isUr ? 'باقی سوالات' : 'Remaining'}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
              {remaining}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isUr ? 'درست جوابات' : 'Correct'}</span>
            </div>
            <div className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 tabular-nums mt-1">
              {correctCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
            <div className="text-xs text-rose-700 dark:text-rose-300 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              <span>{isUr ? 'غلط جوابات' : 'Incorrect'}</span>
            </div>
            <div className="text-2xl font-bold text-rose-800 dark:text-rose-200 tabular-nums mt-1">
              {incorrectCount}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 col-span-2 lg:col-span-1">
            <div className="text-xs text-blue-700 dark:text-blue-300">
              {isUr ? 'مکمل کورس پیش رفت' : 'Course Progress'}
            </div>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200 tabular-nums mt-1">
              {overallPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Individual Chapter Progress */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'ابواب کے لحاظ سے کارکردگی' : 'Individual Chapter Progress'}
          </h2>
        </div>

        <div className="space-y-4">
          {CHAPTERS.map((ch) => {
            const chSolved = solvedList.filter((r) => r.chapterId === ch.id);
            const chCorrect = chSolved.filter((r) => r.isCorrect).length;
            const chWrong = chSolved.length - chCorrect;
            const pct = Math.min(100, Math.round((chSolved.length / 200) * 100));

            return (
              <div
                key={ch.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Chapter3DEmblem chapterId={ch.id} />
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {ch.number}. {isUr ? ch.titleUr : ch.titleEn}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                        {isUr ? 'حل شدہ' : 'Solved'}: {chSolved.length}/200 ·{' '}
                        {isUr ? 'درست' : 'Correct'}: {chCorrect} ·{' '}
                        {isUr ? 'غلط' : 'Incorrect'}: {chWrong}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {pct}%
                  </div>
                </div>

                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: ch.accentColor }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Previous Test Results */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isUr ? 'سابقہ ٹیسٹ کے نتائج' : 'Previous Test Results'}
        </h2>

        {testAttempts.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isUr
              ? 'ابھی تک کوئی ٹیسٹ مکمل نہیں ہوا۔ ٹیسٹ سیکشن میں جا کر پہلا ٹیسٹ دیں۔'
              : 'No tests recorded yet. Visit the Tests section to take your first self-paced test.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 pr-4 font-semibold">{isUr ? 'ٹیسٹ' : 'Test'}</th>
                  <th className="py-2.5 pr-4 font-semibold">{isUr ? 'درست' : 'Correct'}</th>
                  <th className="py-2.5 pr-4 font-semibold">{isUr ? 'نمبر' : 'Marks'}</th>
                  <th className="py-2.5 pr-4 font-semibold">{isUr ? 'فیصد' : 'Score'}</th>
                  <th className="py-2.5 font-semibold">{isUr ? 'عمل' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 tabular-nums">
                {testAttempts.map((a) => (
                  <tr key={a.id}>
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {isUr ? a.titleUr : a.titleEn}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(a.submittedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                      {a.correctCount} / {a.totalQuestions}
                    </td>
                    <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                      {a.obtainedMarks} / {a.totalMarks}
                    </td>
                    <td className="py-3 pr-4 font-bold text-blue-700 dark:text-blue-300">
                      {a.percentage}%
                    </td>
                    <td className="py-3">
                      <button
                        type="button"
                        onClick={() => onViewTestResult(a.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isUr ? 'دیکھیں' : 'View Card'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
