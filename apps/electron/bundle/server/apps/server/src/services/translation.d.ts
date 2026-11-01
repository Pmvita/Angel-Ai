import { LLMService } from "./llm";
export declare class TranslationService {
    private llm;
    constructor(llm: LLMService);
    translate(sessionId: string, sourceSegmentId: string, sourceText: string, sourceLanguage: string, targetLanguage: string): Promise<{
        id: string;
        translatedText: string;
        sourceLanguage: string;
        targetLanguage: string;
    }>;
    list(sessionId: string): any[];
}
