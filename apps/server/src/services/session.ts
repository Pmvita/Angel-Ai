import { store, COLLECTIONS } from "../db/index";
import { v4 as uuidv4 } from "uuid";

export type SessionStatus = "idle" | "listening" | "analyzing" | "paused" | "stopped";

export interface SessionRow {
  id: string;
  title: string;
  status: SessionStatus;
  started_at: string;
  ended_at?: string;
  app: string;
  window_title: string;
  settings?: string;
}

export class SessionService {
  create(title: string, app: string = "unknown", windowTitle: string = ""): SessionRow {
    const id = uuidv4();
    const now = new Date().toISOString();
    const row: SessionRow = { id, title, status: "idle", started_at: now, app, window_title: windowTitle };
    return store.insert(COLLECTIONS.SESSIONS, row);
  }

  get(id: string): SessionRow | null {
    return store.get(COLLECTIONS.SESSIONS, id);
  }

  list(): SessionRow[] {
    return (store.list(COLLECTIONS.SESSIONS) as SessionRow[]).sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""));
  }

  updateStatus(id: string, status: SessionStatus): void {
    const patch: Partial<SessionRow> = { status };
    if (status === "stopped") patch.ended_at = new Date().toISOString();
    store.update(COLLECTIONS.SESSIONS, id, patch);
  }

  addTranscriptSegment(sessionId: string, seg: {
    speaker: string; text: string; startTime: number; endTime: number;
    confidence?: number; isHighlighted?: boolean; timestamp: string;
  }) {
    const row = { id: uuidv4(), sessionId, ...seg };
    return store.insert(COLLECTIONS.TRANSCRIPT, row);
  }

  getTranscript(sessionId: string) {
    return (store.query(COLLECTIONS.TRANSCRIPT, (r: any) => r.sessionId === sessionId) as any[]).sort(
      (a: any, b: any) => a.startTime - b.startTime
    );
  }

  addVisionAnalysis(sessionId: string, analysis: {
    screenshotId: string; provider: string; model: string; summary: string;
    keyPoints: string[]; actionItems: string[]; detectedText?: string; timestamp: string;
  }) {
    const row = {
      id: uuidv4(),
      sessionId,
      ...analysis,
      keyPoints: JSON.stringify(analysis.keyPoints),
      actionItems: JSON.stringify(analysis.actionItems),
    };
    return store.insert(COLLECTIONS.VISION, row);
  }

  addQuestion(sessionId: string, question: { text: string; provider: string; model: string; status: string; timestamp: string }) {
    const row = { id: uuidv4(), sessionId, answer: null, ...question };
    return store.insert(COLLECTIONS.QUESTIONS, row);
  }

  answerQuestion(id: string, answer: string) {
    store.update(COLLECTIONS.QUESTIONS, id, { answer, status: "answered" });
  }

  addNote(sessionId: string, note: { content: string; type: string; pinned?: boolean; tags?: string[]; createdAt: string; updatedAt: string }) {
    const row = {
      id: uuidv4(),
      sessionId,
      pinned: note.pinned ? 1 : 0,
      tags: JSON.stringify(note.tags ?? []),
      ...note,
    };
    return store.insert(COLLECTIONS.NOTES, row);
  }

  getNotes(sessionId: string) {
    return (store.query(COLLECTIONS.NOTES, (r: any) => r.sessionId === sessionId) as any[]).sort(
      (a: any, b: any) => (b.updated_at || "").localeCompare(a.updated_at || "")
    );
  }

  addActivityEvent(sessionId: string | undefined, type: string, message: string, metadata?: Record<string, unknown>) {
    const row = {
      id: uuidv4(),
      sessionId: sessionId ?? null,
      type,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null,
      timestamp: new Date().toISOString(),
    };
    return store.insert(COLLECTIONS.ACTIVITY, row);
  }

  getActivity(sessionId?: string, limit = 50) {
    let rows = store.list(COLLECTIONS.ACTIVITY) as any[];
    if (sessionId) rows = rows.filter((r) => r.sessionId === sessionId);
    return rows.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || "")).slice(0, limit);
  }
}

export const sessionService = new SessionService();

