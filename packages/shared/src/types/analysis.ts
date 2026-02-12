export type RiskLevel = 'high' | 'medium' | 'low';

export type AnalysisStatus =
  | 'pending_payment'
  | 'paid'
  | 'processing'
  | 'completed'
  | 'failed';

export type ClauseType =
  | 'payment_terms'
  | 'scope_of_work'
  | 'intellectual_property'
  | 'termination'
  | 'warranty'
  | 'confidentiality'
  | 'liability'
  | 'dispute_resolution'
  | 'other';

export interface ClauseAnalysis {
  id: string;
  original_text: string;
  clause_type: ClauseType;
  risk_level: RiskLevel;
  risk_score: number; // 0-100
  explanation: string; // Easy Korean explanation
  suggestion: string; // Modification suggestion
  relevant_law: string; // Related law reference
}

export interface Improvement {
  priority: number;
  title: string;
  description: string;
  suggested_text: string;
}

export interface ContractParties {
  party_a: string;
  party_b: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  original_filename: string;
  file_path: string;
  file_type: 'pdf' | 'image';
  file_size_bytes: number;
  extracted_text?: string;
  page_count?: number;
  status: AnalysisStatus;
  overall_risk_level?: RiskLevel;
  overall_risk_score?: number;
  summary?: string;
  clauses: ClauseAnalysis[];
  improvements: Improvement[];
  contract_type?: string;
  contract_parties?: ContractParties;
  missing_clauses?: string[];
  input_tokens?: number;
  output_tokens?: number;
  api_cost_usd?: number;
  created_at: string;
}
