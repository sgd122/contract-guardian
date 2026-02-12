import type { AIProvider } from "@cg/shared";
import type { AIProviderInterface } from "./types";

export async function getAIProvider(provider: AIProvider): Promise<AIProviderInterface> {
  switch (provider) {
    case "claude": {
      const { claudeProvider } = await import("@/lib/claude/analyze-contract");
      return claudeProvider;
    }
    case "gemini": {
      const { geminiProvider } = await import("@/lib/gemini/analyze-contract");
      return geminiProvider;
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
