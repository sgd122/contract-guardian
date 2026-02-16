import { describe, it, expect } from "vitest";
import { parseAnalysisResponse } from "./parse-response";

describe("parseAnalysisResponse", () => {
  const validAnalysisResult = {
    overall_risk_level: "medium" as const,
    overall_risk_score: 42,
    summary: "계약서에 몇 가지 중요한 위험 요소가 발견되었습니다.",
    clauses: [
      {
        id: "clause-1",
        original_text: "대금은 작업 완료 후 30일 이내 지급",
        clause_type: "payment_terms" as const,
        risk_level: "medium" as const,
        risk_score: 50,
        explanation: "지급 기한이 명확하지만 지연 이자 조항 없음",
        suggestion: "지연 이자 조항 추가 권장",
        relevant_law: "민법 제387조",
      },
      {
        id: "clause-2",
        original_text: "계약 종료 시 지적재산권은 발주자에게 귀속",
        clause_type: "intellectual_property" as const,
        risk_level: "high" as const,
        risk_score: 80,
        explanation: "작업물에 대한 권리가 완전히 이전됨",
        suggestion: "일부 권리 유보 협상 필요",
        relevant_law: "저작권법 제45조",
      },
    ],
    improvements: [
      {
        priority: 1,
        title: "지연 손해금 조항 추가",
        description: "대금 지급 지연 시 손해배상 조항이 없습니다.",
        suggested_text: "대금 지급이 30일을 초과할 경우 연 12%의 지연이자를 가산합니다.",
      },
      {
        priority: 2,
        title: "계약 해지 조건 명확화",
        description: "일방적 해지 조건이 불명확합니다.",
        suggested_text: "30일 전 서면 통지로 계약을 해지할 수 있습니다.",
      },
    ],
    contract_type: "프리랜서 용역계약",
    contract_parties: {
      party_a: "발주자",
      party_b: "수급자",
    },
    missing_clauses: ["비밀유지 조항", "분쟁해결 조항"],
  };

  it("should parse valid JSON response", () => {
    const jsonString = JSON.stringify(validAnalysisResult);
    const result = parseAnalysisResponse(jsonString);
    expect(result).toEqual({ ...validAnalysisResult, ai_provider: "claude" });
  });

  it("should extract JSON from markdown code block", () => {
    const markdownResponse = `\`\`\`json
${JSON.stringify(validAnalysisResult, null, 2)}
\`\`\``;
    const result = parseAnalysisResponse(markdownResponse);
    expect(result).toEqual({ ...validAnalysisResult, ai_provider: "claude" });
  });

  it("should extract JSON from code block without language specifier", () => {
    const markdownResponse = `\`\`\`
${JSON.stringify(validAnalysisResult, null, 2)}
\`\`\``;
    const result = parseAnalysisResponse(markdownResponse);
    expect(result).toEqual({ ...validAnalysisResult, ai_provider: "claude" });
  });

  it("should throw error for invalid JSON", () => {
    const invalidJson = "{ invalid json }";
    expect(() => parseAnalysisResponse(invalidJson)).toThrow(
      /Failed to parse AI response as JSON/
    );
  });

  it("should throw error when overall_risk_score is missing", () => {
    const invalid = { ...validAnalysisResult };
    delete (invalid as any).overall_risk_score;
    const jsonString = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(jsonString)).toThrow(
      /Invalid analysis response schema/
    );
  });

  it("should throw error when summary is missing", () => {
    const invalid = { ...validAnalysisResult };
    delete (invalid as any).summary;
    const jsonString = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(jsonString)).toThrow(
      /Invalid analysis response schema/
    );
  });

  it("should throw error when clauses array has invalid items", () => {
    const invalid = {
      ...validAnalysisResult,
      clauses: [
        {
          id: "clause-1",
          original_text: "Some text",
          clause_type: "payment_terms",
          risk_level: "medium",
          // missing risk_score, explanation, suggestion, relevant_law
        },
      ],
    };
    const jsonString = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(jsonString)).toThrow(
      /Invalid analysis response schema/
    );
  });

  it("should throw error when overall_risk_score is out of range", () => {
    const invalid = { ...validAnalysisResult, overall_risk_score: 150 };
    const jsonString = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(jsonString)).toThrow(
      /Invalid analysis response schema/
    );
  });

  it("should throw error when clause risk_score is negative", () => {
    const invalid = {
      ...validAnalysisResult,
      clauses: [
        {
          ...validAnalysisResult.clauses[0],
          risk_score: -10,
        },
      ],
    };
    const jsonString = JSON.stringify(invalid);
    expect(() => parseAnalysisResponse(jsonString)).toThrow(
      /Invalid analysis response schema/
    );
  });

  it("should handle whitespace around JSON", () => {
    const jsonString = `  \n  ${JSON.stringify(validAnalysisResult)}  \n  `;
    const result = parseAnalysisResponse(jsonString);
    expect(result).toEqual({ ...validAnalysisResult, ai_provider: "claude" });
  });

  it("should handle whitespace inside markdown code blocks", () => {
    const markdownResponse = `\`\`\`json

${JSON.stringify(validAnalysisResult, null, 2)}

\`\`\``;
    const result = parseAnalysisResponse(markdownResponse);
    expect(result).toEqual({ ...validAnalysisResult, ai_provider: "claude" });
  });
});
