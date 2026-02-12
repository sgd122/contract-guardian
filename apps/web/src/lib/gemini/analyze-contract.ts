import { getGeminiClient } from "./client";
import { CONTRACT_ANALYSIS_SYSTEM_PROMPT } from "../claude/prompts";
import { parseAnalysisResponse } from "../claude/parse-response";
import { ANALYSIS_TIMEOUT, MAX_RETRIES } from "@cg/shared";
import type { AnalysisResultInput } from "@cg/shared";
import type {
  AnalyzeTextParams,
  AnalyzeImagesParams,
  AIProviderInterface,
} from "@/lib/ai/types";

async function analyzeText(
  params: AnalyzeTextParams
): Promise<AnalysisResultInput> {
  const { text, contractType } = params;
  const client = getGeminiClient();

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
  });

  const userMessage = contractType
    ? `다음은 "${contractType}" 유형의 계약서입니다. 분석해주세요:\n\n${text}`
    : `다음 계약서를 분석해주세요:\n\n${text}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        model.generateContent(userMessage),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Analysis timeout")),
            ANALYSIS_TIMEOUT
          )
        ),
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error("No text response from Gemini");
      }

      return parseAnalysisResponse(responseText);
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[Gemini] 텍스트 분석 시도 ${attempt + 1}/${MAX_RETRIES + 1} 실패:`,
        (error as Error).message
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  console.error("[Gemini] 텍스트 분석 최종 실패:", lastError?.message);
  throw lastError ?? new Error("Analysis failed after retries");
}

async function analyzeImages(
  params: AnalyzeImagesParams
): Promise<AnalysisResultInput> {
  const { images, contractType } = params;
  const client = getGeminiClient();

  const model = client.getGenerativeModel({
    model: "gemini-2.5-flash",
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

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await Promise.race([
        model.generateContent([...imageParts, { text: textPrompt }]),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Analysis timeout")),
            ANALYSIS_TIMEOUT
          )
        ),
      ]);

      const responseText = result.response.text();
      if (!responseText) {
        throw new Error("No text response from Gemini");
      }

      return parseAnalysisResponse(responseText);
    } catch (error) {
      lastError = error as Error;
      console.warn(
        `[Gemini] 이미지 분석 시도 ${attempt + 1}/${MAX_RETRIES + 1} 실패:`,
        (error as Error).message
      );
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  console.error("[Gemini] 이미지 분석 최종 실패:", lastError?.message);
  throw lastError ?? new Error("Vision analysis failed after retries");
}

export const geminiProvider: AIProviderInterface = {
  analyzeText,
  analyzeImages,
};
