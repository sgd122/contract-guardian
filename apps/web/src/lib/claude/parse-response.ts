import { AnalysisResultSchema } from "@cg/shared";
import type { AnalysisResultInput } from "@cg/shared";

export function parseAnalysisResponse(rawText: string): AnalysisResultInput {
  // Extract JSON from response (handle markdown code blocks)
  let jsonString = rawText.trim();

  // Remove markdown code block wrapper if present
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim();
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(
      `Failed to parse Claude response as JSON: ${jsonString.substring(0, 200)}...`
    );
  }

  const result = AnalysisResultSchema.safeParse(parsed);
  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Invalid analysis response schema: ${errors}`);
  }

  return result.data;
}
