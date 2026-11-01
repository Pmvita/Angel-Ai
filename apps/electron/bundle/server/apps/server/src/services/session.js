"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionService = exports.SessionService = void 0;
const index_1 = require("../db/index");
const uuid_1 = require("uuid");
class SessionService {
    create(title, app = "unknown", windowTitle = "") {
        const id = (0, uuid_1.v4)();
        const now = new Date().toISOString();
        const row = { id, title, status: "idle", started_at: now, app, window_title: windowTitle };
        return index_1.store.insert(index_1.COLLECTIONS.SESSIONS, row);
    }
    get(id) {
        return index_1.store.get(index_1.COLLECTIONS.SESSIONS, id);
    }
    list() {
        return index_1.store.list(index_1.COLLECTIONS.SESSIONS).sort((a, b) => (b.started_at || "").localeCompare(a.started_at || ""));
    }
    updateStatus(id, status) {
        const patch = { status };
        if (status === "stopped")
            patch.ended_at = new Date().toISOString();
        index_1.store.update(index_1.COLLECTIONS.SESSIONS, id, patch);
    }
    addTranscriptSegment(sessionId, seg) {
        const row = { id: (0, uuid_1.v4)(), sessionId, ...seg };
        return index_1.store.insert(index_1.COLLECTIONS.TRANSCRIPT, row);
    }
    getTranscript(sessionId) {
        return index_1.store.query(index_1.COLLECTIONS.TRANSCRIPT, (r) => r.sessionId === sessionId).sort((a, b) => a.startTime - b.startTime);
    }
    addVisionAnalysis(sessionId, analysis) {
        const row = {
            id: (0, uuid_1.v4)(),
            sessionId,
            ...analysis,
            keyPoints: JSON.stringify(analysis.keyPoints),
            actionItems: JSON.stringify(analysis.actionItems),
        };
        return index_1.store.insert(index_1.COLLECTIONS.VISION, row);
    }
    addQuestion(sessionId, question) {
        const row = { id: (0, uuid_1.v4)(), sessionId, answer: null, ...question };
        return index_1.store.insert(index_1.COLLECTIONS.QUESTIONS, row);
    }
    answerQuestion(id, answer) {
        index_1.store.update(index_1.COLLECTIONS.QUESTIONS, id, { answer, status: "answered" });
    }
    addNote(sessionId, note) {
        const row = {
            id: (0, uuid_1.v4)(),
            sessionId,
            pinned: note.pinned ? 1 : 0,
            tags: JSON.stringify(note.tags ?? []),
            ...note,
        };
        return index_1.store.insert(index_1.COLLECTIONS.NOTES, row);
    }
    getNotes(sessionId) {
        return index_1.store.query(index_1.COLLECTIONS.NOTES, (r) => r.sessionId === sessionId).sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
    }
    addActivityEvent(sessionId, type, message, metadata) {
        const row = {
            id: (0, uuid_1.v4)(),
            sessionId: sessionId ?? null,
            type,
            message,
            metadata: metadata ? JSON.stringify(metadata) : null,
            timestamp: new Date().toISOString(),
        };
        return index_1.store.insert(index_1.COLLECTIONS.ACTIVITY, row);
    }
    getActivity(sessionId, limit = 50) {
        let rows = index_1.store.list(index_1.COLLECTIONS.ACTIVITY);
        if (sessionId)
            rows = rows.filter((r) => r.sessionId === sessionId);
        return rows.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || "")).slice(0, limit);
    }
}
exports.SessionService = SessionService;
exports.sessionService = new SessionService();
