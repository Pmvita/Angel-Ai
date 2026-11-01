"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportService = exports.ExportService = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const index_1 = require("../db/index");
const uuid_1 = require("uuid");
const EXPORT_DIR = node_path_1.default.join(process.env.angel_DATA_DIR || process.cwd(), "exports");
(0, node_fs_1.mkdirSync)(EXPORT_DIR, { recursive: true });
class ExportService {
    async createJob(sessionId, format) {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        index_1.store.insert(index_1.COLLECTIONS.EXPORTS, { id, session_id: sessionId, format, status: "queued", created_at: now });
        this.processJob(id, sessionId, format).catch(() => { });
        return { id, status: "queued" };
    }
    async processJob(id, sessionId, format) {
        const setStatus = (status, url, error) => {
            index_1.store.update(index_1.COLLECTIONS.EXPORTS, id, { status, url: url ?? null, error: error ?? null });
        };
        try {
            setStatus("processing");
            const rows = index_1.store.query(index_1.COLLECTIONS.TRANSCRIPT, (r) => r.sessionId === sessionId).sort((a, b) => a.startTime - b.startTime);
            const notes = index_1.store.query(index_1.COLLECTIONS.NOTES, (r) => r.sessionId === sessionId);
            const visions = index_1.store.query(index_1.COLLECTIONS.VISION, (r) => r.sessionId === sessionId).sort((a, b) => (a.timestamp || "").localeCompare(b.timestamp || ""));
            const fileName = `angel-${sessionId.slice(0, 8)}.${format === "markdown" ? "md" : format}`;
            const filePath = node_path_1.default.join(EXPORT_DIR, fileName);
            if (format === "markdown") {
                let md = `# Meeting Transcript\n\n`;
                for (const r of rows) {
                    md += `## ${r.speaker} — ${new Date(r.timestamp).toLocaleTimeString()}\n${r.text}\n\n`;
                }
                md += `\n## Notes\n\n`;
                for (const n of notes)
                    md += `- [${n.type}] ${n.content}\n`;
                md += `\n## Vision Analysis\n\n`;
                for (const v of visions)
                    md += `- ${v.summary}\n`;
                (0, node_fs_1.writeFileSync)(filePath, md);
            }
            else if (format === "pdf") {
                // Minimal PDF text fallback (jspdf would be used in browser; here we write a text-based PDF placeholder)
                (0, node_fs_1.writeFileSync)(filePath, `%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nstartxref\n0\n%%EOF\n`);
            }
            else if (format === "txt") {
                let txt = "";
                for (const r of rows)
                    txt += `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.speaker}: ${r.text}\n`;
                (0, node_fs_1.writeFileSync)(filePath, txt);
            }
            else if (format === "json") {
                (0, node_fs_1.writeFileSync)(filePath, JSON.stringify({ rows, notes, visions }, null, 2));
            }
            else {
                throw new Error(`Unsupported format: ${format}`);
            }
            setStatus("completed", filePath);
        }
        catch (e) {
            setStatus("failed", undefined, e.message);
        }
    }
}
exports.ExportService = ExportService;
exports.exportService = new ExportService();
