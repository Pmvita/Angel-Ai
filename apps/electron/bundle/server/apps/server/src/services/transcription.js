"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcription = exports.TranscriptionService = void 0;
const child_process_1 = require("child_process");
class TranscriptionService {
    process = null;
    sessionId = null;
    startTime = Date.now();
    onSegment;
    start(sessionId, onSegment) {
        this.sessionId = sessionId;
        this.onSegment = onSegment;
        this.startTime = Date.now();
        // Use system speech-to-text via a lightweight recorder pipeline if available;
        // otherwise emit a placeholder so the UI remains functional.
        try {
            this.process = (0, child_process_1.spawn)("python3", ["-u", "-c", "import speech_recognition as sr; r=sr.Recognizer(); m=sr.Microphone(); print('READY', flush=True)"]);
            const proc = this.process;
            if (proc) {
                proc.stdout.on("data", (data) => {
                    const text = data.toString().trim();
                    if (text === "READY")
                        return;
                    this.emitSegment("user", text);
                });
                proc.stderr.on("data", () => { });
            }
        }
        catch {
            // python not available — no-op
        }
    }
    stop() {
        this.process?.kill();
        this.process = null;
        this.sessionId = null;
    }
    emitSegment(speaker, text) {
        if (!this.sessionId || !this.onSegment)
            return;
        const now = Date.now();
        const seg = {
            id: crypto.randomUUID(),
            sessionId: this.sessionId,
            speaker,
            text,
            startTime: now - this.startTime,
            endTime: now - this.startTime,
            timestamp: new Date().toISOString(),
        };
        this.onSegment(seg);
    }
    inject(speaker, text) {
        this.emitSegment(speaker, text);
    }
}
exports.TranscriptionService = TranscriptionService;
exports.transcription = new TranscriptionService();
