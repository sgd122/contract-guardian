import type { AnalysisResultInput } from "@cg/shared";

export interface AnalyzeTextParams {
  text: string;
  contractType?: string;
}

export interface AnalyzeImagesParams {
  images: { data: string; mediaType: "image/jpeg" | "image/png" }[];
  contractType?: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
}

export interface AnalysisWithUsage {
  result: AnalysisResultInput;
  usage: TokenUsage | null;
}

export interface AIProviderInterface {
  analyzeText(params: AnalyzeTextParams): Promise<AnalysisWithUsage>;
  analyzeImages(params: AnalyzeImagesParams): Promise<AnalysisWithUsage>;
}
