import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

function defaultBaseUrl(provider: LLMProvider): string {
  switch (provider) {
    case "openrouter":
      return "https://openrouter.ai/api/v1";
    case "lmstudio":
      return "http://localhost:1234/v1";
    default:
      return "";
  }
}

export class LLMService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private google?: GoogleGenerativeAI;

  constructor(public config: LLMConfig) {
    const baseUrl = config.baseUrl || defaultBaseUrl(config.provider);
    if (config.provider === "openai" || config.provider === "custom" || config.provider === "openrouter" || config.provider === "lmstudio") {
      this.openai = new OpenAI({ apiKey: config.apiKey || "", baseURL: baseUrl });
    } else if (config.provider === "anthropic") {
      this.anthropic = new Anthropic({ apiKey: config.apiKey || "" });
    } else if (config.provider === "google") {
      this.google = new GoogleGenerativeAI(config.apiKey || "");
    }
  }

  async answer(question: string, context: string[]): Promise<string> {
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
        const completion = await this.openai!.chat.completions.create({
          model: this.config.model,
          messages: messages as any,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        });
        return completion.choices[0]?.message?.content || "No answer generated.";
      }
      case "anthropic": {
        const msg = await this.anthropic!.messages.create({
          model: this.config.model,
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          system: systemPrompt,
          messages: [{ role: "user", content: `Context:\n${context.join("\n")}\n\nQuestion: ${question}` }],
        });
        return (msg.content[0] as any).text || "No answer generated.";
      }
      case "google": {
        const model = this.google!.getGenerativeModel({ model: this.config.model });
        const result = await model.generateContent(`System: ${systemPrompt}\n\nContext:\n${context.join("\n")}\n\nQuestion: ${question}`);
        return result.response.text();
      }
      default:
        return "Unsupported provider.";
    }
  }

  async analyzeVision(imageBase64: string, prompt: string): Promise<{ summary: string; keyPoints: string[]; actionItems: string[]; detectedText?: string }> {
    switch (this.config.provider) {
      case "openai":
      case "custom":
      case "openrouter":
      case "lmstudio": {
        const completion = await this.openai!.chat.completions.create({
          model: this.config.model,
          messages: [
            { role: "system", content: "You analyze screenshots from meetings and interviews. Extract summary, key points, action items, and visible text." },
            { role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }] },
          ],
          max_tokens: 1000,
        });
        const rawContent = completion.choices[0]?.message?.content || "{}";
        const content = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        try {
          const parsed = JSON.parse(content);
          return { summary: parsed.summary || content, keyPoints: parsed.keyPoints || [], actionItems: parsed.actionItems || [], detectedText: parsed.detectedText || undefined };
        } catch {
          return { summary: rawContent, keyPoints: [], actionItems: [] };
        }
      }
      case "anthropic": {
        const msg = await this.anthropic!.messages.create({
          model: this.config.model,
          max_tokens: 1000,
          temperature: this.config.temperature,
          system: "You analyze screenshots from meetings and interviews. Extract summary, key points, action items, and visible text.",
          messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } }] }],
        });
        const rawContent = (msg.content[0] as any).text || "{}";
        const content = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        try {
          const parsed = JSON.parse(content);
          return { summary: parsed.summary || content, keyPoints: parsed.keyPoints || [], actionItems: parsed.actionItems || [], detectedText: parsed.detectedText || undefined };
        } catch {
          return { summary: rawContent, keyPoints: [], actionItems: [], detectedText: undefined };
        }
      }
      case "google": {
        const model = this.google!.getGenerativeModel({ model: this.config.model });
        const result = await model.generateContent([prompt, { inlineData: { data: imageBase64, mimeType: "image/png" } }]);
        const rawContent = result.response.text() || "{}";
        const content = rawContent.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
        try {
          const parsed = JSON.parse(content);
          return { summary: parsed.summary || content, keyPoints: parsed.keyPoints || [], actionItems: parsed.actionItems || [], detectedText: parsed.detectedText || undefined };
        } catch {
          return { summary: rawContent, keyPoints: [], actionItems: [], detectedText: undefined };
        }
      }
      default:
        return { summary: "Unsupported provider for vision.", keyPoints: [], actionItems: [] };
    }
  }
}

