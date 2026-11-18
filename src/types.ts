export type Language = 'en' | 'ur';
export type ThemeMode = 'light' | 'dark';
export type ExplanationMode = 'short' | 'detailed';
export type QuestionType = 'objective' | 'long';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type ChapterId =
  | 'numbers'
  | 'algebra'
  | 'measurement'
  | 'geometry'
  | 'statistics';

export type SectionId =
  | 'home'
  | 'chapters'
  | 'objective'
  | 'long'
  | 'teacher'
  | 'solver'
  | 'scanner'
  | 'tests'
  | 'results'
  | 'progress'
  | 'calculator'
  | 'formulas'
  | 'geometry-tools'
  | 'bookmarks'
  | 'settings';

export interface ChapterMeta {
  id: ChapterId;
  number: number;
  titleEn: string;
  titleUr: string;
  subtitleEn: string;
  subtitleUr: string;
  topicsEn: string[];
  topicsUr: string[];
  accentColor: string;
  badgeClass: string;
}

export interface MathQuestion {
  id: string;
  chapterId: ChapterId;
  type: QuestionType;
  difficulty: Difficulty;
  topicEn: string;
  topicUr: string;
  questionEn: string;
  questionUr: string;
  correctAnswer: string;
  acceptedAnswers: string[];
  shortExplanationEn: string;
  shortExplanationUr: string;
  detailedExplanationEn: string;
  detailedExplanationUr: string;
  stepsEn: string[];
  stepsUr: string[];
  formulas: string[];
  calculationSteps: string[];
  marks: number;
}

export interface FormulaItem {
  id: string;
  chapterId: ChapterId;
  nameEn: string;
  nameUr: string;
  formula: string;
  explanationEn: string;
  explanationUr: string;
  exampleEn: string;
  exampleUr: string;
}

export interface SolvedRecord {
  questionId: string;
  chapterId: ChapterId;
  type: QuestionType;
  userAnswer: string;
  isCorrect: boolean;
  solvedAt: string;
}

export interface TestAnswerRecord {
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  marksEarned: number;
  maxMarks: number;
}

export interface TestAttempt {
  id: string;
  titleEn: string;
  titleUr: string;
  mode: 'chapter' | 'combined';
  chapterId: ChapterId | 'all';
  questionType: QuestionType;
  difficulty: Difficulty | 'all';
  questionIds: string[];
  answers: Record<string, string>;
  results: TestAnswerRecord[];
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
  submittedAt: string;
}

export interface TeacherMessage {
  id: string;
  role: 'user' | 'teacher';
  text: string;
  imagePreview?: string;
  structured?: {
    isUnclear?: boolean;
    answerEn: string;
    answerUr: string;
    formulas: string[];
    stepsEn: string[];
    stepsUr: string[];
    encouragementTipEn?: string;
    encouragementTipUr?: string;
  };
  timestamp: string;
}

export interface SolverResponse {
  isUnclear: boolean;
  unclearReasonEn?: string;
  unclearReasonUr?: string;
  recognizedQuestion: string;
  hasStudentAnswer: boolean;
  isStudentCorrect: boolean;
  mistakeEn?: string;
  mistakeUr?: string;
  whyIncorrectEn?: string;
  whyIncorrectUr?: string;
  correctAnswer: string;
  shortExplanationEn: string;
  shortExplanationUr: string;
  detailedExplanationEn: string;
  detailedExplanationUr: string;
  formulas: string[];
  stepsEn: string[];
  stepsUr: string[];
  calculationSteps: string[];
}

export interface ScannerResponse {
  isUnclear: boolean;
  unclearReasonEn?: string;
  unclearReasonUr?: string;
  transcribedText: string;
  detectedTopicEn?: string;
  detectedTopicUr?: string;
  problems: Array<{
    questionText: string;
    correctAnswer: string;
    shortExplanationEn: string;
    shortExplanationUr: string;
    detailedExplanationEn: string;
    detailedExplanationUr: string;
    formulas: string[];
    stepsEn: string[];
    stepsUr: string[];
    calculationSteps: string[];
  }>;
}
