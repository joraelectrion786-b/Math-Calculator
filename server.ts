import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function handleApiError(res: Response, err: unknown, fallbackMsg: string) {
  const errorObj = err as { status?: number; message?: string; code?: string };
  const message = errorObj?.message || fallbackMsg;
  const status = typeof errorObj?.status === 'number' && errorObj.status >= 400 ? errorObj.status : 500;

  if (message.includes('API_KEY_INVALID') || status === 403 || status === 401) {
    return res.status(403).json({
      error: 'Gemini API key is missing or invalid. Please check your key in Settings > Secrets.',
      code: 'API_KEY_ERROR',
    });
  }
  if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
    return res.status(429).json({
      error: 'AI service quota limit reached temporarily. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
    });
  }
  return res.status(status).json({
    error: message,
    code: 'AI_ERROR',
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', hasKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  // 1. AI Math Teacher (Multi-turn, Text + Optional Image, Urdu & English, Short & Detailed)
  app.post('/api/ai/teacher', async (req: Request, res: Response) => {
    try {
      const { messages = [], question = '', imageBase64, imageMimeType, language = 'en', mode = 'detailed' } = req.body;

      if (!question && !imageBase64) {
        return res.status(400).json({ error: 'Please type a mathematics question or attach an image.' });
      }

      const ai = getAiClient();

      const historyContext = Array.isArray(messages) && messages.length > 0
        ? messages
            .slice(-6)
            .map((m: { role: string; text: string }) => `${m.role === 'user' ? 'Student' : 'Teacher'}: ${m.text}`)
            .join('\n')
        : '';

      const promptText = [
        historyContext ? `Previous conversation:\n${historyContext}\n` : '',
        `Student's preferred primary language: ${language === 'ur' ? 'Urdu (with English math symbols)' : 'English'}.`,
        `Requested depth mode: ${mode === 'short' ? 'Short & concise explanation' : 'Detailed step-by-step teaching'}.`,
        `Student question: ${question || 'Please examine the attached mathematics image and teach me how to solve it.'}`,
      ]
        .filter(Boolean)
        .join('\n\n');

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (imageBase64 && imageMimeType) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
          systemInstruction:
            'You are Ustad Maths, a warm, patient, and mathematically rigorous Class 8 Mathematics Teacher. ' +
            'Always verify all arithmetic and algebraic steps before responding. ' +
            'Provide clear answers in BOTH English and natural Urdu script (using standard mathematical notation like x, y, =, +, −, ×, ÷, cm², √). ' +
            'If an uploaded image is blurry, cropped, or unreadable, set isUnclear=true and politely ask the student to upload a clearer photo or type the question. ' +
            'Match the requested mode (short vs detailed) while ensuring the student truly understands the concept.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isUnclear: { type: Type.BOOLEAN },
              answerEn: { type: Type.STRING, description: 'Friendly teacher response in English.' },
              answerUr: { type: Type.STRING, description: 'Friendly teacher response in Urdu script.' },
              formulas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Relevant mathematical formulas used.',
              },
              stepsEn: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Step-by-step explanation in English.',
              },
              stepsUr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Step-by-step explanation in Urdu.',
              },
              encouragementTipEn: { type: Type.STRING },
              encouragementTipUr: { type: Type.STRING },
            },
            required: ['isUnclear', 'answerEn', 'answerUr', 'formulas', 'stepsEn', 'stepsUr'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err) {
      return handleApiError(res, err, 'Failed to get response from AI Math Teacher.');
    }
  });

  // 2. AI Math Solver & Student Answer Checker
  app.post('/api/ai/solver', async (req: Request, res: Response) => {
    try {
      const { question = '', studentAnswer = '', imageBase64, imageMimeType, mode = 'detailed' } = req.body;

      if (!question && !imageBase64) {
        return res.status(400).json({ error: 'Please enter a math question or upload an image.' });
      }

      const ai = getAiClient();
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];
      if (imageBase64 && imageMimeType) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        });
      }

      const promptText = [
        question ? `Question text: ${question}` : 'Read the mathematical question from the attached image.',
        studentAnswer.trim()
          ? `Student's submitted answer/solution: ${studentAnswer.trim()}`
          : 'No student answer was provided; solve the question completely.',
        `Explanation mode requested: ${mode === 'short' ? 'Short' : 'Detailed'}.`,
      ].join('\n\n');

      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            'You are a precise Class 8 Mathematics Solver and Grader. ' +
            'Double-check every calculation before finalizing the output. ' +
            'If the student provided an answer, evaluate whether it is mathematically equivalent to the true answer (accounting for units, simplified fractions, or x = value forms). ' +
            'If incorrect, pinpoint the exact mistake, explain why it is incorrect in both English and Urdu, and present the complete correct solution with formulas and calculation steps. ' +
            'If the uploaded image or question is unclear/unreadable, set isUnclear=true and explain what is needed.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isUnclear: { type: Type.BOOLEAN },
              unclearReasonEn: { type: Type.STRING },
              unclearReasonUr: { type: Type.STRING },
              recognizedQuestion: { type: Type.STRING },
              hasStudentAnswer: { type: Type.BOOLEAN },
              isStudentCorrect: { type: Type.BOOLEAN },
              mistakeEn: { type: Type.STRING },
              mistakeUr: { type: Type.STRING },
              whyIncorrectEn: { type: Type.STRING },
              whyIncorrectUr: { type: Type.STRING },
              correctAnswer: { type: Type.STRING },
              shortExplanationEn: { type: Type.STRING },
              shortExplanationUr: { type: Type.STRING },
              detailedExplanationEn: { type: Type.STRING },
              detailedExplanationUr: { type: Type.STRING },
              formulas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              stepsEn: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              stepsUr: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              calculationSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: [
              'isUnclear',
              'recognizedQuestion',
              'hasStudentAnswer',
              'isStudentCorrect',
              'correctAnswer',
              'shortExplanationEn',
              'shortExplanationUr',
              'detailedExplanationEn',
              'detailedExplanationUr',
              'formulas',
              'stepsEn',
              'stepsUr',
              'calculationSteps',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err) {
      return handleApiError(res, err, 'Failed to solve the mathematical question.');
    }
  });

  // 3. Notebook Handwritten Image Scanner
  app.post('/api/ai/scanner', async (req: Request, res: Response) => {
    try {
      const { imageBase64, imageMimeType, mode = 'detailed' } = req.body;

      if (!imageBase64 || !imageMimeType) {
        return res.status(400).json({ error: 'Please upload a notebook photograph to scan.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageBase64,
              },
            },
            {
              text:
                `Carefully inspect this student notebook photograph. ` +
                `1) Recognize all handwritten mathematical symbols, numbers, diagrams, and question statements. ` +
                `2) Identify each question clearly. ` +
                `3) Solve each question accurately for a Class 8 student and provide ${mode} explanations in BOTH English and Urdu. ` +
                `If the handwriting or photo is too blurry/incomplete to read reliably, set isUnclear=true and ask the student to upload a clearer photo or type the question.`,
            },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            'You are an expert OCR and Class 8 Mathematics Tutor specializing in reading handwritten math notebooks. ' +
            'Never guess unreadable digits; if unsure, set isUnclear=true. Verify every mathematical calculation.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isUnclear: { type: Type.BOOLEAN },
              unclearReasonEn: { type: Type.STRING },
              unclearReasonUr: { type: Type.STRING },
              transcribedText: { type: Type.STRING },
              detectedTopicEn: { type: Type.STRING },
              detectedTopicUr: { type: Type.STRING },
              problems: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    shortExplanationEn: { type: Type.STRING },
                    shortExplanationUr: { type: Type.STRING },
                    detailedExplanationEn: { type: Type.STRING },
                    detailedExplanationUr: { type: Type.STRING },
                    formulas: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    stepsEn: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    stepsUr: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    calculationSteps: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'questionText',
                    'correctAnswer',
                    'shortExplanationEn',
                    'shortExplanationUr',
                    'detailedExplanationEn',
                    'detailedExplanationUr',
                    'formulas',
                    'stepsEn',
                    'stepsUr',
                    'calculationSteps',
                  ],
                },
              },
            },
            required: ['isUnclear', 'transcribedText', 'problems'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json(parsed);
    } catch (err) {
      return handleApiError(res, err, 'Failed to scan and solve the notebook image.');
    }
  });

  // 4. Text-to-Speech Voice Assistant (Gemini 3.8 Flash Lite TTS)
  app.post('/api/ai/tts', async (req: Request, res: Response) => {
    try {
      const { text = '', language = 'en' } = req.body;
      if (!text.trim()) {
        return res.status(400).json({ error: 'No text provided for speech synthesis.' });
      }

      const ai = getAiClient();
      const clipped = text.trim().slice(0, 1200);
      const stylePrompt =
        language === 'ur'
          ? 'Warm, clear, encouraging Urdu Class 8 mathematics teacher reading clearly'
          : 'Warm, clear, encouraging Class 8 mathematics teacher speaking at a steady pace';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: clipped,
                speechMetadata: {
                  style: stylePrompt,
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        return res.status(502).json({ error: 'Audio could not be generated right now.' });
      }

      return res.json({
        audioBase64: base64Audio,
        mimeType: 'audio/wav',
      });
    } catch (err) {
      return handleApiError(res, err, 'Failed to generate teacher voice audio.');
    }
  });

  // 5. Voice-to-Text Audio Transcription (Gemini 3.5 Transcribe)
  app.post('/api/ai/transcribe', async (req: Request, res: Response) => {
    try {
      const { audioBase64, mimeType = 'audio/webm', language = 'en' } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'No audio recording was provided.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text:
                language === 'ur'
                  ? 'Transcribe this student mathematics question accurately in Urdu or English, preserving math expressions and numbers.'
                  : 'Transcribe this student mathematics question accurately, preserving math expressions and numbers.',
            },
          ],
        },
      });

      return res.json({ text: (response.text ?? '').trim() });
    } catch (err) {
      return handleApiError(res, err, 'Failed to transcribe voice recording.');
    }
  });

  // Vite middleware for dev or static dist serving for prod
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Mathematics Part 2 server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
