import { getAnthropicClient } from "./client";
import { CONTRACT_ANALYSIS_SYSTEM_PROMPT } from "../prompts";
import { parseAnalysisResponse } from "../parse-response";
import { withRetryAndTimeout } from "../retry";
import { MAX_TOKENS, AI_PROVIDERS } from "@cg/shared";
import type {
  AnalyzeTextParams,
  AnalyzeImagesParams,
  AIProviderInterface,
  AnalysisWithUsage,
} from "../ai-types";

const MODEL = AI_PROVIDERS.claude.model;

async function analyzeText(
  params: AnalyzeTextParams
): Promise<AnalysisWithUsage> {
  const { text, contractType } = params;
  const client = getAnthropicClient();

  const userMessage = contractType
    ? `다음은 "${contractType}" 유형의 계약서입니다. 분석해주세요:\n\n${text}`
    : `다음 계약서를 분석해주세요:\n\n${text}`;

  return withRetryAndTimeout(async () => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: CONTRACT_ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    if (response.stop_reason === "max_tokens") {
      throw new Error(
        "분석 응답이 잘렸습니다. 계약서가 너무 길어 전체 분석이 불가능합니다."
      );
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return {
      result: parseAnalysisResponse(textBlock.text),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }, "Claude text analysis");
}

async function analyzeImages(
  params: AnalyzeImagesParams
): Promise<AnalysisWithUsage> {
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

  return withRetryAndTimeout(async () => {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
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
    });

    if (response.stop_reason === "max_tokens") {
      throw new Error(
        "분석 응답이 잘렸습니다. 계약서가 너무 길어 전체 분석이 불가능합니다."
      );
    }

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from Claude");
    }

    return {
      result: parseAnalysisResponse(textBlock.text),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }, "Claude vision analysis");
}

export const claudeProvider: AIProviderInterface = {
  analyzeText,
  analyzeImages,
};
