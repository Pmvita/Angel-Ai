import { writeFileSync, mkdirSync } from "node:fs";
import { jsPDF } from "jspdf";
import path from "node:path";
import { store, COLLECTIONS } from "../db/index";
import { v4 as uuidv4 } from "uuid";

const EXPORT_DIR = path.join(process.env.angel_DATA_DIR || process.cwd(), "exports");
mkdirSync(EXPORT_DIR, { recursive: true });

export class ExportService {
  createJob(sessionId: string, format: string) {
    const id = uuidv4();
    const now = new Date().toISOString();
    store.insert(COLLECTIONS.EXPORTS, { id, session_id: sessionId, format, status: "queued", created_at: now } as any);
    this.processJob(id, sessionId, format).catch(() => {});
    return { id, status: "queued" as const };
  }

  private async processJob(id: string, sessionId: string, format: string) {
    const setStatus = (status: string, url?: string, error?: string) => {
      store.update(COLLECTIONS.EXPORTS, id, { status, url: url ?? null, error: error ?? null });
    };
    try {
      setStatus("processing");
      const rows: any[] = store.query(COLLECTIONS.TRANSCRIPT, (r: any) => r.sessionId === sessionId).sort(
        (a: any, b: any) => a.startTime - b.startTime
      );
      const notes: any[] = store.query(COLLECTIONS.NOTES, (r: any) => r.sessionId === sessionId);
      const visions: any[] = store.query(COLLECTIONS.VISION, (r: any) => r.sessionId === sessionId).sort(
        (a: any, b: any) => (a.timestamp || "").localeCompare(b.timestamp || "")
      );

      const fileName = `angel-${sessionId.slice(0, 8)}.${format === "markdown" ? "md" : format}`;
      const filePath = path.join(EXPORT_DIR, fileName);

      if (format === "markdown") {
        let md = `# Meeting Transcript\n\n`;
        for (const r of rows) {
          md += `## ${r.speaker} — ${new Date(r.timestamp).toLocaleTimeString()}\n${r.text}\n\n`;
        }
        md += `\n## Notes\n\n`;
        for (const n of notes) md += `- [${n.type}] ${n.content}\n`;
        md += `\n## Vision Analysis\n\n`;
        for (const v of visions) md += `- ${v.summary}\n`;
        writeFileSync(filePath, md);
      } else if (format === "pdf") {
        const doc = new jsPDF();
        let y = 20;
        doc.setFontSize(16);
        doc.text("Meeting Transcript Export", 20, y);
        y += 10;
        doc.setFontSize(10);
        for (const r of rows) {
          const line = `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.speaker}: ${r.text}`;
          const splitLines = doc.splitTextToSize(line, 170);
          for (const l of splitLines) {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(l, 20, y);
            y += 6;
          }
        }
        y += 5;
        doc.text("Notes:", 20, y);
        y += 6;
        for (const n of notes) {
          const line = `- [${n.type}] ${n.content}`;
          const splitLines = doc.splitTextToSize(line, 170);
          for (const l of splitLines) {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(l, 20, y);
            y += 6;
          }
        }
        y += 5;
        doc.text("Vision Analysis:", 20, y);
        y += 6;
        for (const v of visions) {
          const line = `- ${v.summary}`;
          const splitLines = doc.splitTextToSize(line, 170);
          for (const l of splitLines) {
            if (y > 280) { doc.addPage(); y = 20; }
            doc.text(l, 20, y);
            y += 6;
          }
        }
        const pdfOutput = doc.output("arraybuffer");
        writeFileSync(filePath, Buffer.from(pdfOutput));

      } else if (format === "txt") {
        let txt = "";
        for (const r of rows) txt += `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.speaker}: ${r.text}\n`;
        writeFileSync(filePath, txt);
      } else if (format === "json") {
        writeFileSync(filePath, JSON.stringify({ rows, notes, visions }, null, 2));
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      setStatus("completed", filePath);
    } catch (e: any) {
      setStatus("failed", undefined, e.message);
    }
  }
}

export const exportService = new ExportService();

