export type LLMProvider = "openai" | "anthropic" | "google" | "local" | "custom" | "openrouter" | "lmstudio";
interface LLMConfig {
    provider: LLMProvider;
    apiKey?: string;
    baseUrl?: string;
    model: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
}
export declare class LLMService {
    config: LLMConfig;
    private openai?;
    private anthropic?;
    private google?;
    constructor(config: LLMConfig);
    answer(question: string, context: string[]): Promise<string>;
    analyzeVision(imageBase64: string, prompt: string): Promise<{
        summary: string;
        keyPoints: string[];
        actionItems: string[];
        detectedText?: string;
    }>;
}
export {};
