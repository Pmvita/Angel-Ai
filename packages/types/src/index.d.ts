import { z } from "zod";
export declare const SessionStatusSchema: z.ZodEnum<["idle", "listening", "analyzing", "paused", "stopped"]>;
export type SessionStatus = z.infer<typeof SessionStatusSchema>;
export declare const SessionSchema: z.ZodObject<{
    id: z.ZodString;
    title: z.ZodString;
    status: z.ZodEnum<["idle", "listening", "analyzing", "paused", "stopped"]>;
    startedAt: z.ZodString;
    endedAt: z.ZodOptional<z.ZodString>;
    app: z.ZodDefault<z.ZodString>;
    windowTitle: z.ZodDefault<z.ZodString>;
    settings: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    status: "idle" | "listening" | "analyzing" | "paused" | "stopped";
    id: string;
    title: string;
    startedAt: string;
    app: string;
    windowTitle: string;
    endedAt?: string | undefined;
    settings?: Record<string, any> | undefined;
}, {
    status: "idle" | "listening" | "analyzing" | "paused" | "stopped";
    id: string;
    title: string;
    startedAt: string;
    endedAt?: string | undefined;
    app?: string | undefined;
    windowTitle?: string | undefined;
    settings?: Record<string, any> | undefined;
}>;
export type Session = z.infer<typeof SessionSchema>;
export declare const SpeakerSchema: z.ZodEnum<["system", "user", "other", "unknown"]>;
export type Speaker = z.infer<typeof SpeakerSchema>;
export declare const TranscriptSegmentSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    speaker: z.ZodEnum<["system", "user", "other", "unknown"]>;
    text: z.ZodString;
    startTime: z.ZodNumber;
    endTime: z.ZodNumber;
    confidence: z.ZodOptional<z.ZodNumber>;
    isHighlighted: z.ZodDefault<z.ZodBoolean>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sessionId: string;
    speaker: "unknown" | "system" | "user" | "other";
    text: string;
    startTime: number;
    endTime: number;
    isHighlighted: boolean;
    timestamp: string;
    confidence?: number | undefined;
}, {
    id: string;
    sessionId: string;
    speaker: "unknown" | "system" | "user" | "other";
    text: string;
    startTime: number;
    endTime: number;
    timestamp: string;
    confidence?: number | undefined;
    isHighlighted?: boolean | undefined;
}>;
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;
export declare const VisionAnalysisSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    screenshotId: z.ZodString;
    provider: z.ZodDefault<z.ZodString>;
    model: z.ZodDefault<z.ZodString>;
    summary: z.ZodString;
    keyPoints: z.ZodArray<z.ZodString, "many">;
    actionItems: z.ZodArray<z.ZodString, "many">;
    detectedText: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sessionId: string;
    timestamp: string;
    screenshotId: string;
    provider: string;
    model: string;
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    detectedText?: string | undefined;
}, {
    id: string;
    sessionId: string;
    timestamp: string;
    screenshotId: string;
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    provider?: string | undefined;
    model?: string | undefined;
    detectedText?: string | undefined;
}>;
export type VisionAnalysis = z.infer<typeof VisionAnalysisSchema>;
export declare const QuestionSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    text: z.ZodString;
    answer: z.ZodOptional<z.ZodString>;
    provider: z.ZodDefault<z.ZodString>;
    model: z.ZodDefault<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "answered", "error"]>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "pending" | "answered" | "error";
    id: string;
    sessionId: string;
    text: string;
    timestamp: string;
    provider: string;
    model: string;
    answer?: string | undefined;
}, {
    id: string;
    sessionId: string;
    text: string;
    timestamp: string;
    status?: "pending" | "answered" | "error" | undefined;
    provider?: string | undefined;
    model?: string | undefined;
    answer?: string | undefined;
}>;
export type Question = z.infer<typeof QuestionSchema>;
export declare const NoteSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    content: z.ZodString;
    type: z.ZodEnum<["auto", "manual"]>;
    pinned: z.ZodDefault<z.ZodBoolean>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "auto" | "manual";
    id: string;
    sessionId: string;
    content: string;
    pinned: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}, {
    type: "auto" | "manual";
    id: string;
    sessionId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    pinned?: boolean | undefined;
    tags?: string[] | undefined;
}>;
export type Note = z.infer<typeof NoteSchema>;
export declare const ExportFormatSchema: z.ZodEnum<["pdf", "markdown", "txt", "json", "email"]>;
export type ExportFormat = z.infer<typeof ExportFormatSchema>;
export declare const ExportJobSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    format: z.ZodEnum<["pdf", "markdown", "txt", "json", "email"]>;
    status: z.ZodDefault<z.ZodEnum<["queued", "processing", "completed", "failed"]>>;
    url: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "queued" | "processing" | "completed" | "failed";
    id: string;
    sessionId: string;
    createdAt: string;
    format: "pdf" | "markdown" | "txt" | "json" | "email";
    error?: string | undefined;
    url?: string | undefined;
}, {
    id: string;
    sessionId: string;
    createdAt: string;
    format: "pdf" | "markdown" | "txt" | "json" | "email";
    status?: "queued" | "processing" | "completed" | "failed" | undefined;
    error?: string | undefined;
    url?: string | undefined;
}>;
export type ExportJob = z.infer<typeof ExportJobSchema>;
export declare const ProviderSchema: z.ZodEnum<["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"]>;
export type Provider = z.infer<typeof ProviderSchema>;
export declare const AppSettingsSchema: z.ZodObject<{
    provider: z.ZodDefault<z.ZodEnum<["openai", "anthropic", "google", "local", "custom", "openrouter", "lmstudio"]>>;
    apiKey: z.ZodOptional<z.ZodString>;
    baseUrl: z.ZodOptional<z.ZodString>;
    model: z.ZodDefault<z.ZodString>;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    systemPrompt: z.ZodDefault<z.ZodString>;
    language: z.ZodDefault<z.ZodString>;
    realtimeTranslation: z.ZodDefault<z.ZodBoolean>;
    autoHighlight: z.ZodDefault<z.ZodBoolean>;
    killSwitchEnabled: z.ZodDefault<z.ZodBoolean>;
    hideFromTaskbar: z.ZodDefault<z.ZodBoolean>;
    globalShortcut: z.ZodDefault<z.ZodString>;
    captureIntervalMs: z.ZodDefault<z.ZodNumber>;
    localStorageEnabled: z.ZodDefault<z.ZodBoolean>;
    exportDefaultFormat: z.ZodDefault<z.ZodEnum<["pdf", "markdown", "txt", "json", "email"]>>;
}, "strip", z.ZodTypeAny, {
    provider: "openai" | "custom" | "anthropic" | "google" | "local" | "openrouter" | "lmstudio";
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    language: string;
    realtimeTranslation: boolean;
    autoHighlight: boolean;
    killSwitchEnabled: boolean;
    hideFromTaskbar: boolean;
    globalShortcut: string;
    captureIntervalMs: number;
    localStorageEnabled: boolean;
    exportDefaultFormat: "pdf" | "markdown" | "txt" | "json" | "email";
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
}, {
    provider?: "openai" | "custom" | "anthropic" | "google" | "local" | "openrouter" | "lmstudio" | undefined;
    model?: string | undefined;
    apiKey?: string | undefined;
    baseUrl?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    systemPrompt?: string | undefined;
    language?: string | undefined;
    realtimeTranslation?: boolean | undefined;
    autoHighlight?: boolean | undefined;
    killSwitchEnabled?: boolean | undefined;
    hideFromTaskbar?: boolean | undefined;
    globalShortcut?: string | undefined;
    captureIntervalMs?: number | undefined;
    localStorageEnabled?: boolean | undefined;
    exportDefaultFormat?: "pdf" | "markdown" | "txt" | "json" | "email" | undefined;
}>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
export declare const TranslationSegmentSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    sourceSegmentId: z.ZodString;
    sourceText: z.ZodString;
    translatedText: z.ZodString;
    sourceLanguage: z.ZodDefault<z.ZodString>;
    targetLanguage: z.ZodDefault<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sessionId: string;
    timestamp: string;
    sourceSegmentId: string;
    sourceText: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
}, {
    id: string;
    sessionId: string;
    timestamp: string;
    sourceSegmentId: string;
    sourceText: string;
    translatedText: string;
    sourceLanguage?: string | undefined;
    targetLanguage?: string | undefined;
}>;
export type TranslationSegment = z.infer<typeof TranslationSegmentSchema>;
export declare const TeamMemberSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["owner", "admin", "member", "viewer"]>>;
    joinedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    email: string;
    name: string;
    role: "owner" | "admin" | "member" | "viewer";
    joinedAt: string;
}, {
    id: string;
    email: string;
    name: string;
    joinedAt: string;
    role?: "owner" | "admin" | "member" | "viewer" | undefined;
}>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export declare const TeamSessionShareSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodString;
    sharedBy: z.ZodString;
    sharedWith: z.ZodString;
    permission: z.ZodDefault<z.ZodEnum<["read", "write", "admin"]>>;
    sharedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    sessionId: string;
    sharedBy: string;
    sharedWith: string;
    permission: "admin" | "read" | "write";
    sharedAt: string;
}, {
    id: string;
    sessionId: string;
    sharedBy: string;
    sharedWith: string;
    sharedAt: string;
    permission?: "admin" | "read" | "write" | undefined;
}>;
export type TeamSessionShare = z.infer<typeof TeamSessionShareSchema>;
export declare const ActivityEventSchema: z.ZodObject<{
    id: z.ZodString;
    sessionId: z.ZodOptional<z.ZodString>;
    type: z.ZodString;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: string;
    id: string;
    timestamp: string;
    sessionId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}, {
    message: string;
    type: string;
    id: string;
    timestamp: string;
    sessionId?: string | undefined;
    metadata?: Record<string, any> | undefined;
}>;
export type ActivityEvent = z.infer<typeof ActivityEventSchema>;
