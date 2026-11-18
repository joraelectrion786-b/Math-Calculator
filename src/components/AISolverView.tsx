import { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Sparkles,
  Upload,
  X,
  XCircle,
} from 'lucide-react';
import type { ExplanationMode, Language, SolverResponse } from '../types';
import { fileToEncodedImage, urlToEncodedImage, type EncodedImage } from '../utils/imageHelper';
import { t } from '../data/i18n';

interface AISolverViewProps {
  language: Language;
  defaultExplanationMode: ExplanationMode;
}

export function AISolverView({ language, defaultExplanationMode }: AISolverViewProps) {
  const isUr = language === 'ur';
  const [question, setQuestion] = useState('');
  const [studentAnswer, setStudentAnswer] = useState('');
  const [mode, setMode] = useState<ExplanationMode>(defaultExplanationMode);
  const [image, setImage] = useState<EncodedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<SolverResponse | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const encoded = await fileToEncodedImage(file);
      setImage(encoded);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to read image.');
    }
  };

  const handleLoadSample = async () => {
    try {
      const encoded = await urlToEncodedImage('/src/assets/images/scanner_notebook_sample_1794928070344.jpg');
      setImage(encoded);
      setQuestion('Solve: 3x + 7 = 22');
      setStudentAnswer('x = 6');
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Could not load sample image.');
    }
  };

  const handleSolve = async () => {
    if (!question.trim() && !image) {
      setErrorMsg(
        isUr
          ? 'براہ کرم سوال لکھیں یا تصویر اپ لوڈ کریں۔'
          : 'Please enter a mathematical question or upload an image first.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          studentAnswer: studentAnswer.trim(),
          imageBase64: image?.base64,
          imageMimeType: image?.mimeType,
          language,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to solve the question.');
      }
      setResult(data as SolverResponse);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected solver error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'اے آئی ریاضی حل کار اور جواب چیکر' : 'AI Math Solver & Solution Checker'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isUr
              ? 'سوال ٹائپ کریں یا کاپی کی تصویر اپ لوڈ کریں، اپنا جواب چیک کریں اور غلطی کی نشاندہی حاصل کریں۔'
              : 'Type a question or upload a photo, enter your own solution to check it, and get full formulas and steps.'}
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setMode('short')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'short'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t(language, 'shortExplanation')}
          </button>
          <button
            type="button"
            onClick={() => setMode('detailed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              mode === 'detailed'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {t(language, 'detailedExplanation')}
          </button>
        </div>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {isUr ? 'ریاضی کا سوال لکھیں' : 'Mathematical Question'}
            </label>
            <textarea
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                isUr
                  ? 'مثال: 5x - 3 = 2x + 12 کو حل کریں، یا نیچے تصویر اپ لوڈ کریں...'
                  : 'e.g., Solve 5x - 3 = 2x + 12, or find the area of a circle with radius 14 cm...'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {isUr
                ? 'آپ کا اپنا حل یا جواب (اختیاری — جانچنے کے لیے)'
                : 'Your Own Solution / Answer (Optional — Check for Mistakes)'}
            </label>
            <textarea
              rows={2}
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder={
                isUr
                  ? 'اپنا حل یا جواب یہاں درج کریں تاکہ اے آئی غلطی بتا سکے...'
                  : 'Enter your answer or working steps to verify whether it is right or wrong...'
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSolve}
              disabled={loading}
              className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>
                {loading
                  ? isUr
                    ? 'حل کیا جا رہا ہے...'
                    : 'Solving & Checking...'
                  : isUr
                  ? 'حل کریں اور جواب چیک کریں'
                  : 'Solve & Check Answer'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isUr ? 'نمونہ سوال آزمائیں' : 'Try Sample Problem'}
            </button>
          </div>
        </div>

        {/* Image Upload Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {isUr ? 'کاپی یا سوال کی تصویر اپ لوڈ کریں' : 'Upload Notebook or Question Image'}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {image ? (
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950">
                <img
                  src={image.previewUrl}
                  alt="Uploaded question"
                  referrerPolicy="no-referrer"
                  className="w-full max-h-56 object-contain"
                />
                <button
                  type="button"
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-slate-900/80 text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full h-48 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
              >
                <ImagePlus className="w-8 h-8 text-blue-600" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isUr ? 'تصویر منتخب کریں' : 'Click to upload photo'}
                </span>
                <span className="text-xs">JPG, PNG, WEBP</span>
              </button>
            )}
          </div>

          {image && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUr ? 'دوسری تصویر اپ لوڈ کریں' : 'Upload Another Image'}</span>
            </button>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          {result.isUnclear ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{isUr ? 'تصویر یا سوال واضح نہیں ہے' : 'Image or Question Unclear'}</span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {result.unclearReasonEn || 'Please upload a clearer photo or type the question directly.'}
              </p>
              {result.unclearReasonUr && (
                <p className="text-sm font-urdu text-right text-amber-800 dark:text-amber-200" dir="rtl">
                  {result.unclearReasonUr}
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Student Answer Check Banner */}
              {result.hasStudentAnswer && (
                <div
                  className={`p-4 rounded-xl border space-y-2 ${
                    result.isStudentCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-base">
                    {result.isStudentCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-800 dark:text-emerald-200">
                          {isUr ? 'شاباش! آپ کا جواب بالکل درست ہے۔' : 'Correct! Your solution is right.'}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        <span className="text-rose-800 dark:text-rose-200">
                          {isUr ? 'آپ کا جواب درست نہیں ہے۔ نیچے غلطی دیکھیں:' : 'Incorrect Answer — Mistake Identified'}
                        </span>
                      </>
                    )}
                  </div>

                  {!result.isStudentCorrect && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-sm">
                      <div className="text-rose-900 dark:text-rose-100 space-y-1">
                        <div className="font-semibold">Mistake & Why Incorrect (English):</div>
                        <p>{result.mistakeEn}</p>
                        <p className="text-xs opacity-90">{result.whyIncorrectEn}</p>
                      </div>
                      <div className="text-rose-900 dark:text-rose-100 space-y-1 font-urdu text-right" dir="rtl">
                        <div className="font-semibold">غلطی کی نشاندہی (اردو):</div>
                        <p>{result.mistakeUr}</p>
                        <p className="text-xs opacity-90">{result.whyIncorrectUr}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recognized Question & Correct Answer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {isUr ? 'شناخت شدہ سوال' : 'Recognized Question'}
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {result.recognizedQuestion}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">
                    {t(language, 'correctAnswer')}
                  </div>
                  <div className="font-mono text-lg font-bold text-blue-800 dark:text-blue-200 tabular-nums">
                    {result.correctAnswer}
                  </div>
                </div>
              </div>

              {/* Explanations in English & Urdu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    English {mode === 'short' ? 'Short' : 'Detailed'} Explanation
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                    {mode === 'short' ? result.shortExplanationEn : result.detailedExplanationEn}
                  </p>
                  {mode === 'detailed' && result.stepsEn?.length > 0 && (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2">
                      {result.stepsEn.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>

                <div
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 font-urdu text-right"
                  dir="rtl"
                >
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    اردو {mode === 'short' ? 'مختصر' : 'تفصیلی'} وضاحت
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 leading-loose">
                    {mode === 'short' ? result.shortExplanationUr : result.detailedExplanationUr}
                  </p>
                  {mode === 'detailed' && result.stepsUr?.length > 0 && (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-2">
                      {result.stepsUr.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>

              {/* Formulas & Calculation Steps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t(language, 'formulasUsed')}
                  </div>
                  <ul className="space-y-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                    {result.formulas.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {t(language, 'calculationSteps')}
                  </div>
                  <ul className="space-y-1 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 tabular-nums">
                    {result.calculationSteps.map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
