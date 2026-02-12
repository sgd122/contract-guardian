export type ContractType =
  | 'freelance'
  | 'service'
  | 'nda'
  | 'lease'
  | 'employment'
  | 'other';

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  freelance: '프리랜서 계약',
  service: '용역 계약',
  nda: '비밀유지 계약(NDA)',
  lease: '임대차 계약',
  employment: '근로 계약',
  other: '기타 계약',
};

export const CONTRACT_TYPE_DESCRIPTIONS: Record<ContractType, string> = {
  freelance: '프리랜서와 클라이언트 간의 업무 위탁 계약',
  service: '서비스 제공자와 이용자 간의 용역 계약',
  nda: '당사자 간 비밀정보 보호를 위한 계약',
  lease: '부동산 임대차 관련 계약',
  employment: '사용자와 근로자 간의 근로 계약',
  other: '분류되지 않은 기타 유형의 계약',
};
