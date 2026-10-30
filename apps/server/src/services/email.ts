import nodemailer from "nodemailer";
import { store, COLLECTIONS } from "../db/index";
import { v4 as uuidv4 } from "uuid";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: Number(process.env.SMTP_PORT || 1025),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
    : undefined,
});

export class EmailExportService {
  async send(sessionId: string, to: string, format: string, filePath: string): Promise<{ id: string; status: string }> {
    const id = uuidv4();
    store.insert(COLLECTIONS.EXPORTS, { id, session_id: sessionId, format, status: "queued", created_at: new Date().toISOString() } as any);

    try {
      const session = store.get(COLLECTIONS.SESSIONS, sessionId);
      const rows: any[] = store.query(COLLECTIONS.TRANSCRIPT, (r: any) => r.sessionId === sessionId).sort(
        (a: any, b: any) => a.startTime - b.startTime,
      );
      const notes: any[] = store.query(COLLECTIONS.NOTES, (r: any) => r.sessionId === sessionId);

      let body = "";
      if (format === "markdown") {
        body = `# Meeting Transcript\n\n`;
        for (const r of rows) {
          body += `## ${r.speaker} — ${new Date(r.timestamp).toLocaleTimeString()}\n${r.text}\n\n`;
        }
        body += `\n## Notes\n\n`;
        for (const n of notes) body += `- [${n.type}] ${n.content}\n`;
      } else if (format === "txt") {
        body = "";
        for (const r of rows) body += `[${new Date(r.timestamp).toLocaleTimeString()}] ${r.speaker}: ${r.text}\n`;
      } else {
        body = JSON.stringify({ session, rows, notes }, null, 2);
      }

      await transporter.sendMail({
        from: process.env.SMTP_FROM || "noreply@angel-ai.local",
        to,
        subject: `angel AI Export — Session ${sessionId.slice(0, 8)}`,
        text: body,
        attachments: format === "pdf" ? [{ path: filePath }] : undefined,
      });

      store.update(COLLECTIONS.EXPORTS, id, { status: "completed" });
      return { id, status: "completed" as const };
    } catch (e: any) {
      store.update(COLLECTIONS.EXPORTS, id, { status: "failed", error: e.message });
      return { id, status: "failed" as const };
    }
  }
}

export const emailExportService = new EmailExportService();

