import { useRef, useState } from 'react';
import {
  AlertCircle,
  Box,
  Calculator,
  Check,
  Copy,
  Delete,
  Equal,
  History,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type { ExplanationMode, Language } from '../types';
import {
  calculateGeometryFormula,
  evaluateMathInput,
  type EngineResult,
  type GeometryCalcShape,
} from '../utils/mathEngine';
import {
  addCalcHistory,
  clearCalcHistoryStorage,
  loadCalcHistory,
  type CalcHistoryEntry,
} from '../utils/storage';
import { t } from '../data/i18n';

interface SmartCalculatorViewProps {
  language: Language;
  defaultExplanationMode?: ExplanationMode;
}

const SHAPE_OPTIONS: Array<{
  id: GeometryCalcShape;
  labelEn: string;
  labelUr: string;
  fieldA: string;
  fieldB?: string;
  fieldC?: string;
}> = [
  { id: 'rectangle', labelEn: 'Rectangle (Area & Perimeter)', labelUr: 'مستطیل (رقبہ اور احاطہ)', fieldA: 'Length (l) cm', fieldB: 'Width (w) cm' },
  { id: 'square', labelEn: 'Square (Area & Perimeter)', labelUr: 'مربع (رقبہ اور احاطہ)', fieldA: 'Side (s) cm' },
  { id: 'triangle', labelEn: 'Triangle (Area)', labelUr: 'مثلث (رقبہ)', fieldA: 'Base (b) cm', fieldB: 'Height (h) cm' },
  { id: 'circle', labelEn: 'Circle (Area & Circumference)', labelUr: 'دائرہ (رقبہ اور محیط)', fieldA: 'Radius (r) cm' },
  { id: 'cube', labelEn: 'Cube (Volume & Surface Area)', labelUr: 'مکعب (حجم اور سطحی رقبہ)', fieldA: 'Side (s) cm' },
  { id: 'cuboid', labelEn: 'Cuboid (Volume & TSA)', labelUr: 'مکعب نما (حجم اور سطحی رقبہ)', fieldA: 'Length (l) cm', fieldB: 'Width (w) cm', fieldC: 'Height (h) cm' },
  { id: 'cylinder', labelEn: 'Cylinder (Volume & TSA)', labelUr: 'سلنڈر (حجم اور سطحی رقبہ)', fieldA: 'Radius (r) cm', fieldB: 'Height (h) cm' },
  { id: 'cone', labelEn: 'Cone (Volume & TSA)', labelUr: 'مخروط (حجم اور سطحی رقبہ)', fieldA: 'Radius (r) cm', fieldB: 'Height (h) cm' },
  { id: 'sphere', labelEn: 'Sphere (Volume & Surface Area)', labelUr: 'کرہ (حجم اور سطحی رقبہ)', fieldA: 'Radius (r) cm' },
];

export function SmartCalculatorView({
  language,
  defaultExplanationMode = 'detailed',
}: SmartCalculatorViewProps) {
  const isUr = language === 'ur';
  const [modeTab, setModeTab] = useState<'digital' | 'geometry'>('digital');
  const [expr, setExpr] = useState('3(x − 2) + 4 = 13');
  const [expMode, setExpMode] = useState<ExplanationMode>(defaultExplanationMode);
  const [result, setResult] = useState<EngineResult | null>(() =>
    evaluateMathInput('3(x − 2) + 4 = 13')
  );
  const [history, setHistory] = useState<CalcHistoryEntry[]>(() => loadCalcHistory());
  const [copied, setCopied] = useState(false);

  // Geometry mode inputs
  const [geoShape, setGeoShape] = useState<GeometryCalcShape>('rectangle');
  const [dimA, setDimA] = useState('12');
  const [dimB, setDimB] = useState('8');
  const [dimC, setDimC] = useState('5');

  const inputRef = useRef<HTMLInputElement | null>(null);

  const insertToken = (token: string) => {
    const el = inputRef.current;
    if (!el) {
      setExpr((prev) => `${prev}${token}`);
      return;
    }
    const start = el.selectionStart ?? expr.length;
    const end = el.selectionEnd ?? expr.length;
    const next = expr.slice(0, start) + token + expr.slice(end);
    setExpr(next);
    requestAnimationFrame(() => {
      el.focus();
      const cursorPos = start + token.length;
      el.setSelectionRange(cursorPos, cursorPos);
    });
  };

  const handleDelete = () => {
    const el = inputRef.current;
    if (!el) {
      setExpr((prev) => prev.slice(0, -1));
      return;
    }
    const start = el.selectionStart ?? expr.length;
    const end = el.selectionEnd ?? expr.length;
    if (start !== end) {
      const next = expr.slice(0, start) + expr.slice(end);
      setExpr(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start, start);
      });
    } else if (start > 0) {
      const next = expr.slice(0, start - 1) + expr.slice(start);
      setExpr(next);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start - 1, start - 1);
      });
    }
  };

  const handleClearAll = () => {
    setExpr('');
    setResult(null);
    setCopied(false);
    inputRef.current?.focus();
  };

  const handleCalculate = (customInput?: string) => {
    const target = (customInput ?? expr).trim();
    if (customInput !== undefined) setExpr(customInput);
    const evaluated = evaluateMathInput(target);
    setResult(evaluated);
    setCopied(false);
    if (evaluated.ok && evaluated.correctAnswer) {
      setHistory(addCalcHistory(target, evaluated.correctAnswer));
    }
  };

  const handleCalculateGeometry = () => {
    const a = Number(dimA);
    const b = Number(dimB || 0);
    const c = Number(dimC || 0);
    const evaluated = calculateGeometryFormula(geoShape, a, b, c);
    setResult(evaluated);
    setCopied(false);
    if (evaluated.ok && evaluated.correctAnswer) {
      setHistory(addCalcHistory(evaluated.inputDisplay, evaluated.correctAnswer));
    }
  };

  const handleCopyAnswer = async () => {
    if (!result?.ok || !result.correctAnswer) return;
    try {
      await navigator.clipboard.writeText(result.correctAnswer);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback copy via temporary textarea
      const ta = document.createElement('textarea');
      ta.value = result.correctAnswer;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const quickExamples = [
    { label: '3(x − 2) + 4 = 13', descEn: 'Linear Eq', descUr: 'یک درجی مساوات' },
    { label: '2x + y = 7; x − y = 2', descEn: 'X & Y System', descUr: 'X اور Y مساوات' },
    { label: '(x + 3)(x + 2)', descEn: 'Expand', descUr: 'بریکٹ کھولیں' },
    { label: '5x + 3y − 2x + 7y', descEn: 'Simplify', descUr: 'مختصر کریں' },
    { label: '3/4 + 2/5', descEn: 'Fractions', descUr: 'کسور' },
    { label: '√(144) + 25% × 80', descEn: 'Root & %', descUr: 'جزر اور فیصد' },
    { label: 'x² − 5x + 6 = 0', descEn: 'Quadratic', descUr: 'دو درجی' },
  ];

  // Mobile-friendly tactile Digital Keyboard layout
  const keypadRows: Array<
    Array<{ label: string; insert?: string; action?: 'del' | 'clear' | 'calc'; variant?: 'num' | 'op' | 'alg' | 'primary' | 'danger' }>
  > = [
    [
      { label: 'x', insert: 'x', variant: 'alg' },
      { label: 'y', insert: 'y', variant: 'alg' },
      { label: '(', insert: '(', variant: 'op' },
      { label: ')', insert: ')', variant: 'op' },
      { label: '=', insert: ' = ', variant: 'alg' },
    ],
    [
      { label: 'x²', insert: '^2', variant: 'alg' },
      { label: '^', insert: '^', variant: 'op' },
      { label: '√', insert: '√(', variant: 'op' },
      { label: '%', insert: '%', variant: 'op' },
      { label: ';', insert: '; ', variant: 'alg' },
    ],
    [
      { label: '7', insert: '7', variant: 'num' },
      { label: '8', insert: '8', variant: 'num' },
      { label: '9', insert: '9', variant: 'num' },
      { label: '÷', insert: ' ÷ ', variant: 'op' },
      { label: 'DEL', action: 'del', variant: 'danger' },
    ],
    [
      { label: '4', insert: '4', variant: 'num' },
      { label: '5', insert: '5', variant: 'num' },
      { label: '6', insert: '6', variant: 'num' },
      { label: '×', insert: ' × ', variant: 'op' },
      { label: 'AC', action: 'clear', variant: 'danger' },
    ],
    [
      { label: '1', insert: '1', variant: 'num' },
      { label: '2', insert: '2', variant: 'num' },
      { label: '3', insert: '3', variant: 'num' },
      { label: '−', insert: ' − ', variant: 'op' },
      { label: 'a/b', insert: '/', variant: 'op' },
    ],
    [
      { label: '0', insert: '0', variant: 'num' },
      { label: '.', insert: '.', variant: 'num' },
      { label: '+', insert: ' + ', variant: 'op' },
      { label: 'Calculate', action: 'calc', variant: 'primary' },
    ],
  ];

  const activeShapeMeta = SHAPE_OPTIONS.find((s) => s.id === geoShape) ?? SHAPE_OPTIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'اسمارٹ ڈیجیٹل ریاضی کیلکولیٹر' : 'Smart Digital Math Calculator'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isUr
              ? 'اعداد، کسور، فیصد، قوت نما، جزر، الجبرا، X اور Y کی مساواتیں، رقبہ، احاطہ اور حجم مرحلہ وار حل کریں۔'
              : 'Evaluate expressions, expand brackets, simplify algebra, solve X & Y equations, and compute area, perimeter & volume step-by-step.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setModeTab('digital')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
              modeTab === 'digital'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>{isUr ? 'ڈیجیٹل کیلکولیٹر' : 'Expression & Equation'}</span>
          </button>
          <button
            type="button"
            onClick={() => setModeTab('geometry')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
              modeTab === 'geometry'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{isUr ? 'رقبہ، احاطہ اور حجم' : 'Area, Perimeter & Volume'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Grid: Digital Keyboard + History */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 space-y-5">
          {modeTab === 'digital' ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
              {/* Expression Display Screen */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {isUr
                      ? 'عبارت یا مساوات درج کریں (دو مساواتوں کے لیے ";" لگائیں)'
                      : 'Enter expression or equation (use ";" for 2-equation X & Y systems)'}
                  </span>
                  {result?.ok && (
                    <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {result.kind.toUpperCase()}
                    </span>
                  )}
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={expr}
                  onChange={(e) => setExpr(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCalculate();
                    }
                  }}
                  placeholder="3(x − 2) + 4 = 13"
                  className="w-full bg-transparent font-mono text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none tabular-nums"
                  dir="ltr"
                />

                {result?.ok && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-base sm:text-lg font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {isUr ? 'درست جواب: ' : 'Correct Answer: '}
                      {result.correctAnswer}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyAnswer}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isUr ? 'کاپی ہو گیا' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isUr ? 'جواب کاپی کریں' : 'Copy Answer'}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Action Bar: Calculate, Delete, Clear All */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleCalculate()}
                  className="min-h-[48px] px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation"
                >
                  <Equal className="w-4 h-4" />
                  <span>{isUr ? 'حل کریں' : 'Calculate'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="min-h-[48px] px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation"
                >
                  <Delete className="w-4 h-4" />
                  <span>{isUr ? 'مٹائیں' : 'Delete'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="min-h-[48px] px-4 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-300 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer touch-manipulation"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isUr ? 'سب صاف کریں' : 'Clear All'}</span>
                </button>
              </div>

              {/* Large Mobile-Friendly Digital Keyboard */}
              <div className="space-y-2 select-none" dir="ltr">
                {keypadRows.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-5 gap-2">
                    {row.map((key) => {
                      const isCalc = key.action === 'calc';
                      const baseStyles =
                        key.variant === 'primary'
                          ? 'col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold'
                          : key.variant === 'danger'
                          ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-semibold'
                          : key.variant === 'alg'
                          ? 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold'
                          : key.variant === 'op'
                          ? 'bg-slate-200/80 hover:bg-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold';

                      return (
                        <button
                          key={key.label}
                          type="button"
                          onClick={() => {
                            if (key.action === 'del') handleDelete();
                            else if (key.action === 'clear') handleClearAll();
                            else if (key.action === 'calc') handleCalculate();
                            else if (key.insert) insertToken(key.insert);
                          }}
                          className={`min-h-[50px] sm:min-h-[54px] rounded-xl font-mono text-base sm:text-lg transition-transform active:scale-[0.97] flex items-center justify-center cursor-pointer touch-manipulation ${
                            isCalc ? 'col-span-2 text-sm sm:text-base ' : ''
                          }${baseStyles}`}
                        >
                          {key.label}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Quick Examples Strip */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isUr ? 'مثالیں آزمائیں:' : 'Try Class 8 Examples:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickExamples.map((ex) => (
                    <button
                      key={ex.label}
                      type="button"
                      onClick={() => handleCalculate(ex.label)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-blue-400 text-xs font-mono text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {ex.label} · {isUr ? ex.descUr : ex.descEn}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Geometry Area, Perimeter & Volume Calculator */
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                  {isUr ? 'جیومیٹری شکل منتخب کریں' : 'Select Geometric Shape or 3D Solid'}
                </label>
                <select
                  value={geoShape}
                  onChange={(e) => setGeoShape(e.target.value as GeometryCalcShape)}
                  className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-slate-100"
                >
                  {SHAPE_OPTIONS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {isUr ? s.labelUr : s.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">
                    {activeShapeMeta.fieldA}
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={dimA}
                    onChange={(e) => setDimA(e.target.value)}
                    className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-base tabular-nums"
                  />
                </div>
                {activeShapeMeta.fieldB && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      {activeShapeMeta.fieldB}
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={dimB}
                      onChange={(e) => setDimB(e.target.value)}
                      className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-base tabular-nums"
                    />
                  </div>
                )}
                {activeShapeMeta.fieldC && (
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      {activeShapeMeta.fieldC}
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={dimC}
                      onChange={(e) => setDimC(e.target.value)}
                      className="w-full min-h-[46px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-base tabular-nums"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleCalculateGeometry}
                className="min-h-[48px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>{isUr ? 'رقبہ، احاطہ یا حجم معلوم کریں' : 'Calculate Shape Metrics'}</span>
              </button>
            </div>
          )}

          {/* Error Banner */}
          {result && !result.ok && (
            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{isUr ? 'حساب یا مساوات میں خرابی' : 'Invalid Expression or Unsolvable Equation'}</span>
              </div>
              <p className="text-sm text-rose-800 dark:text-rose-200">{result.errorEn}</p>
              {result.errorUr && (
                <p className="text-sm font-urdu text-right text-rose-800 dark:text-rose-200" dir="rtl">
                  {result.errorUr}
                </p>
              )}
            </div>
          )}

          {/* Full Step-by-Step Bilingual Result Card */}
          {result && result.ok && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
              {/* Top Answer Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {isUr ? 'مکمل حل اور وضاحت' : 'Complete Solution & Explanation'} ·{' '}
                    <span className="font-mono">{result.inputDisplay}</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-300 font-mono tabular-nums mt-1">
                    {isUr ? 'درست جواب: ' : 'Correct Answer: '}
                    {result.correctAnswer}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setExpMode('short')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
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
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer ${
                        expMode === 'detailed'
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {t(language, 'detailedExplanation')}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyAnswer}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? (isUr ? 'کاپی ہو گیا' : 'Copied') : (isUr ? 'کاپی' : 'Copy Answer')}</span>
                  </button>
                </div>
              </div>

              {/* Short & Detailed Explanations (English + Urdu) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    English {expMode === 'short' ? 'Short' : 'Detailed'} Explanation
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {expMode === 'short' ? result.shortExplanationEn : result.detailedExplanationEn}
                  </p>
                  {expMode === 'detailed' && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                      <div className="text-xs font-semibold text-slate-500 mb-1">
                        Step-by-Step Solution
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {result.stepsEn.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                <div
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 font-urdu text-right"
                  dir="rtl"
                >
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    اردو {expMode === 'short' ? 'مختصر' : 'تفصیلی'} وضاحت
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-loose">
                    {expMode === 'short' ? result.shortExplanationUr : result.detailedExplanationUr}
                  </p>
                  {expMode === 'detailed' && (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                      <div className="text-xs font-semibold text-slate-500 mb-1">
                        مرحلہ وار حل
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                        {result.stepsUr.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              </div>

              {/* Complete Calculation & All Relevant Formulas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isUr ? 'مکمل حساب' : 'Complete Calculation'}
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 tabular-nums">
                    {result.completeCalculation.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {isUr ? 'تمام متعلقہ فارمولے' : 'All Relevant Formulas'}
                  </div>
                  <ul className="space-y-1.5 font-mono text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    {result.formulas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Calculation History Panel */}
        <aside className="xl:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <History className="w-4 h-4 text-blue-600" />
              <span>{isUr ? 'حسابات کی تاریخ' : 'Calculation History'}</span>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory(clearCalcHistoryStorage())}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isUr ? 'صاف کریں' : 'Clear'}</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {isUr
                ? 'آپ کی حل کردہ مساواتیں اور حسابات یہاں محفوظ ہوں گے۔'
                : 'Your solved expressions, equations, and geometry calculations appear here.'}
            </p>
          ) : (
            <ul className="space-y-2.5 max-h-[540px] overflow-y-auto">
              {history.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.input.match(/^(Rectangle|Square|Triangle|Circle|Cube|Cuboid|Cylinder|Cone|Sphere)/)) {
                        setModeTab('digital');
                        handleCalculate(item.input);
                      }
                    }}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-blue-400 text-left space-y-1 transition-colors cursor-pointer"
                  >
                    <div className="font-mono text-xs text-slate-600 dark:text-slate-400 truncate">
                      {item.input}
                    </div>
                    <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300 tabular-nums truncate">
                      = {item.answer}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
