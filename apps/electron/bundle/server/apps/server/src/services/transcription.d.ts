export interface TranscriptSegment {
    id: string;
    sessionId: string;
    speaker: "system" | "user" | "other" | "unknown";
    text: string;
    startTime: number;
    endTime: number;
    confidence?: number;
    isHighlighted?: boolean;
    timestamp: string;
}
export declare class TranscriptionService {
    private process;
    private sessionId;
    private startTime;
    private onSegment?;
    start(sessionId: string, onSegment: (seg: TranscriptSegment) => void): void;
    stop(): void;
    private emitSegment;
    inject(speaker: TranscriptSegment["speaker"], text: string): void;
}
export declare const transcription: TranscriptionService;
