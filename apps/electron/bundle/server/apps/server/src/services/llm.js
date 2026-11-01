"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const openai_1 = require("openai");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const generative_ai_1 = require("@google/generative-ai");
function defaultBaseUrl(provider) {
    switch (provider) {
        case "openrouter":
            return "https://openrouter.ai/api/v1";
        case "lmstudio":
            return "http://localhost:1234/v1";
        default:
            return "";
    }
}
class LLMService {
    config;
    openai;
    anthropic;
    google;
    constructor(config) {
        this.config = config;
        const baseUrl = config.baseUrl || defaultBaseUrl(config.provider);
        if (config.provider === "openai" || config.provider === "custom" || config.provider === "openrouter" || config.provider === "lmstudio") {
            this.openai = new openai_1.OpenAI({ apiKey: config.apiKey || "", baseURL: baseUrl });
        }
        else if (config.provider === "anthropic") {
            this.anthropic = new sdk_1.default({ apiKey: config.apiKey || "" });
        }
        else if (config.provider === "google") {
            this.google = new generative_ai_1.GoogleGenerativeAI(config.apiKey || "");
        }
    }
    async answer(question, context) {
        const systemPrompt = this.config.systemPrompt || "You are a helpful meeting assistant. Answer concisely based on the transcript context.";
        const messages = [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Context:\n${context.join("\n")}\n\nQuestion: ${question}` },
        ];
        switch (this.config.provider) {
            case "openai":
            case "custom":
            case "openrouter":
            case "lmstudio": {
                const completion = await this.openai.chat.completions.create({
                    model: this.config.model,
                    messages: messages,
                    temperature: this.config.temperature,
                    max_tokens: this.config.maxTokens,
                });
                return completion.choices[0]?.message?.content || "No answer generated.";
            }
            case "anthropic": {
                const msg = await this.anthropic.messages.create({
                    model: this.config.model,
                    max_tokens: this.config.maxTokens,
                    temperature: this.config.temperature,
                    system: systemPrompt,
                    messages: [{ role: "user", content: `Context:\n${context.join("\n")}\n\nQuestion: ${question}` }],
                });
                return msg.content[0].text || "No answer generated.";
            }
            case "google": {
                const model = this.google.getGenerativeModel({ model: this.config.model });
                const result = await model.generateContent(`System: ${systemPrompt}\n\nContext:\n${context.join("\n")}\n\nQuestion: ${question}`);
                return result.response.text();
            }
            default:
                return "Unsupported provider.";
        }
    }
    async analyzeVision(imageBase64, prompt) {
        switch (this.config.provider) {
            case "openai":
            case "custom": {
                const completion = await this.openai.chat.completions.create({
                    model: this.config.model,
                    messages: [
                        { role: "system", content: "You analyze screenshots from meetings and interviews. Extract summary, key points, action items, and visible text." },
                        { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }] },
                    ],
                    max_tokens: 1000,
                });
                const content = completion.choices[0]?.message?.content || "{}";
                try {
                    return JSON.parse(content);
                }
                catch {
                    return { summary: content, keyPoints: [], actionItems: [] };
                }
            }
            case "anthropic": {
                const msg = await this.anthropic.messages.create({
                    model: this.config.model,
                    max_tokens: 1000,
                    temperature: this.config.temperature,
                    system: "You analyze screenshots from meetings and interviews. Extract summary, key points, action items, and visible text.",
                    messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } }] }],
                });
                const content = msg.content[0].text || "{}";
                try {
                    return JSON.parse(content);
                }
                catch {
                    return { summary: content, keyPoints: [], actionItems: [] };
                }
            }
            case "google": {
                const model = this.google.getGenerativeModel({ model: this.config.model });
                const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: "image/png" } }]);
                const content = result.response.text() || "{}";
                try {
                    return JSON.parse(content);
                }
                catch {
                    return { summary: content, keyPoints: [], actionItems: [] };
                }
            }
            default:
                return { summary: "Unsupported provider for vision.", keyPoints: [], actionItems: [] };
        }
    }
}
exports.LLMService = LLMService;
