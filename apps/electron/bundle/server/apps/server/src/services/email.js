"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailExportService = exports.EmailExportService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const index_1 = require("../db/index");
const uuid_1 = require("uuid");
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || "localhost",
    port: Number(process.env.SMTP_PORT || 1025),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
        : undefined,
});
class EmailExportService {
    async send(sessionId, to, format, filePath) {
        const id = (0, uuid_1.v4)();
        index_1.store.insert(index_1.COLLECTIONS.EXPORTS, { id, session_id: sessionId, format, status: "queued", created_at: new Date().toISOString() });
        try {
            const session = index_1.store.get(index_1.COLLECTIONS.SESSIONS, sessionId);
            const rows = index_1.store.query(index_1.COLLECTIONS.TRANSCRIPT, (r) => r.sessionId === sessionId).sort((a, b) => a.startTime - b.startTime);
            const notes = index_1.store.query(index_1.COLLECTIONS.NOTES, (r) => r.sessionId === sessionId);
            let body = "";
            if (format === "markdown") {
                body = `# Meeting Transcript\n\n`;
                for (const r of rows) {
                    body += `## ${r.speaker} — ${new Date(r.timestamp).toLocaleTimeString()}\n${r.text}\n\n`;
                }
                body += `\n## Notes\n\n`;
                for (const n of notes)
                    body += `- [${n.type}] ${n.content}\n`;
            }
            else if (format === "txt") {
                body = "";
                for (const r of rows)
                    body += `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.speaker}: ${r.text}\n`;
            }
            else {
                body = JSON.stringify({ session, rows, notes }, null, 2);
            }
            await transporter.sendMail({
                from: process.env.SMTP_FROM || "noreply@angel-ai.local",
                to,
                subject: `angel AI Export — Session ${sessionId.slice(0, 8)}`,
                text: body,
                attachments: format === "pdf" ? [{ path: filePath }] : undefined,
            });
            index_1.store.update(index_1.COLLECTIONS.EXPORTS, id, { status: "completed" });
            return { id, status: "completed" };
        }
        catch (e) {
            index_1.store.update(index_1.COLLECTIONS.EXPORTS, id, { status: "failed", error: e.message });
            return { id, status: "failed" };
        }
    }
}
exports.EmailExportService = EmailExportService;
exports.emailExportService = new EmailExportService();
