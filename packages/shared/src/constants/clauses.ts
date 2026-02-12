import type { ClauseType } from '../types/analysis';

export const CLAUSE_TYPE_LABELS: Record<ClauseType, string> = {
  payment_terms: '대금 조건',
  scope_of_work: '업무 범위',
  intellectual_property: '지적재산권',
  termination: '계약 해지',
  warranty: '보증/하자',
  confidentiality: '비밀유지',
  liability: '손해배상',
  dispute_resolution: '분쟁 해결',
  other: '기타',
};
