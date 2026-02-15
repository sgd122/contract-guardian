import type { AIProvider } from "@cg/shared";
import type { AIProviderInterface } from "./ai-types";

export async function getAIProvider(provider: AIProvider): Promise<AIProviderInterface> {
  switch (provider) {
    case "claude": {
      const { claudeProvider } = await import("./claude/provider");
      return claudeProvider;
    }
    case "gemini": {
      const { geminiProvider } = await import("./gemini/provider");
      return geminiProvider;
    }
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
