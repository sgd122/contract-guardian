import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/shared/lib/env";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}
