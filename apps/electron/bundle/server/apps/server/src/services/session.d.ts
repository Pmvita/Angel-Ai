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
export declare class SessionService {
    create(title: string, app?: string, windowTitle?: string): SessionRow;
    get(id: string): SessionRow | null;
    list(): SessionRow[];
    updateStatus(id: string, status: SessionStatus): void;
    addTranscriptSegment(sessionId: string, seg: {
        speaker: string;
        text: string;
        startTime: number;
        endTime: number;
        confidence?: number;
        isHighlighted?: boolean;
        timestamp: string;
    }): {
        id?: string;
    };
    getTranscript(sessionId: string): any[];
    addVisionAnalysis(sessionId: string, analysis: {
        screenshotId: string;
        provider: string;
        model: string;
        summary: string;
        keyPoints: string[];
        actionItems: string[];
        detectedText?: string;
        timestamp: string;
    }): {
        id?: string;
    };
    addQuestion(sessionId: string, question: {
        text: string;
        provider: string;
        model: string;
        status: string;
        timestamp: string;
    }): {
        id?: string;
    };
    answerQuestion(id: string, answer: string): void;
    addNote(sessionId: string, note: {
        content: string;
        type: string;
        pinned?: boolean;
        tags?: string[];
        createdAt: string;
        updatedAt: string;
    }): {
        id?: string;
    };
    getNotes(sessionId: string): any[];
    addActivityEvent(sessionId: string | undefined, type: string, message: string, metadata?: Record<string, unknown>): {
        id?: string;
    };
    getActivity(sessionId?: string, limit?: number): any[];
}
export declare const sessionService: SessionService;
