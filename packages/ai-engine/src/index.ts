import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import {
  AIConfig,
  AIEngineError,
  AIProvider,
  AnalysisResult,
  AnalysisType,
  ChatOptions,
} from "./types";

/**
 * Unified AI Engine
 * Provides a consistent interface for multiple AI providers with automatic fallback
 */
export class AIEngine {
  private config: AIConfig;
  private gemini: GoogleGenerativeAI | null = null;
  private currentProvider: AIProvider;
  private usageMetrics: Array<{
    provider: AIProvider;
    timestamp: Date;
    tokens?: number;
  }> = [];

  constructor(config: AIConfig) {
    this.config = config;
    this.currentProvider = config.primaryProvider;

    // Initialize Gemini if API key is provided
    if (config.apiKeys.gemini) {
      this.gemini = new GoogleGenerativeAI(config.apiKeys.gemini);
    }
  }

  /**
   * Generate text response with auto-fallback
   */
  async chat(prompt: string, options?: ChatOptions): Promise<string> {
    try {
      return await this.executeWithFallback(
        () => this.geminiChat(prompt, options),
        () => this.deepseekChat(prompt, options)
      );
    } catch (error) {
      throw new AIEngineError("All providers failed", error);
    }
  }

  /**
   * Stream responses for real-time chat
   */
  async *stream(prompt: string, options?: ChatOptions): AsyncGenerator<string> {
    if (!this.gemini) {
      throw new AIEngineError("Gemini not initialized");
    }

    const model = this.gemini.getGenerativeModel({
      model: options?.model || "gemini-2.0-flash-exp",
    });

    try {
      const result = await model.generateContentStream(prompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }

      if (this.config.costTracking) {
        this.trackUsage("gemini");
      }
    } catch (error) {
      throw new AIEngineError("Streaming failed", error);
    }
  }

  /**
   * Analyze data with AI (for resume scoring, menu optimization, etc.)
   */
  async analyze<T>(data: T, analysisType: AnalysisType): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(data, analysisType);
    const response = await this.chat(prompt);
    return this.parseAnalysisResponse(response, analysisType);
  }

  /**
   * Voice interaction (Gemini Live API)
   */
  async voice(audioStream: ReadableStream): Promise<ReadableStream> {
    if (!this.gemini) {
      throw new AIEngineError("Gemini not initialized");
    }

    const model = this.gemini.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
    });

    // Note: This is a placeholder for voice API integration
    // The actual implementation would depend on the Gemini Live API
    throw new AIEngineError("Voice API not yet implemented");
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    return {
      totalRequests: this.usageMetrics.length,
      byProvider: this.usageMetrics.reduce(
        (acc, metric) => {
          acc[metric.provider] = (acc[metric.provider] || 0) + 1;
          return acc;
        },
        {} as Record<AIProvider, number>
      ),
    };
  }

  /**
   * Auto-fallback logic
   */
  private async executeWithFallback<T>(
    primary: () => Promise<T>,
    fallback: () => Promise<T>
  ): Promise<T> {
    try {
      const result = await primary();
      if (this.config.costTracking) {
        this.trackUsage(this.config.primaryProvider);
      }
      return result;
    } catch (error) {
      if (!this.config.fallbackEnabled) {
        throw error;
      }

      console.warn("Primary provider failed, falling back...", error);

      try {
        const result = await fallback();
        if (this.config.costTracking) {
          const fallbackProvider =
            this.config.primaryProvider === "gemini" ? "deepseek" : "gemini";
          this.trackUsage(fallbackProvider);
        }
        return result;
      } catch (fallbackError) {
        throw new AIEngineError("Both providers failed", {
          primary: error,
          fallback: fallbackError,
        });
      }
    }
  }

  /**
   * Gemini chat implementation
   */
  private async geminiChat(prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.gemini) {
      throw new AIEngineError("Gemini API key not configured");
    }

    const model = this.gemini.getGenerativeModel({
      model: options?.model || "gemini-2.0-flash-exp",
    });

    const chat = model.startChat({
      history: options?.systemPrompt
        ? [
            {
              role: "user",
              parts: [{ text: options.systemPrompt }],
            },
            {
              role: "model",
              parts: [{ text: "Understood. I'll follow these instructions." }],
            },
          ]
        : [],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
  }

  /**
   * DeepSeek chat implementation
   */
  private async deepseekChat(prompt: string, options?: ChatOptions): Promise<string> {
    if (!this.config.apiKeys.deepseek) {
      throw new AIEngineError("DeepSeek API key not configured");
    }

    const messages: Array<{ role: string; content: string }> = [];

    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }

    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKeys.deepseek}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: options?.model || "deepseek-chat",
        messages,
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      throw new AIEngineError(`DeepSeek API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Build analysis prompt based on type
   */
  private buildAnalysisPrompt<T>(data: T, analysisType: AnalysisType): string {
    const dataStr = JSON.stringify(data, null, 2);

    const prompts: Record<AnalysisType, string> = {
      "resume-scoring": `Analyze the following resume and provide a score (0-100) and recommendations:\n\n${dataStr}\n\nProvide your response in JSON format with fields: insights, score, recommendations.`,
      "menu-optimization": `Analyze the following menu data and provide optimization recommendations:\n\n${dataStr}\n\nProvide your response in JSON format with fields: insights, recommendations.`,
      "sentiment-analysis": `Perform sentiment analysis on the following data:\n\n${dataStr}\n\nProvide your response in JSON format with fields: insights, score (sentiment score -1 to 1).`,
      "data-insights": `Analyze the following data and provide key insights:\n\n${dataStr}\n\nProvide your response in JSON format with fields: insights, recommendations.`,
      general: `Analyze the following data:\n\n${dataStr}\n\nProvide your analysis in JSON format with fields: insights.`,
    };

    return prompts[analysisType];
  }

  /**
   * Parse analysis response
   */
  private parseAnalysisResponse(
    response: string,
    analysisType: AnalysisType
  ): AnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          insights: parsed.insights || response,
          score: parsed.score,
          recommendations: parsed.recommendations,
          metadata: { analysisType },
        };
      }
    } catch (error) {
      // If JSON parsing fails, return the raw response
    }

    return {
      insights: response,
      metadata: { analysisType },
    };
  }

  /**
   * Track usage for analytics
   */
  private trackUsage(provider: AIProvider) {
    this.usageMetrics.push({
      provider,
      timestamp: new Date(),
    });

    // Keep only last 1000 metrics
    if (this.usageMetrics.length > 1000) {
      this.usageMetrics.shift();
    }
  }
}

/**
 * Create a singleton AI engine instance
 */
export function createAIEngine(config: AIConfig): AIEngine {
  return new AIEngine(config);
}

/**
 * Default AI engine instance (can be initialized with environment variables)
 */
export const ai = new AIEngine({
  primaryProvider: "gemini",
  apiKeys: {
    gemini: process.env.GEMINI_API_KEY,
    deepseek: process.env.DEEPSEEK_API_KEY,
  },
  fallbackEnabled: true,
  costTracking: true,
});


// Re-export types
export type {
  AIConfig,
  AIProvider,
  AnalysisType,
  AnalysisResult,
  ChatOptions,
} from "./types";
export { AIEngineError } from "./types";
