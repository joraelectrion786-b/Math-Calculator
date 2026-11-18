import { useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ScanText,
  Upload,
} from 'lucide-react';
import type { ExplanationMode, Language, ScannerResponse } from '../types';
import { fileToEncodedImage, urlToEncodedImage, type EncodedImage } from '../utils/imageHelper';
import { t } from '../data/i18n';

interface NotebookScannerViewProps {
  language: Language;
  defaultExplanationMode: ExplanationMode;
}

export function NotebookScannerView({
  language,
  defaultExplanationMode,
}: NotebookScannerViewProps) {
  const isUr = language === 'ur';
  const [image, setImage] = useState<EncodedImage | null>(null);
  const [mode, setMode] = useState<ExplanationMode>(defaultExplanationMode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannerResponse | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const encoded = await fileToEncodedImage(file);
      setImage(encoded);
      setScanResult(null);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to read image.');
    }
  };

  const handleUseSampleNotebook = async () => {
    setErrorMsg(null);
    try {
      const encoded = await urlToEncodedImage('/src/assets/images/scanner_notebook_sample_1794928070344.jpg');
      setImage(encoded);
      setScanResult(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load sample notebook photo.');
    }
  };

  const handleScan = async () => {
    if (!image) {
      setErrorMsg(
        isUr
          ? 'پہلے اپنی کاپی کی تصویر منتخب کریں۔'
          : 'Please upload or capture a notebook photo first.'
      );
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const res = await fetch('/api/ai/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: image.base64,
          imageMimeType: image.mimeType,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan notebook image.');
      }
      setScanResult(data as ScannerResponse);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Scanner request failed.');
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
            {isUr ? 'ہاتھ سے لکھی کاپی اسکینر' : 'Notebook Image Scanner'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {isUr
              ? 'اپنی ریاضی کی کاپی کی تصویر اپ لوڈ کریں؛ اے آئی تحریر پڑھ کر اردو اور انگریزی میں حل بتائے گا۔'
              : 'Upload a handwritten notebook photo. AI reads symbols & numbers and explains every solution in Urdu and English.'}
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

      {/* Upload & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleUpload}
            className="hidden"
          />

          {image ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-950">
              <img
                src={image.previewUrl}
                alt="Handwritten notebook page"
                referrerPolicy="no-referrer"
                className="w-full max-h-72 object-contain"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full h-64 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400 cursor-pointer transition-colors"
            >
              <Camera className="w-10 h-10 text-blue-600" />
              <div className="text-center px-4">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {isUr ? 'کاپی کی تصویر اپ لوڈ یا کیمرے سے لیں' : 'Upload or Capture Notebook Photo'}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {isUr ? 'صاف روشنی میں واضح تصویر بہتر نتائج دیتی ہے' : 'Bright, well-lit handwriting gives best accuracy'}
                </div>
              </div>
            </button>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleScan}
              disabled={loading || !image}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanText className="w-4 h-4" />}
              <span>
                {loading
                  ? isUr
                    ? 'اسکین اور حل جاری ہے...'
                    : 'Scanning & Solving...'
                  : isUr
                  ? 'اسکین کریں اور حل دیکھیں'
                  : 'Scan & Solve Notebook'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 inline-flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{image ? (isUr ? 'نئی تصویر' : 'Upload Another') : (isUr ? 'تصویر چنیں' : 'Choose Photo')}</span>
            </button>

            <button
              type="button"
              onClick={handleUseSampleNotebook}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {isUr ? 'نمونہ کاپی لوڈ کریں' : 'Try Sample Notebook'}
            </button>
          </div>
        </div>

        {/* How Scanner Works / Preview */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {isUr ? 'اسکینر کیسے کام کرتا ہے' : '6-Step Handwritten Recognition Pipeline'}
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>{isUr ? 'اپ لوڈ کردہ تصویر کو پڑھنا' : 'Reads the uploaded notebook photograph'}</li>
              <li>{isUr ? 'ریاضی کی علامات اور اعداد کی شناخت' : 'Recognizes mathematical symbols, equations, and numbers'}</li>
              <li>{isUr ? 'سوال کا مفہوم سمجھنا' : 'Understands the Class 8 problem statement'}</li>
              <li>{isUr ? 'درست طریقے سے سوال حل کرنا' : 'Computes and verifies the exact solution'}</li>
              <li>{isUr ? 'درست جواب واضح دکھانا' : 'Displays the verified final answer'}</li>
              <li>{isUr ? 'اردو اور انگریزی میں مکمل وضاحت' : 'Explains the solution step-by-step in Urdu and English'}</li>
            </ol>
          </div>

          <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative">
            <img
              src="/src/assets/images/scanner_notebook_sample_1794928070344.jpg"
              alt="Sample Class 8 handwritten notebook"
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 px-3 py-2 bg-gradient-to-t from-slate-950/85 to-transparent text-xs text-white flex items-center justify-between">
              <span>{isUr ? 'نمونہ کاپی صفحہ' : 'Sample Class 8 Notebook Page'}</span>
              <button
                type="button"
                onClick={handleUseSampleNotebook}
                className="underline font-semibold cursor-pointer"
              >
                {isUr ? 'لوڈ کریں' : 'Load Sample'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Scan Output */}
      {scanResult && (
        <section className="space-y-4">
          {scanResult.isUnclear ? (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  {isUr
                    ? 'تصویر واضح طور پر پڑھی نہیں جا سکی — براہ کرم دوسری تصویر اپ لوڈ کریں۔'
                    : 'Handwriting Unclear — Please Upload Another Clearer Image'}
                </span>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">{scanResult.unclearReasonEn}</p>
              {scanResult.unclearReasonUr && (
                <p className="text-sm font-urdu text-right text-amber-800 dark:text-amber-200" dir="rtl">
                  {scanResult.unclearReasonUr}
                </p>
              )}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white text-sm font-semibold cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isUr ? 'دوسری تصویر اپ لوڈ کریں' : 'Upload Another Image'}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isUr ? 'تحریر کامیابی سے پڑھ لی گئی' : 'Handwriting Recognized Successfully'}
                    {scanResult.detectedTopicEn ? ` · ${scanResult.detectedTopicEn}` : ''}
                  </span>
                </div>
                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {scanResult.transcribedText}
                </pre>
              </div>

              {scanResult.problems.map((prob, idx) => (
                <article
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">
                      {isUr ? `سوال ${idx + 1}` : `Recognized Problem ${idx + 1}`}: {prob.questionText}
                    </h3>
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm tabular-nums">
                      {t(language, 'correctAnswer')}: {prob.correctAnswer}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="text-xs font-semibold text-slate-500">English Solution</div>
                      <p className="text-sm text-slate-800 dark:text-slate-200">
                        {mode === 'short' ? prob.shortExplanationEn : prob.detailedExplanationEn}
                      </p>
                      {mode === 'detailed' && prob.stepsEn?.length > 0 && (
                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-1">
                          {prob.stepsEn.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      )}
                    </div>

                    <div
                      className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 font-urdu text-right"
                      dir="rtl"
                    >
                      <div className="text-xs font-semibold text-slate-500">اردو حل</div>
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-loose">
                        {mode === 'short' ? prob.shortExplanationUr : prob.detailedExplanationUr}
                      </p>
                      {mode === 'detailed' && prob.stepsUr?.length > 0 && (
                        <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300 pt-1">
                          {prob.stepsUr.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ol>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-500 mb-1">
                        {t(language, 'formulasUsed')}
                      </div>
                      <ul className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1">
                        {prob.formulas.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="text-xs font-semibold text-slate-500 mb-1">
                        {t(language, 'calculationSteps')}
                      </div>
                      <ul className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 space-y-1 tabular-nums">
                        {prob.calculationSteps.map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </>
          )}
        </section>
      )}
    </div>
  );
}
