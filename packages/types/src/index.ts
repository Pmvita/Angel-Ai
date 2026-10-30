import { z } from "zod";

// ============================================================
// Session & Meeting
// ============================================================
export const SessionStatusSchema = z.enum(["idle", "listening", "analyzing", "paused", "stopped"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  status: SessionStatusSchema,
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime().optional(),
  app: z.string().default("unknown"),
  windowTitle: z.string().default(""),
  settings: z.record(z.any()).optional(),
});
export type Session = z.infer<typeof SessionSchema>;

// ============================================================
// Transcript Segment (Listen)
// ============================================================
export const SpeakerSchema = z.enum(["system", "user", "other", "unknown"]);
export type Speaker = z.infer<typeof SpeakerSchema>;

export const TranscriptSegmentSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  speaker: SpeakerSchema,
  text: z.string().min(1),
  startTime: z.number(), // ms from session start
  endTime: z.number(),
  confidence: z.number().min(0).max(1).optional(),
  isHighlighted: z.boolean().default(false),
  timestamp: z.string().datetime(),
});
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

// ============================================================
// Vision Analysis
// ============================================================
export const VisionAnalysisSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  screenshotId: z.string().uuid(),
  provider: z.string().default("openai"),
  model: z.string().default("gpt-4o-mini"),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionItems: z.array(z.string()),
  detectedText: z.string().optional(),
  timestamp: z.string().datetime(),
});
export type VisionAnalysis = z.infer<typeof VisionAnalysisSchema>;

// ============================================================
// Ask / Q&A
// ============================================================
export const QuestionSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  text: z.string().min(1),
  answer: z.string().optional(),
  provider: z.string().default("openai"),
  model: z.string().default("gpt-4o-mini"),
  status: z.enum(["pending", "answered", "error"]).default("pending"),
  timestamp: z.string().datetime(),
});
export type Question = z.infer<typeof QuestionSchema>;

// ============================================================
// Notes
// ============================================================
export const NoteSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  content: z.string(),
  type: z.enum(["auto", "manual"]),
  pinned: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type Note = z.infer<typeof NoteSchema>;

// ============================================================
// Export
// ============================================================
export const ExportFormatSchema = z.enum(["pdf", "markdown", "txt", "json", "email"]);
export type ExportFormat = z.infer<typeof ExportFormatSchema>;

export const ExportJobSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  format: ExportFormatSchema,
  status: z.enum(["queued", "processing", "completed", "failed"]).default("queued"),
  url: z.string().optional(),
  error: z.string().optional(),
  createdAt: z.string().datetime(),
});
export type ExportJob = z.infer<typeof ExportJobSchema>;

// ============================================================
// Settings & Providers
// ============================================================
export const ProviderSchema = z.enum(["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"]);
export type Provider = z.infer<typeof ProviderSchema>;

export const AppSettingsSchema = z.object({
  provider: ProviderSchema.default("openai"),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  model: z.string().default("gpt-4o-mini"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(1).max(128000).default(4096),
  systemPrompt: z.string().default(""),
  language: z.string().default("en"),
  realtimeTranslation: z.boolean().default(false),
  autoHighlight: z.boolean().default(true),
  killSwitchEnabled: z.boolean().default(false),
  hideFromTaskbar: z.boolean().default(false),
  globalShortcut: z.string().default("CmdOrCtrl+Shift+S"),
  captureIntervalMs: z.number().min(1000).max(60000).default(5000),
  localStorageEnabled: z.boolean().default(true),
  exportDefaultFormat: ExportFormatSchema.default("markdown"),
});
export type AppSettings = z.infer<typeof AppSettingsSchema>;

// ============================================================
// Translation
// ============================================================

export const TranslationSegmentSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sourceSegmentId: z.string().uuid(),
  sourceText: z.string(),
  translatedText: z.string(),
  sourceLanguage: z.string().default("en"),
  targetLanguage: z.string().default("es"),
  timestamp: z.string().datetime(),
});
export type TranslationSegment = z.infer<typeof TranslationSegmentSchema>;

// ============================================================
// Team Sync
// ============================================================

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member", "viewer"]).default("member"),
  joinedAt: z.string().datetime(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const TeamSessionShareSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  sharedBy: z.string().uuid(),
  sharedWith: z.string().uuid(),
  permission: z.enum(["read", "write", "admin"]).default("read"),
  sharedAt: z.string().datetime(),
});
export type TeamSessionShare = z.infer<typeof TeamSessionShareSchema>;

// ============================================================
// Activity Log
// ============================================================
export const ActivityEventSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
  type: z.string(),
  message: z.string(),
  metadata: z.record(z.any()).optional(),
  timestamp: z.string().datetime(),
});
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;

