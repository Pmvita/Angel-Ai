"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivityEventSchema = exports.TeamSessionShareSchema = exports.TeamMemberSchema = exports.TranslationSegmentSchema = exports.AppSettingsSchema = exports.ProviderSchema = exports.ExportJobSchema = exports.ExportFormatSchema = exports.NoteSchema = exports.QuestionSchema = exports.VisionAnalysisSchema = exports.TranscriptSegmentSchema = exports.SpeakerSchema = exports.SessionSchema = exports.SessionStatusSchema = void 0;
const zod_1 = require("zod");
// ============================================================
// Session & Meeting
// ============================================================
exports.SessionStatusSchema = zod_1.z.enum(["idle", "listening", "analyzing", "paused", "stopped"]);
exports.SessionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1).max(200),
    status: exports.SessionStatusSchema,
    startedAt: zod_1.z.string().datetime(),
    endedAt: zod_1.z.string().datetime().optional(),
    app: zod_1.z.string().default("unknown"),
    windowTitle: zod_1.z.string().default(""),
    settings: zod_1.z.record(zod_1.z.any()).optional(),
});
// ============================================================
// Transcript Segment (Listen)
// ============================================================
exports.SpeakerSchema = zod_1.z.enum(["system", "user", "other", "unknown"]);
exports.TranscriptSegmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    speaker: exports.SpeakerSchema,
    text: zod_1.z.string().min(1),
    startTime: zod_1.z.number(), // ms from session start
    endTime: zod_1.z.number(),
    confidence: zod_1.z.number().min(0).max(1).optional(),
    isHighlighted: zod_1.z.boolean().default(false),
    timestamp: zod_1.z.string().datetime(),
});
// ============================================================
// Vision Analysis
// ============================================================
exports.VisionAnalysisSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    screenshotId: zod_1.z.string().uuid(),
    provider: zod_1.z.string().default("openai"),
    model: zod_1.z.string().default("gpt-4o-mini"),
    summary: zod_1.z.string(),
    keyPoints: zod_1.z.array(zod_1.z.string()),
    actionItems: zod_1.z.array(zod_1.z.string()),
    detectedText: zod_1.z.string().optional(),
    timestamp: zod_1.z.string().datetime(),
});
// ============================================================
// Ask / Q&A
// ============================================================
exports.QuestionSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    text: zod_1.z.string().min(1),
    answer: zod_1.z.string().optional(),
    provider: zod_1.z.string().default("openai"),
    model: zod_1.z.string().default("gpt-4o-mini"),
    status: zod_1.z.enum(["pending", "answered", "error"]).default("pending"),
    timestamp: zod_1.z.string().datetime(),
});
// ============================================================
// Notes
// ============================================================
exports.NoteSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    content: zod_1.z.string(),
    type: zod_1.z.enum(["auto", "manual"]),
    pinned: zod_1.z.boolean().default(false),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
    createdAt: zod_1.z.string().datetime(),
    updatedAt: zod_1.z.string().datetime(),
});
// ============================================================
// Export
// ============================================================
exports.ExportFormatSchema = zod_1.z.enum(["pdf", "markdown", "txt", "json", "email"]);
exports.ExportJobSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    format: exports.ExportFormatSchema,
    status: zod_1.z.enum(["queued", "processing", "completed", "failed"]).default("queued"),
    url: zod_1.z.string().optional(),
    error: zod_1.z.string().optional(),
    createdAt: zod_1.z.string().datetime(),
});
// ============================================================
// Settings & Providers
// ============================================================
exports.ProviderSchema = zod_1.z.enum(["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"]);
exports.AppSettingsSchema = zod_1.z.object({
    provider: exports.ProviderSchema.default("openai"),
    apiKey: zod_1.z.string().optional(),
    baseUrl: zod_1.z.string().optional(),
    model: zod_1.z.string().default("gpt-4o-mini"),
    temperature: zod_1.z.number().min(0).max(2).default(0.7),
    maxTokens: zod_1.z.number().min(1).max(128000).default(4096),
    systemPrompt: zod_1.z.string().default(""),
    language: zod_1.z.string().default("en"),
    realtimeTranslation: zod_1.z.boolean().default(false),
    autoHighlight: zod_1.z.boolean().default(true),
    killSwitchEnabled: zod_1.z.boolean().default(false),
    hideFromTaskbar: zod_1.z.boolean().default(false),
    globalShortcut: zod_1.z.string().default("CmdOrCtrl+Shift+S"),
    captureIntervalMs: zod_1.z.number().min(1000).max(60000).default(5000),
    localStorageEnabled: zod_1.z.boolean().default(true),
    exportDefaultFormat: exports.ExportFormatSchema.default("markdown"),
});
// ============================================================
// Translation
// ============================================================
exports.TranslationSegmentSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    sourceSegmentId: zod_1.z.string().uuid(),
    sourceText: zod_1.z.string(),
    translatedText: zod_1.z.string(),
    sourceLanguage: zod_1.z.string().default("en"),
    targetLanguage: zod_1.z.string().default("es"),
    timestamp: zod_1.z.string().datetime(),
});
// ============================================================
// Team Sync
// ============================================================
exports.TeamMemberSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
    role: zod_1.z.enum(["owner", "admin", "member", "viewer"]).default("member"),
    joinedAt: zod_1.z.string().datetime(),
});
exports.TeamSessionShareSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid(),
    sharedBy: zod_1.z.string().uuid(),
    sharedWith: zod_1.z.string().uuid(),
    permission: zod_1.z.enum(["read", "write", "admin"]).default("read"),
    sharedAt: zod_1.z.string().datetime(),
});
// ============================================================
// Activity Log
// ============================================================
exports.ActivityEventSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    sessionId: zod_1.z.string().uuid().optional(),
    type: zod_1.z.string(),
    message: zod_1.z.string(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
    timestamp: zod_1.z.string().datetime(),
});
