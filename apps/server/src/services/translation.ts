import { LLMService } from "./llm";
import { store, COLLECTIONS } from "../db/index";
import { v4 as uuidv4 } from "uuid";

export class TranslationService {
  constructor(private llm: LLMService) {}

  async translate(
    sessionId: string,
    sourceSegmentId: string,
    sourceText: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<{
    id: string;
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
  }> {
    const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translated text, no explanations: "${sourceText}"`;
    const translatedText = await this.llm.answer(prompt, []);

    const id = uuidv4();
    const row = {
      id,
      sessionId,
      sourceSegmentId,
      sourceText,
      translatedText,
      sourceLanguage,
      targetLanguage,
      timestamp: new Date().toISOString(),
    };
    store.insert(COLLECTIONS.TRANSLATION, row as any);

    return { id, translatedText, sourceLanguage, targetLanguage };
  }

  list(sessionId: string) {
    return (store.query(COLLECTIONS.TRANSLATION, (r: any) => r.sessionId === sessionId) as any[]).sort(
      (a: any, b: any) => (b.timestamp || "").localeCompare(a.timestamp || ""),
    );
  }
}

