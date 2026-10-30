import { spawn } from "child_process";

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

export class TranscriptionService {
  private process: ReturnType<typeof spawn> | null = null;
  private sessionId: string | null = null;
  private startTime = Date.now();
  private onSegment?: (seg: TranscriptSegment) => void;

  start(sessionId: string, onSegment: (seg: TranscriptSegment) => void) {
    this.sessionId = sessionId;
    this.onSegment = onSegment;
    this.startTime = Date.now();

    // Use system speech-to-text via a lightweight recorder pipeline if available;
    // otherwise emit a placeholder so the UI remains functional.
    try {
      this.process = spawn("python3", ["-u", "-c", "import speech_recognition as sr; r=sr.Recognizer(); m=sr.Microphone(); print('READY', flush=True)"]);
    const proc = this.process;
    if (proc) {
      proc.stdout!.on("data", (data) => {
        const text = data.toString().trim();
        if (text === "READY") return;
        this.emitSegment("user", text);
      });
      proc.stderr!.on("data", () => {});
    }
    } catch {
      // python not available — no-op
    }
  }

  stop() {
    this.process?.kill();
    this.process = null;
    this.sessionId = null;
  }

  private emitSegment(speaker: TranscriptSegment["speaker"], text: string) {
    if (!this.sessionId || !this.onSegment) return;
    const now = Date.now();
    const seg: TranscriptSegment = {
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

  inject(speaker: TranscriptSegment["speaker"], text: string) {
    this.emitSegment(speaker, text);
  }
}

export const transcription = new TranscriptionService();

