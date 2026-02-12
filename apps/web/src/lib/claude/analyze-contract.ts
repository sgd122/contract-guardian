import { getAnthropicClient } from "./client";
import { CONTRACT_ANALYSIS_SYSTEM_PROMPT } from "./prompts";
import { parseAnalysisResponse } from "./parse-response";
import { ANALYSIS_TIMEOUT, MAX_RETRIES } from "@cg/shared";
import type { AnalysisResultInput } from "@cg/shared";

interface AnalyzeTextParams {
  text: string;
  contractType?: string;
}

interface AnalyzeImagesParams {
  images: { data: string; mediaType: "image/jpeg" | "image/png" }[];
  contractType?: string;
}

export async function analyzeContractText(
  params: AnalyzeTextParams
): Promise<AnalysisResultInput> {
  const { text, contractType } = params;
  const client = getAnthropicClient();

  const userMessage = contractType
    ? `다음은 "${contractType}" 유형의 계약서입니다. 분석해주세요:\n\n${text}`
    : `다음 계약서를 분석해주세요:\n\n${text}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await Promise.race([
        client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          system: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: userMessage,
            },
          ],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Analysis timeout")),
            ANALYSIS_TIMEOUT
          )
        ),
      ]);

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      return parseAnalysisResponse(textBlock.text);
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  throw lastError ?? new Error("Analysis failed after retries");
}

export async function analyzeContractImages(
  params: AnalyzeImagesParams
): Promise<AnalysisResultInput> {
  const { images, contractType } = params;
  const client = getAnthropicClient();

  const imageContent = images.map((img) => ({
    type: "image" as const,
    source: {
      type: "base64" as const,
      media_type: img.mediaType,
      data: img.data,
    },
  }));

  const textPrompt = contractType
    ? `이 이미지들은 "${contractType}" 유형의 계약서 페이지입니다. 텍스트를 읽고 분석해주세요.`
    : `이 이미지들은 계약서 페이지입니다. 텍스트를 읽고 분석해주세요.`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await Promise.race([
        client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8192,
          system: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                ...imageContent,
                { type: "text" as const, text: textPrompt },
              ],
            },
          ],
        }),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error("Analysis timeout")),
            ANALYSIS_TIMEOUT
          )
        ),
      ]);

      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        throw new Error("No text response from Claude");
      }

      return parseAnalysisResponse(textBlock.text);
    } catch (error) {
      lastError = error as Error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }
  }

  throw lastError ?? new Error("Vision analysis failed after retries");
}
