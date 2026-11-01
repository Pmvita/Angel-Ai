"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const index_1 = require("./db/index");
const session_1 = require("./services/session");
const transcription_1 = require("./services/transcription");
const llm_1 = require("./services/llm");
const export_1 = require("./services/export");
const email_1 = require("./services/email");
const translation_1 = require("./services/translation");
const vision_1 = require("./services/vision");
const node_path_1 = __importDefault(require("node:path"));
const app = (0, express_1.default)();
const http = (0, node_http_1.createServer)(app);
const io = new socket_io_1.Server(http, { cors: { origin: "*" } });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/exports", express_1.default.static(node_path_1.default.join(process.env.angel_DATA_DIR || process.cwd(), "exports")));
const PORT = Number(process.env.PORT || 4000);
// Settings (persisted to local JSON settings file)
const defaultSettings = {
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 4096,
    systemPrompt: "",
    language: "en",
    realtimeTranslation: false,
    autoHighlight: true,
    killSwitchEnabled: false,
    hideFromTaskbar: false,
    globalShortcut: "CmdOrCtrl+Shift+S",
    captureIntervalMs: 5000,
    localStorageEnabled: true,
    exportDefaultFormat: "markdown",
};
const settingsRow = index_1.store.get(index_1.COLLECTIONS.SETTINGS, "app");
let settings = settingsRow ? { ...settingsRow } : { ...defaultSettings };
let llm = new llm_1.LLMService({
    provider: settings.provider,
    apiKey: settings.apiKey || process.env.OPENAI_API_KEY,
    baseUrl: settings.baseUrl || process.env.OPENAI_BASE_URL,
    model: settings.model,
    temperature: settings.temperature,
    maxTokens: settings.maxTokens,
    systemPrompt: settings.systemPrompt,
});
const translation = new translation_1.TranslationService(llm);
const visionService = new vision_1.VisionService(llm);
function persistSettings(next) {
    settings = next;
    index_1.store.insert(index_1.COLLECTIONS.SETTINGS, { id: "app", ...next });
    llm = new llm_1.LLMService({
        provider: settings.provider,
        apiKey: settings.apiKey || process.env.OPENAI_API_KEY,
        baseUrl: settings.baseUrl || process.env.OPENAI_BASE_URL,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        systemPrompt: settings.systemPrompt,
    });
}
app.post("/api/auth/register", (req, res) => {
    const { email, password, name } = req.body || {};
    if (!email || !password)
        return res.status(400).json({ error: "Missing email or password" });
    const existing = index_1.store.list("users").find((u) => u.email === email);
    if (existing)
        return res.status(409).json({ error: "User exists" });
    const user = index_1.store.insert("users", { email, password, name: name || email.split("@")[0], createdAt: new Date().toISOString() });
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "angel-ai-server" }));
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    const user = index_1.store.list("users").find((u) => u.email === email && u.password === password);
    if (!user)
        return res.status(401).json({ error: "Invalid credentials" });
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString("base64");
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});
// Sessions
app.get("/api/sessions", (_req, res) => res.json(session_1.sessionService.list()));
app.post("/api/sessions", (req, res) => {
    const { title, app: appName, windowTitle } = req.body || {};
    const s = session_1.sessionService.create(title || "Untitled Session", appName, windowTitle);
    io.emit("session.created", { sessionId: s.id, status: s.status });
    session_1.sessionService.addActivityEvent(s.id, "session.started", `Session "${s.title}" started`, { app: appName });
    // Wire real-time transcription pipeline: persist segments and broadcast over socket.io
    transcription_1.transcription.stop();
    transcription_1.transcription.start(s.id, (seg) => {
        try {
            session_1.sessionService.addTranscriptSegment(s.id, {
                speaker: seg.speaker,
                text: seg.text,
                startTime: seg.startTime,
                endTime: seg.endTime,
                confidence: seg.confidence,
                isHighlighted: seg.isHighlighted,
                timestamp: seg.timestamp,
            });
        }
        catch { }
        io.emit("transcript", { ...seg, sessionId: s.id });
    });
    res.json(s);
});
app.post("/api/sessions/:id/stop", (req, res) => {
    session_1.sessionService.updateStatus(req.params.id, "stopped");
    transcription_1.transcription.stop();
    io.emit("status", { status: "stopped" });
    res.json({ ok: true });
});
// Settings
app.get("/api/settings", (_req, res) => res.json(settings));
app.post("/api/settings", (req, res) => {
    persistSettings({ ...settings, ...req.body });
    res.json({ ok: true });
});
// Transcript
app.get("/api/sessions/:id/transcript", (req, res) => res.json(session_1.sessionService.getTranscript(req.params.id)));
app.get("/api/sessions/:id/vision", (req, res) => {
    const rows = index_1.store.query(index_1.COLLECTIONS.VISION, (r) => r.session_id === req.params.id).sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
    res.json(rows);
});
app.post("/api/vision", async (req, res) => {
    const { sessionId, imageBase64, screenshotId } = req.body || {};
    if (!sessionId || !imageBase64)
        return res.status(400).json({ error: "Missing sessionId or imageBase64" });
    try {
        const sid = screenshotId || crypto.randomUUID();
        const analysis = await visionService.analyze(imageBase64, sessionId, sid);
        session_1.sessionService.addVisionAnalysis(sessionId, {
            screenshotId: sid,
            provider: analysis.provider,
            model: analysis.model,
            summary: analysis.summary,
            keyPoints: analysis.keyPoints,
            actionItems: analysis.actionItems,
            detectedText: analysis.detectedText,
            timestamp: analysis.timestamp,
        });
        io.emit("vision", analysis);
        session_1.sessionService.addActivityEvent(sessionId, "vision", `Vision analyzed: ${analysis.summary.slice(0, 80)}`);
        res.json(analysis);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Ask
app.post("/api/ask", async (req, res) => {
    const { sessionId, question, provider, model } = req.body || {};
    if (!sessionId || !question)
        return res.status(400).json({ error: "Missing sessionId or question" });
    const q = session_1.sessionService.addQuestion(sessionId, { text: question, provider: provider || settings.provider, model: model || settings.model, status: "pending", timestamp: new Date().toISOString() });
    session_1.sessionService.addActivityEvent(sessionId, "question", `Q: ${question}`, { questionId: q.id });
    try {
        const rows = session_1.sessionService.getTranscript(sessionId);
        const context = rows.map((r) => `[${r.speaker}] ${r.text}`);
        const answer = await llm.answer(question, context);
        const answerText = answer ?? "";
        if (q.id)
            session_1.sessionService.answerQuestion(q.id, answerText);
        io.emit("question.answered", { ...q, answer: answerText, status: "answered" });
        if (q.id && sessionId)
            session_1.sessionService.addActivityEvent(sessionId, "question.answered", `A: ${answerText.slice(0, 100)}`, { questionId: q.id });
        res.json({ ...q, answer: answerText, status: "answered" });
    }
    catch (e) {
        if (q.id)
            session_1.sessionService.answerQuestion(q.id, "");
        io.emit("question.answered", { ...q, answer: "", status: "error" });
        res.status(500).json({ error: e.message });
    }
});
// Translation
app.post("/api/translate", async (req, res) => {
    const { sessionId, sourceSegmentId, sourceText, sourceLanguage = "en", targetLanguage = "es" } = req.body || {};
    if (!sessionId || !sourceText)
        return res.status(400).json({ error: "Missing sessionId or sourceText" });
    try {
        const result = await translation.translate(sessionId, sourceSegmentId, sourceText, sourceLanguage, targetLanguage);
        session_1.sessionService.addActivityEvent(sessionId, "translation", `Translated: ${sourceText.slice(0, 60)}... -> ${targetLanguage}`);
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.get("/api/sessions/:id/translations", (req, res) => {
    res.json(translation.list(req.params.id));
});
app.post("/api/notes/auto", async (req, res) => {
    const { sessionId } = req.body || {};
    if (!sessionId)
        return res.status(400).json({ error: "Missing sessionId" });
    try {
        const rows = session_1.sessionService.getTranscript(sessionId);
        const context = rows.map((r) => `[${r.speaker}] ${r.text}`).join("\n");
        const prompt = `Summarize the following meeting transcript into 3-5 concise bullet-point notes. Return only the bullets, one per line, prefixed with "- ".\n\n${context}`;
        const summary = await llm.answer(prompt, []);
        const bullets = summary.split("\n").map((l) => l.trim()).filter(Boolean);
        const created = [];
        for (const b of bullets) {
            const content = b.replace(/^[-*]\s*/, "");
            if (!content)
                continue;
            const now = new Date().toISOString();
            const note = session_1.sessionService.addNote(sessionId, { content, type: "auto", tags: ["auto"], createdAt: now, updatedAt: now });
            created.push(note);
            io.emit("note.created", note);
        }
        session_1.sessionService.addActivityEvent(sessionId, "notes.auto", `Generated ${created.length} auto notes`);
        res.json(created);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
app.post("/api/notes", (req, res) => {
    const { sessionId, content, type = "manual", tags } = req.body || {};
    if (!sessionId || !content)
        return res.status(400).json({ error: "Missing sessionId or content" });
    const now = new Date().toISOString();
    const note = session_1.sessionService.addNote(sessionId, { content, type, tags: tags || [], createdAt: now, updatedAt: now });
    io.emit("note.created", note);
    session_1.sessionService.addActivityEvent(sessionId, "note.created", `Note added: ${content.slice(0, 60)}`, { noteId: note.id });
    res.json(note);
});
app.post("/api/checkout", async (req, res) => {
    const { plan = "pro", email } = req.body || {};
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
        return res.json({ url: null, message: "Stripe not configured. Set STRIPE_SECRET_KEY to enable checkout." });
    }
    try {
        const Stripe = (await Promise.resolve().then(() => __importStar(require("stripe")))).default;
        const stripe = new Stripe(key);
        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer_email: email,
            line_items: [{ price: process.env.STRIPE_PRICE_ID || "", quantity: 1 }],
            success_url: `${process.env.APP_URL || "http://localhost:3001"}/?checkout=success`,
            cancel_url: `${process.env.APP_URL || "http://localhost:3001"}/pricing`,
            metadata: { plan },
        });
        res.json({ url: session.url });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Export
app.post("/api/export", (req, res) => {
    const { sessionId, format } = req.body || {};
    if (!sessionId || !format)
        return res.status(400).json({ error: "Missing sessionId or format" });
    const job = export_1.exportService.createJob(sessionId, format);
    res.json(job);
});
app.get("/api/export/:id", (req, res) => {
    const row = index_1.store.get(index_1.COLLECTIONS.EXPORTS, req.params.id);
    if (!row)
        return res.status(404).json({ error: "Not found" });
    if (row.url) {
        const base = node_path_1.default.basename(row.url);
        row.url = `/exports/${base}`;
    }
    res.json(row);
});
// Email export
app.post("/api/export/email", async (req, res) => {
    const { sessionId, to, format = "markdown", filePath } = req.body || {};
    if (!sessionId || !to)
        return res.status(400).json({ error: "Missing sessionId or to" });
    try {
        const result = await email_1.emailExportService.send(sessionId, to, format, filePath);
        res.json(result);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// Activity
app.get("/api/activity", (req, res) => {
    const sessionId = req.query.sessionId;
    const limit = Number(req.query.limit || 50);
    res.json(session_1.sessionService.getActivity(sessionId, limit));
});
// Team shares
app.post("/api/team/share", (req, res) => {
    const { sessionId, sharedBy, sharedWith, permission = "read" } = req.body || {};
    if (!sessionId || !sharedBy || !sharedWith)
        return res.status(400).json({ error: "Missing fields" });
    const share = index_1.store.insert(index_1.COLLECTIONS.TEAM_SHARE, {
        id: undefined,
        sessionId,
        sharedBy,
        sharedWith,
        permission,
        sharedAt: new Date().toISOString(),
    });
    session_1.sessionService.addActivityEvent(sessionId, "team.share", `Session shared with ${sharedWith}`, { permission });
    res.json(share);
});
app.get("/api/team/shares", (req, res) => {
    const userId = req.query.userId;
    let rows = index_1.store.list(index_1.COLLECTIONS.TEAM_SHARE);
    if (userId)
        rows = rows.filter((r) => r.sharedWith === userId || r.sharedBy === userId);
    res.json(rows);
});
// Kill-switch
app.post("/api/kill-switch", (req, res) => {
    const { enabled } = req.body || {};
    settings.killSwitchEnabled = !!enabled;
    io.emit("kill-switch", { enabled: settings.killSwitchEnabled });
    session_1.sessionService.addActivityEvent(undefined, "kill-switch", `Kill switch ${settings.killSwitchEnabled ? "enabled" : "disabled"}`);
    res.json({ ok: true, enabled: settings.killSwitchEnabled });
});
// Socket.io
io.on("connection", (socket) => {
    socket.on("join", (_data) => {
        socket.join("global");
        io.to(socket.id).emit("status", { status: "idle" });
        io.to(socket.id).emit("kill-switch", { enabled: settings.killSwitchEnabled });
    });
    socket.on("transcript.inject", (data) => {
        transcription_1.transcription.inject(data.speaker, data.text);
        io.emit("transcript", { ...data, timestamp: new Date().toISOString() });
    });
});
http.listen(PORT, () => {
    console.log(`angel AI server listening on http://localhost:${PORT}`);
});
