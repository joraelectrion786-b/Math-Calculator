import { useMemo, useState } from 'react';
import { BookMarked, Search } from 'lucide-react';
import type { ChapterId, Language } from '../types';
import { CHAPTERS, FORMULAS } from '../data/chaptersAndFormulas';

interface FormulaLibraryViewProps {
  language: Language;
}

export function FormulaLibraryView({ language }: FormulaLibraryViewProps) {
  const isUr = language === 'ur';
  const [selectedChapter, setSelectedChapter] = useState<ChapterId | 'all'>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FORMULAS.filter((f) => {
      if (selectedChapter !== 'all' && f.chapterId !== selectedChapter) return false;
      if (!q) return true;
      return (
        f.nameEn.toLowerCase().includes(q) ||
        f.nameUr.includes(q) ||
        f.formula.toLowerCase().includes(q) ||
        f.explanationEn.toLowerCase().includes(q) ||
        f.explanationUr.includes(q)
      );
    });
  }, [selectedChapter, query]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'ریاضی فارمولا لائبریری' : 'Class 8 Formula Library'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {isUr
                ? 'پانچوں ابواب کے تمام اہم فارمولے، اردو اور انگریزی وضاحت اور مثالوں کے ساتھ'
                : 'Organized chapter-wise with mathematical expressions, Urdu & English explanations, and worked examples.'}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isUr ? 'فارمولا تلاش کریں...' : 'Filter formulas...'}
              className="w-full min-h-[42px] pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Chapter Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setSelectedChapter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              selectedChapter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isUr ? 'تمام ابواب' : 'All Chapters'}
          </button>
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              onClick={() => setSelectedChapter(ch.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                selectedChapter === ch.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {ch.number}. {isUr ? ch.titleUr : ch.titleEn}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const ch = CHAPTERS.find((c) => c.id === item.chapterId);
          return (
            <article
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {isUr ? `باب ${ch?.number}: ${ch?.titleUr}` : `Chapter ${ch?.number} · ${ch?.titleEn}`}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                    {item.nameEn}
                  </h2>
                  <div className="text-sm font-urdu text-slate-700 dark:text-slate-300" dir="rtl">
                    {item.nameUr}
                  </div>
                </div>
                <BookMarked className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm font-semibold text-blue-700 dark:text-blue-300 overflow-x-auto">
                {item.formula}
              </div>

              <div className="space-y-1.5 text-sm">
                <p className="text-slate-700 dark:text-slate-300">{item.explanationEn}</p>
                <p className="font-urdu text-right text-slate-600 dark:text-slate-400" dir="rtl">
                  {item.explanationUr}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1">
                <div className="font-mono text-emerald-700 dark:text-emerald-300">
                  Example: {item.exampleEn}
                </div>
                <div className="font-urdu text-right text-emerald-700 dark:text-emerald-300" dir="rtl">
                  مثال: {item.exampleUr}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
