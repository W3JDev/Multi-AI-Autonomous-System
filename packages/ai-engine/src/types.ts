/**
 * AI Engine Error Class
 */
export class AIEngineError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AIEngineError";
  }
}

/**
 * AI Provider Types
 */
export type AIProvider = "gemini" | "deepseek";

/**
 * Analysis Types for different use cases
 */
export type AnalysisType =
  | "resume-scoring"
  | "menu-optimization"
  | "sentiment-analysis"
  | "data-insights"
  | "general";

/**
 * Chat Options
 */
export interface ChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * AI Configuration
 */
export interface AIConfig {
  primaryProvider: AIProvider;
  apiKeys: {
    gemini?: string;
    deepseek?: string;
  };
  fallbackEnabled: boolean;
  costTracking: boolean;
}

/**
 * Analysis Result
 */
export interface AnalysisResult {
  insights: string;
  score?: number;
  recommendations?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Usage Tracking
 */
interface UsageMetrics {
  provider: AIProvider;
  timestamp: Date;
  tokens?: number;
  cost?: number;
}
