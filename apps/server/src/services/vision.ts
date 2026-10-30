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

export class VisionService {
  constructor(private llm: LLMService) {}

  async analyze(imageBase64: string, sessionId: string, screenshotId: string): Promise<VisionAnalysis> {
    const result = await this.llm.analyzeVision(
      imageBase64,
      "Analyze this meeting/screen screenshot. Return JSON with keys: summary, keyPoints (array), actionItems (array), detectedText (string or null)."
    );
    const analysis: VisionAnalysis = {
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

