import { z } from 'zod';

const ClauseTypeSchema = z.enum([
  'payment_terms',
  'scope_of_work',
  'intellectual_property',
  'termination',
  'warranty',
  'confidentiality',
  'liability',
  'dispute_resolution',
  'other',
]);

const RiskLevelSchema = z.enum(['high', 'medium', 'low']);

export const ClauseAnalysisSchema = z.object({
  id: z.string(),
  original_text: z.string(),
  clause_type: ClauseTypeSchema,
  risk_level: RiskLevelSchema,
  risk_score: z.number().min(0).max(100),
  explanation: z.string(),
  suggestion: z.string(),
  relevant_law: z.string(),
});

export const ImprovementSchema = z.object({
  priority: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  suggested_text: z.string(),
});

export const ContractPartiesSchema = z.object({
  party_a: z.string(),
  party_b: z.string(),
});

export const AnalysisResultSchema = z.object({
  overall_risk_level: RiskLevelSchema,
  overall_risk_score: z.number().min(0).max(100),
  summary: z.string(),
  clauses: z.array(ClauseAnalysisSchema),
  improvements: z.array(ImprovementSchema),
  contract_type: z.string().optional(),
  contract_parties: ContractPartiesSchema.optional(),
  missing_clauses: z.array(z.string()).optional(),
});

export type ClauseAnalysisInput = z.infer<typeof ClauseAnalysisSchema>;
export type AnalysisResultInput = z.infer<typeof AnalysisResultSchema>;
