import { getGeminiClient } from "./client";
import { CONTRACT_ANALYSIS_SYSTEM_PROMPT } from "../prompts";
import { parseAnalysisResponse } from "../parse-response";
import { withRetryAndTimeout } from "../retry";
import { AI_PROVIDERS } from "@cg/shared";
import type {
  AnalyzeTextParams,
  AnalyzeImagesParams,
  AIProviderInterface,
  AnalysisWithUsage,
} from "../ai-types";

const MODEL = AI_PROVIDERS.gemini.model;

async function analyzeText(
  params: AnalyzeTextParams
): Promise<AnalysisWithUsage> {
  const { text, contractType } = params;
  const client = getGeminiClient();

  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
  });

  const userMessage = contractType
    ? `다음은 "${contractType}" 유형의 계약서입니다. 분석해주세요:\n\n${text}`
    : `다음 계약서를 분석해주세요:\n\n${text}`;

  return withRetryAndTimeout(async () => {
    const result = await model.generateContent(userMessage);
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("No text response from Gemini");
    }
    const metadata = result.response.usageMetadata;
    return {
      result: parseAnalysisResponse(responseText),
      usage: metadata
        ? {
            inputTokens: metadata.promptTokenCount ?? 0,
            outputTokens: metadata.candidatesTokenCount ?? 0,
          }
        : null,
    };
  }, "Gemini text analysis");
}

async function analyzeImages(
  params: AnalyzeImagesParams
): Promise<AnalysisWithUsage> {
  const { images, contractType } = params;
  const client = getGeminiClient();

  const model = client.getGenerativeModel({
    model: MODEL,
    systemInstruction: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
  });

  const textPrompt = contractType
    ? `이 이미지들은 "${contractType}" 유형의 계약서 페이지입니다. 텍스트를 읽고 분석해주세요.`
    : `이 이미지들은 계약서 페이지입니다. 텍스트를 읽고 분석해주세요.`;

  const imageParts = images.map((img) => ({
    inlineData: {
      data: img.data,
      mimeType: img.mediaType,
    },
  }));

  return withRetryAndTimeout(async () => {
    const result = await model.generateContent([
      ...imageParts,
      { text: textPrompt },
    ]);
    const responseText = result.response.text();
    if (!responseText) {
      throw new Error("No text response from Gemini");
    }
    const metadata = result.response.usageMetadata;
    return {
      result: parseAnalysisResponse(responseText),
      usage: metadata
        ? {
            inputTokens: metadata.promptTokenCount ?? 0,
            outputTokens: metadata.candidatesTokenCount ?? 0,
          }
        : null,
    };
  }, "Gemini vision analysis");
}

export const geminiProvider: AIProviderInterface = {
  analyzeText,
  analyzeImages,
};
