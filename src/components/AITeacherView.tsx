import { useEffect, useRef, useState } from 'react';
import {
  ImagePlus,
  Loader2,
  Mic,
  MicOff,
  Send,
  Square,
  Trash2,
  Volume2,
  X,
} from 'lucide-react';
import type { ExplanationMode, Language, TeacherMessage } from '../types';
import { fileToEncodedImage, type EncodedImage } from '../utils/imageHelper';
import { t } from '../data/i18n';

interface AITeacherViewProps {
  language: Language;
  defaultExplanationMode: ExplanationMode;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
}

export function AITeacherView({
  language,
  defaultExplanationMode,
  initialPrompt,
  onClearInitialPrompt,
}: AITeacherViewProps) {
  const isUr = language === 'ur';
  const [messages, setMessages] = useState<TeacherMessage[]>([
    {
      id: 'welcome',
      role: 'teacher',
      text: '',
      timestamp: new Date().toISOString(),
      structured: {
        answerEn:
          'Assalam-o-Alaikum! I am Ustad Maths, your Class 8 Mathematics Teacher. Ask me any question from Numbers, Algebra, Measurement, Geometry, or Statistics — by typing, speaking, or uploading a photo!',
        answerUr:
          'السلام علیکم! میں استاد میتھس ہوں، آپ کا جماعت ہشتم کا ریاضی کا استاد۔ آپ اعداد، الجبرا، پیمائش، جیومیٹری یا شماریات کا کوئی بھی سوال لکھ کر، بول کر یا تصویر اپ لوڈ کر کے پوچھ سکتے ہیں!',
        formulas: ['(a + b)² = a² + 2ab + b²', 'c² = a² + b²', 'Mean = ∑x / n'],
        stepsEn: [
          'Type a math problem or click the microphone to speak in English or Urdu.',
          'Attach a notebook photo if you want help with a written question.',
          'Choose Short or Detailed mode depending on how deeply you want to learn.',
        ],
        stepsUr: [
          'سوال ٹائپ کریں یا مائیکروفون بٹن دبا کر اردو یا انگریزی میں بولیں۔',
          'تحریری سوال سمجھنے کے لیے کاپی کی تصویر بھی منسلک کر سکتے ہیں۔',
          'اپنی مرضی کے مطابق مختصر یا تفصیلی وضاحت کا انتخاب کریں۔',
        ],
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ExplanationMode>(defaultExplanationMode);
  const [attachedImage, setAttachedImage] = useState<EncodedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Voice-to-Text state
  const [listening, setListening] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  // Voice playback state
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [audioLoadingId, setAudioLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      setInput(initialPrompt);
      onClearInitialPrompt?.();
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const encoded = await fileToEncodedImage(file);
      setAttachedImage(encoded);
      setErrorMsg(null);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to attach image.');
    }
  };

  const handleSend = async (customText?: string) => {
    const query = (customText ?? input).trim();
    if (!query && !attachedImage) return;
    if (loading) return;

    const userMsg: TeacherMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: query || (isUr ? 'براہ کرم اس تصویر میں موجود سوال سمجھائیں۔' : 'Please teach me the math question in this image.'),
      imagePreview: attachedImage?.previewUrl,
      timestamp: new Date().toISOString(),
    };

    const currentImg = attachedImage;
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        text: m.role === 'user' ? m.text : m.structured?.answerEn || m.text,
      }));

      const res = await fetch('/api/ai/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyPayload,
          question: query,
          imageBase64: currentImg?.base64,
          imageMimeType: currentImg?.mimeType,
          language,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reach AI Math Teacher.');
      }

      const teacherMsg: TeacherMessage = {
        id: `t-${Date.now()}`,
        role: 'teacher',
        text: data.answerEn || '',
        structured: data,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, teacherMsg]);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error calling AI Teacher.');
    } finally {
      setLoading(false);
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingId(null);
  };

  const handlePlayVoice = async (msg: TeacherMessage) => {
    if (speakingId === msg.id) {
      stopPlayback();
      return;
    }
    stopPlayback();

    const s = msg.structured;
    const textToSpeak = s
      ? isUr
        ? `${s.answerUr} ${s.stepsUr.join(' ')}`
        : `${s.answerEn} ${s.stepsEn.join(' ')}`
      : msg.text;

    if (!textToSpeak.trim()) return;

    setAudioLoadingId(msg.id);
    try {
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak, language }),
      });
      const data = await res.json();
      if (res.ok && data.audioBase64) {
        const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
        audioRef.current = audio;
        setSpeakingId(msg.id);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => setSpeakingId(null);
        await audio.play();
        return;
      }
      throw new Error(data.error || 'TTS unavailable');
    } catch {
      // Browser Web Speech Synthesis fallback
      if ('speechSynthesis' in window) {
        const utter = new SpeechSynthesisUtterance(textToSpeak);
        utter.lang = isUr ? 'ur-PK' : 'en-US';
        utter.onend = () => setSpeakingId(null);
        utter.onerror = () => setSpeakingId(null);
        setSpeakingId(msg.id);
        window.speechSynthesis.speak(utter);
      } else {
        setErrorMsg(
          isUr
            ? 'آواز سنانے کی سہولت اس براؤزر میں دستیاب نہیں۔'
            : 'Voice playback is not supported in this browser.'
        );
      }
    } finally {
      setAudioLoadingId(null);
    }
  };

  const toggleVoiceInput = async () => {
    if (listening) {
      recognitionRef.current?.stop();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setListening(false);
      return;
    }

    setErrorMsg(null);
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => unknown }).webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rec = new (SpeechRec as any)();
        rec.lang = isUr ? 'ur-PK' : 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => {
          const transcript = event.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
        rec.start();
        setListening(true);
        return;
      } catch {
        // Fall through to MediaRecorder + Gemini transcription
      }
    }

    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((tTrack) => tTrack.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
          setTranscribing(true);
          try {
            const reader = new FileReader();
            const base64: string = await new Promise((resolve, reject) => {
              reader.onload = () => {
                const resStr = String(reader.result || '');
                resolve(resStr.split(',')[1] || '');
              };
              reader.onerror = () => reject(new Error('Failed to read audio.'));
              reader.readAsDataURL(blob);
            });
            const res = await fetch('/api/ai/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64,
                mimeType: blob.type || 'audio/webm',
                language,
              }),
            });
            const data = await res.json();
            if (res.ok && data.text) {
              setInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
            } else if (!res.ok) {
              setErrorMsg(data.error || 'Voice transcription failed.');
            }
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'Voice transcription error.');
          } finally {
            setTranscribing(false);
          }
        };
        mediaRecorderRef.current = recorder;
        recorder.start();
        setListening(true);
      } catch {
        setErrorMsg(
          isUr
            ? 'مائیکروفون تک رسائی کی اجازت نہیں ملی۔'
            : 'Microphone permission denied or unavailable on this device.'
        );
      }
    } else {
      setErrorMsg(
        isUr
          ? 'آواز سے ٹائپنگ اس براؤزر میں دستیاب نہیں۔'
          : 'Voice input is not supported in this browser.'
      );
    }
  };

  const quickPrompts = isUr
    ? [
        'مسئلہ فیثاغورث مثال کے ساتھ سمجھائیں',
        '(a + b)² کا کلیہ کیسے ثابت ہوتا ہے؟',
        'سلنڈر اور مخروط کے حجم میں کیا فرق ہے؟',
      ]
    : [
        'Explain Pythagoras theorem with a Class 8 example',
        'How do we factorize x² + 7x + 12?',
        'Difference between Direct and Inverse Proportion',
      ];

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {isUr ? 'اے آئی ریاضی استاد (Ustad Maths)' : 'AI Math Teacher'}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            {isUr
              ? 'اردو اور انگریزی میں مرحلہ وار رہنمائی، آواز کی سہولت اور تصویر کے ساتھ'
              : 'Step-by-step Class 8 teaching in English & Urdu with Voice Assistant and image upload'}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <button
            type="button"
            onClick={() => setMessages((prev) => prev.slice(0, 1))}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            title="Clear chat"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isUr ? 'صاف کریں' : 'Clear'}</span>
          </button>
        </div>
      </div>

      {/* Quick Topic Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(qp)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Conversation Canvas */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 min-h-[380px] max-h-[58vh] overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {m.role === 'user' ? (
              <div className="max-w-xl bg-blue-600 text-white rounded-2xl px-4 py-3 space-y-2">
                {m.imagePreview && (
                  <img
                    src={m.imagePreview}
                    alt="Uploaded math question"
                    referrerPolicy="no-referrer"
                    className="max-h-48 rounded-xl object-contain bg-white/10"
                  />
                )}
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            ) : (
              <div className="w-full max-w-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                    {isUr ? 'استاد میتھس' : 'Ustad Maths · AI Teacher'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePlayVoice(m)}
                    disabled={audioLoadingId === m.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    {audioLoadingId === m.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : speakingId === m.id ? (
                      <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {speakingId === m.id
                        ? isUr
                          ? 'آواز بند کریں'
                          : 'Stop Voice'
                        : isUr
                        ? 'آواز میں سنیں'
                        : 'Listen'}
                    </span>
                  </button>
                </div>

                {m.structured ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          English
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {m.structured.answerEn}
                        </p>
                      </div>
                      <div
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 font-urdu text-right"
                        dir="rtl"
                      >
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          اردو
                        </div>
                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-loose whitespace-pre-line">
                          {m.structured.answerUr}
                        </p>
                      </div>
                    </div>

                    {m.structured.formulas?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                          {t(language, 'formulasUsed')}
                        </div>
                        <div className="flex flex-wrap gap-3 font-mono text-xs sm:text-sm text-indigo-700 dark:text-indigo-300">
                          {m.structured.formulas.map((f, idx) => (
                            <span key={idx}>{f}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {(m.structured.stepsEn?.length > 0 || m.structured.stepsUr?.length > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {m.structured.stepsEn?.length > 0 && (
                          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                              Step-by-Step
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                              {m.structured.stepsEn.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                        {m.structured.stepsUr?.length > 0 && (
                          <div
                            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-urdu text-right"
                            dir="rtl"
                          >
                            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                              مرحلہ وار وضاحت
                            </div>
                            <ol className="list-decimal list-inside space-y-1 text-sm text-slate-700 dark:text-slate-300">
                              {m.structured.stepsUr.map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-800 dark:text-slate-200">{m.text}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 px-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>
              {isUr
                ? 'استاد میتھس آپ کا سوال حل کر رہے ہیں...'
                : 'Ustad Maths is preparing your step-by-step explanation...'}
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-sm text-rose-700 dark:text-rose-200">
          {errorMsg}
        </div>
      )}

      {/* Composer Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3">
        {attachedImage && (
          <div className="relative inline-block">
            <img
              src={attachedImage.previewUrl}
              alt="Preview"
              referrerPolicy="no-referrer"
              className="h-24 rounded-xl border border-slate-200 dark:border-slate-700 object-contain"
            />
            <button
              type="button"
              onClick={() => setAttachedImage(null)}
              aria-label="Remove image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImagePick}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload math image"
            className="min-w-[44px] min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer shrink-0"
          >
            <ImagePlus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={transcribing}
            aria-label="Voice input"
            className={`min-w-[44px] min-h-[44px] rounded-xl border flex items-center justify-center cursor-pointer shrink-0 transition-colors ${
              listening
                ? 'bg-rose-600 border-rose-600 text-white'
                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {transcribing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : listening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              listening
                ? isUr
                  ? 'سن رہے ہیں... بولیں'
                  : 'Listening... speak your math question'
                : isUr
                ? 'ریاضی کا کوئی بھی سوال یہاں لکھیں...'
                : 'Ask any Class 8 math question...'
            }
            className="flex-1 min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !attachedImage)}
            className="min-h-[44px] px-5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-45 text-white text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">{isUr ? 'بھیجیں' : 'Ask'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
