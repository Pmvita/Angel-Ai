"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VisionService = void 0;
class VisionService {
    llm;
    constructor(llm) {
        this.llm = llm;
    }
    async analyze(imageBase64, sessionId, screenshotId) {
        const result = await this.llm.analyzeVision(imageBase64, "Analyze this meeting/screen screenshot. Return JSON with keys: summary, keyPoints (array), actionItems (array), detectedText (string or null).");
        const analysis = {
            id: crypto.randomUUID(),
            sessionId,
            screenshotId,
            provider: this.llm.config.provider,
            model: "gpt-4o-mini",
            summary: result.summary,
            keyPoints: result.keyPoints,
            actionItems: result.actionItems,
            detectedText: result.detectedText,
            timestamp: new Date().toISOString(),
        };
        return analysis;
    }
}
exports.VisionService = VisionService;
