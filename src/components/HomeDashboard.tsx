import {
  ArrowRight,
  BookMarked,
  Bot,
  Calculator,
  Camera,
  ClipboardCheck,
  Compass,
  FileText,
  ListChecks,
  Sparkles,
} from 'lucide-react';
import type { ChapterId, Language, SectionId, SolvedRecord, TestAttempt } from '../types';
import { CHAPTERS } from '../data/chaptersAndFormulas';
import { Chapter3DEmblem } from './MathVisuals';
import { t } from '../data/i18n';

interface HomeDashboardProps {
  language: Language;
  solvedRecords: Record<string, SolvedRecord>;
  testAttempts: TestAttempt[];
  bookmarksCount: number;
  onNavigate: (section: SectionId, chapterId?: ChapterId) => void;
}

export function HomeDashboard({
  language,
  solvedRecords,
  testAttempts,
  bookmarksCount,
  onNavigate,
}: HomeDashboardProps) {
  const isUr = language === 'ur';
  const solvedList = Object.values(solvedRecords);
  const correctCount = solvedList.filter((s) => s.isCorrect).length;

  return (
    <div className="space-y-8">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {isUr
                ? 'جماعت ہشتم · اردو اور انگریزی · بغیر لاگ ان'
                : 'Class 8 Mathematics · Urdu & English · Open Access'}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight [text-wrap:balance]">
              {isUr
                ? 'ریاضی حصہ دوم — اے آئی کے ساتھ سمجھیں، حل کریں اور ٹیسٹ دیں'
                : 'Master Class 8 Mathematics with Bilingual AI Guidance'}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {isUr
                ? 'پانچ مکمل ابواب، 1000 مختصر اور تفصیلی سوالات، اے آئی ریاضی استاد، کاپی اسکینر، انٹرایکٹو جیومیٹری ٹولز اور بغیر ٹائمر کے ٹیسٹ سسٹم۔'
                : 'Explore five Class 8 chapters with 1,000 verified Objective and Long questions, an interactive AI Math Teacher, AI Math Solver, Notebook Image Scanner, Geometry Lab, and self-paced tests.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('chapters')}
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isUr ? 'پانچ ابواب کھولیں' : 'Explore Five Chapters'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('teacher')}
              className="min-h-[46px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-blue-600" />
              <span>{isUr ? 'اے آئی استاد سے پوچھیں' : 'Ask AI Math Teacher'}</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 relative min-h-[240px]">
          <img
            src="/src/assets/images/hero_math_studio_1794928069843.jpg"
            alt="Class 8 Mathematics studio with compass, protractor, geometric solids, and gridded notebook"
            referrerPolicy="no-referrer"
            className="w-full h-full lg:h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/85 via-slate-950/40 to-transparent text-white">
            <div className="text-xs font-medium opacity-90">
              {isUr ? 'مختصر اور تفصیلی سوالات · تحریری جوابات' : 'Objective & Long Questions · Written Practice'}
            </div>
            <div className="text-sm font-bold mt-0.5">
              {isUr ? 'ہاتھ سے لکھی کاپی اسکین کریں یا جیومیٹری سمجھیں' : 'Scan Handwritten Notebooks or Explore 3D Geometry'}
            </div>
          </div>
        </div>
      </section>

      {/* Full-Width 4-Column KPI Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isUr ? 'کل دستیاب سوالات' : 'Verified Question Bank'}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            1,000
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isUr ? '500 مختصر · 500 تفصیلی' : '500 Objective · 500 Long'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isUr ? 'حل شدہ سوالات' : 'Questions Solved'}
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 tabular-nums mt-1">
            {solvedList.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 tabular-nums">
            {correctCount} {isUr ? 'درست جوابات' : 'correct answers'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isUr ? 'مکمل شدہ ٹیسٹ' : 'Tests Completed'}
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
            {testAttempts.length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t(language, 'noTimerNote')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {isUr ? 'بک مارکس اور محفوظ' : 'Saved Bookmarks'}
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            {bookmarksCount}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isUr ? 'مقامی طور پر محفوظ' : 'Saved locally on device'}
          </div>
        </div>
      </section>

      {/* Five Chapters Quick Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'جماعت ہشتم کے پانچ ابواب' : 'Five Class 8 Mathematics Chapters'}
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('chapters')}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {isUr ? 'مجموعی ڈیش بورڈ دیکھیں' : 'Combined Dashboard →'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => onNavigate('chapters', ch.id)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 rounded-2xl p-4 text-left flex flex-col justify-between gap-4 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums">
                  {isUr ? `باب ${ch.number}` : `Ch. 0${ch.number}`}
                </span>
                <Chapter3DEmblem chapterId={ch.id} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isUr ? ch.titleUr : ch.titleEn}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {isUr ? ch.subtitleUr : ch.subtitleEn}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* AI & Learning Tools Suite */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {isUr ? 'اے آئی اور تعلیمی ٹولز' : 'AI Studio & Interactive Math Tools'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              id: 'objective' as SectionId,
              icon: ListChecks,
              titleEn: 'Objective Questions',
              titleUr: 'مختصر سوالات',
              descEn: '10 to 100 short written questions per chapter with instant verification.',
              descUr: '10 سے 100 مختصر تحریری سوالات فوری جانچ کے ساتھ۔',
            },
            {
              id: 'long' as SectionId,
              icon: FileText,
              titleEn: 'Long Questions',
              titleUr: 'تفصیلی سوالات',
              descEn: 'Detailed multi-step problems with formulas and calculation steps.',
              descUr: 'فارمولوں اور مراحل کے ساتھ تفصیلی سوالات۔',
            },
            {
              id: 'solver' as SectionId,
              icon: Sparkles,
              titleEn: 'AI Math Solver',
              titleUr: 'اے آئی ریاضی حل کار',
              descEn: 'Check your own solution, find mistakes, and see complete working.',
              descUr: 'اپنا جواب چیک کریں، غلطی جانیں اور مکمل حل دیکھیں۔',
            },
            {
              id: 'scanner' as SectionId,
              icon: Camera,
              titleEn: 'Notebook Scanner',
              titleUr: 'کاپی اسکینر',
              descEn: 'Scan handwritten math notebook photos and get Urdu & English solutions.',
              descUr: 'ہاتھ سے لکھی کاپی کی تصویر سے اردو اور انگریزی حل حاصل کریں۔',
            },
            {
              id: 'tests' as SectionId,
              icon: ClipboardCheck,
              titleEn: 'Self-Paced Tests',
              titleUr: 'بغیر ٹائمر ٹیسٹ',
              descEn: 'Chapter or Combined 5-chapter tests with full Result Cards.',
              descUr: 'انفرادی یا مجموعی ٹیسٹ مکمل رزلٹ کارڈ کے ساتھ۔',
            },
            {
              id: 'calculator' as SectionId,
              icon: Calculator,
              titleEn: 'Smart Calculator',
              titleUr: 'اسمارٹ کیلکولیٹر',
              descEn: 'Arithmetic, percentages, fractions, powers, roots & basic algebra.',
              descUr: 'حساب، فیصد، کسور، مربع، جزر اور بنیادی الجبرا۔',
            },
            {
              id: 'formulas' as SectionId,
              icon: BookMarked,
              titleEn: 'Formula Library',
              titleUr: 'فارمولا لائبریری',
              descEn: 'Chapter-wise Class 8 formulas with Urdu & English examples.',
              descUr: 'تمام ابواب کے فارمولے اردو اور انگریزی مثالوں کے ساتھ۔',
            },
            {
              id: 'geometry-tools' as SectionId,
              icon: Compass,
              titleEn: 'Geometry Tools',
              titleUr: 'جیومیٹری ٹولز',
              descEn: 'Interactive shapes, angles, area, perimeter & 3D volume sliders.',
              descUr: 'انٹرایکٹو اشکال، زاویے، رقبہ، احاطہ اور 3D حجم۔',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onNavigate(card.id)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 rounded-2xl p-5 text-left space-y-2.5 transition-colors cursor-pointer"
              >
                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {isUr ? card.titleUr : card.titleEn}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {isUr ? card.descUr : card.descEn}
                </p>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
