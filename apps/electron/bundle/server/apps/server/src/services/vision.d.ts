import { LLMService } from "./llm";
export interface VisionAnalysis {
    id: string;
    sessionId: string;
    screenshotId: string;
    provider: string;
    model: string;
    summary: string;
    keyPoints: string[];
    actionItems: string[];
    detectedText?: string;
    timestamp: string;
}
export declare class VisionService {
    private llm;
    constructor(llm: LLMService);
    analyze(imageBase64: string, sessionId: string, screenshotId: string): Promise<VisionAnalysis>;
}
