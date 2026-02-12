import type { AnalysisResultInput } from "@cg/shared";

export interface AnalyzeTextParams {
  text: string;
  contractType?: string;
}

export interface AnalyzeImagesParams {
  images: { data: string; mediaType: "image/jpeg" | "image/png" }[];
  contractType?: string;
}

export interface AIProviderInterface {
  analyzeText(params: AnalyzeTextParams): Promise<AnalysisResultInput>;
  analyzeImages(params: AnalyzeImagesParams): Promise<AnalysisResultInput>;
}
