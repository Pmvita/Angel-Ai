"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationService = void 0;
const index_1 = require("../db/index");
const uuid_1 = require("uuid");
class TranslationService {
    llm;
    constructor(llm) {
        this.llm = llm;
    }
    async translate(sessionId, sourceSegmentId, sourceText, sourceLanguage, targetLanguage) {
        const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Return ONLY the translated text, no explanations: "${sourceText}"`;
        const translatedText = await this.llm.answer(prompt, []);
        const id = (0, uuid_1.v4)();
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
        index_1.store.insert(index_1.COLLECTIONS.TRANSLATION, row);
        return { id, translatedText, sourceLanguage, targetLanguage };
    }
    list(sessionId) {
        return index_1.store.query(index_1.COLLECTIONS.TRANSLATION, (r) => r.sessionId === sessionId).sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));
    }
}
exports.TranslationService = TranslationService;
