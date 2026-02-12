-- ============================================================================
-- Contract Guardian - Supabase Seed Data
-- ============================================================================
-- Realistic Korean test data for development/testing
-- Idempotent: Safe to run multiple times (deletes existing test data first)
-- ============================================================================

-- Cleanup existing test data (in reverse dependency order)
DELETE FROM consent_logs WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

DELETE FROM payments WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

DELETE FROM analyses WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

DELETE FROM profiles WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

DELETE FROM auth.identities WHERE user_id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

DELETE FROM auth.users WHERE id IN (
  '11111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  '33333333-3333-3333-3333-333333333333',
  '44444444-4444-4444-4444-444444444444'
);

-- ============================================================================
-- AUTH USERS (trigger auto-creates profiles)
-- ============================================================================

INSERT INTO auth.users (
  id, instance_id, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change, email_change_token_new,
  email_change_token_current, reauthentication_token, phone, phone_change,
  phone_change_token, aud, role
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'kim.minjun@example.com',
  crypt('test123!@#', gen_salt('bf')),
  NOW() - INTERVAL '90 days',
  '{"provider": "kakao", "providers": ["kakao"]}'::jsonb,
  '{"full_name": "김민준", "avatar_url": "https://i.pravatar.cc/150?u=kim", "provider": "kakao"}'::jsonb,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '1 day',
  '', '', '', '', '', '', NULL, '', '',
  'authenticated', 'authenticated'
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'park.seoyeon@gmail.com',
  crypt('test123!@#', gen_salt('bf')),
  NOW() - INTERVAL '45 days',
  '{"provider": "google", "providers": ["google"]}'::jsonb,
  '{"full_name": "박서연", "avatar_url": "https://i.pravatar.cc/150?u=park", "provider": "google"}'::jsonb,
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '2 days',
  '', '', '', '', '', '', NULL, '', '',
  'authenticated', 'authenticated'
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'lee.jiwoo@kakao.com',
  crypt('test123!@#', gen_salt('bf')),
  NOW() - INTERVAL '3 days',
  '{"provider": "kakao", "providers": ["kakao"]}'::jsonb,
  '{"full_name": "이지우", "avatar_url": "https://i.pravatar.cc/150?u=lee", "provider": "kakao"}'::jsonb,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 hours',
  '', '', '', '', '', '', NULL, '', '',
  'authenticated', 'authenticated'
),
-- User D: Dev test account (test@test.com / test1234)
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'test@test.com',
  crypt('test1234', gen_salt('bf')),
  NOW() - INTERVAL '30 days',
  '{"provider": "email", "providers": ["email"]}'::jsonb,
  '{"full_name": "테스트계정", "avatar_url": "https://i.pravatar.cc/150?u=test", "provider": "email"}'::jsonb,
  NOW() - INTERVAL '30 days',
  NOW(),
  '', '', '', '', '', '', NULL, '', '',
  'authenticated', 'authenticated'
);

-- ============================================================================
-- AUTH IDENTITIES (required for email/password login)
-- ============================================================================

INSERT INTO auth.identities (
  id, user_id, provider_id, provider, identity_data,
  last_sign_in_at, created_at, updated_at
) VALUES
(
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'email',
  '{"sub": "11111111-1111-1111-1111-111111111111", "email": "kim.minjun@example.com", "full_name": "김민준"}'::jsonb,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '1 day'
),
(
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'email',
  '{"sub": "22222222-2222-2222-2222-222222222222", "email": "park.seoyeon@gmail.com", "full_name": "박서연"}'::jsonb,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '2 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  '33333333-3333-3333-3333-333333333333',
  'email',
  '{"sub": "33333333-3333-3333-3333-333333333333", "email": "lee.jiwoo@kakao.com", "full_name": "이지우"}'::jsonb,
  NOW() - INTERVAL '3 hours',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 hours'
),
(
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  '44444444-4444-4444-4444-444444444444',
  'email',
  '{"sub": "44444444-4444-4444-4444-444444444444", "email": "test@test.com", "full_name": "테스트계정"}'::jsonb,
  NOW(),
  NOW() - INTERVAL '30 days',
  NOW()
);

-- ============================================================================
-- PROFILES (override trigger-created defaults)
-- ============================================================================

UPDATE profiles SET free_analyses_remaining = 1 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE profiles SET free_analyses_remaining = 0 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE profiles SET free_analyses_remaining = 1 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE profiles SET free_analyses_remaining = 0 WHERE id = '44444444-4444-4444-4444-444444444444';

-- ============================================================================
-- ANALYSES
-- ============================================================================

-- Analysis 1: User A - Completed freelance contract (HIGH RISK, 78)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'aaaaaaaa-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  '프리랜서_계약서_2024.pdf',
  '11111111-1111-1111-1111-111111111111/aaaaaaaa-0001-0001-0001-000000000001.pdf',
  'pdf', 245760,
  '업무위탁계약서

본 계약서는 아래 당사자 간에 업무위탁에 관한 사항을 정함에 있어 상호 신의와 성실을 바탕으로 계약을 체결한다.

제1조 (목적) 본 계약은 을이 갑에게 제공하는 웹 개발 용역에 관한 사항을 정함을 목적으로 한다.

제2조 (대금지급) 갑은 을에게 월 300만원의 용역비를 매월 말일에 지급한다. 단, 프로젝트 지연 시 갑의 판단에 따라 지급을 보류할 수 있다.

제3조 (지적재산권) 본 업무 수행 중 발생한 모든 산출물의 지적재산권은 갑에게 귀속된다.

제4조 (계약해지) 갑은 언제든지 7일 전 통보로 본 계약을 해지할 수 있다. 단, 을의 귀책사유가 있을 경우 즉시 해지할 수 있다.

제5조 (비밀유지) 을은 업무 수행 중 알게 된 모든 정보를 영구히 비밀로 유지하여야 하며, 위반 시 손해배상책임을 진다.

갑: (주)테크코리아
을: 김민준',
  3, 'completed', 'high', 78,
  '본 프리랜서 계약서는 전반적으로 갑(발주자)에게 유리하게 작성되어 있으며, 을(프리랜서)에게 상당한 위험 요소가 존재합니다. 특히 대금 지급 보류 조건, 일방적 해지권, 무제한 지적재산권 이전 등이 주요 위험 사항입니다. 업무 범위가 불명확하고, 보증·손해배상·분쟁해결 조항이 누락되어 있어 분쟁 발생 시 불리한 상황에 처할 수 있습니다.',
  '[
    {
      "id": "clause-0001-0001",
      "original_text": "갑은 을에게 월 300만원의 용역비를 매월 말일에 지급한다. 단, 프로젝트 지연 시 갑의 판단에 따라 지급을 보류할 수 있다.",
      "clause_type": "payment_terms",
      "risk_level": "high",
      "risk_score": 85,
      "explanation": "대금 지급 조건이 매우 불공정합니다. ''갑의 판단''이라는 일방적 기준으로 지급을 보류할 수 있어 프리랜서에게 큰 위험이 됩니다. 프로젝트 지연의 책임 소재나 기준이 명확하지 않아 분쟁 소지가 큽니다.",
      "suggestion": "''프로젝트 지연 시 양 당사자 협의 하에 지급 일정을 조정할 수 있다''로 수정하고, 지연의 기준과 책임 소재를 명확히 규정해야 합니다. 또한 ''기 완료된 업무에 대해서는 지급을 보장한다''는 조항을 추가해야 합니다.",
      "relevant_law": "하도급거래 공정화에 관한 법률 제13조(부당한 대금 지급 금지)"
    },
    {
      "id": "clause-0001-0002",
      "original_text": "본 업무 수행 중 발생한 모든 산출물의 지적재산권은 갑에게 귀속된다.",
      "clause_type": "intellectual_property",
      "risk_level": "high",
      "risk_score": 80,
      "explanation": "지적재산권이 무조건 갑에게 귀속되는 조항은 프리랜서에게 매우 불리합니다. 대금을 받지 못한 경우에도 권리를 주장할 수 없으며, 포트폴리오 활용도 제한될 수 있습니다.",
      "suggestion": "''본 계약의 대금이 완전히 지급된 후 지적재산권이 갑에게 이전된다''로 수정하고, ''을은 포트폴리오 목적으로 산출물을 활용할 수 있다''는 조항을 추가해야 합니다.",
      "relevant_law": "저작권법 제45조(저작재산권의 양도)"
    },
    {
      "id": "clause-0001-0003",
      "original_text": "갑은 언제든지 7일 전 통보로 본 계약을 해지할 수 있다. 단, 을의 귀책사유가 있을 경우 즉시 해지할 수 있다.",
      "clause_type": "termination",
      "risk_level": "high",
      "risk_score": 75,
      "explanation": "계약 해지 조건이 일방적입니다. 갑은 7일 전 통보만으로 이유 없이 해지할 수 있는 반면, 을의 해지권은 명시되어 있지 않습니다. 또한 ''귀책사유''의 기준이 불명확합니다.",
      "suggestion": "양 당사자 모두 동일한 조건의 해지권을 가지도록 수정하고, 귀책사유의 구체적 기준을 명시해야 합니다. 중도 해지 시 기 수행 업무에 대한 정산 조항도 추가해야 합니다.",
      "relevant_law": "민법 제673조(도급인의 해제권)"
    },
    {
      "id": "clause-0001-0004",
      "original_text": "을은 업무 수행 중 알게 된 모든 정보를 영구히 비밀로 유지하여야 하며, 위반 시 손해배상책임을 진다.",
      "clause_type": "confidentiality",
      "risk_level": "medium",
      "risk_score": 65,
      "explanation": "비밀유지 의무가 ''영구히''로 설정되어 있고, 손해배상 범위가 무제한입니다. 일반적인 영업비밀 보호 범위를 벗어나며, 프리랜서에게 과도한 부담을 줍니다.",
      "suggestion": "비밀유지 기간을 ''계약 종료 후 3년''으로 제한하고, 공지된 정보나 제3자로부터 적법하게 취득한 정보는 제외하는 예외 조항을 추가해야 합니다.",
      "relevant_law": "부정경쟁방지 및 영업비밀보호에 관한 법률 제2조"
    },
    {
      "id": "clause-0001-0005",
      "original_text": "본 계약은 을이 갑에게 제공하는 웹 개발 용역에 관한 사항을 정함을 목적으로 한다.",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 55,
      "explanation": "업무 범위가 ''웹 개발 용역''이라고만 명시되어 있어 너무 추상적입니다. 구체적인 업무 내용, 산출물, 일정 등이 없어 범위 분쟁이 발생할 수 있습니다.",
      "suggestion": "구체적인 업무 내용(예: 반응형 웹사이트 프론트엔드 개발, 5개 페이지), 산출물 형식, 개발 기술 스택, 완료 기준, 일정을 별도 첨부 문서로 작성하여 계약서에 포함시켜야 합니다.",
      "relevant_law": "민법 제664조(도급의 의의)"
    }
  ]'::jsonb,
  '["계약 당사자 간 권리·의무의 균형을 맞추기 위해 해지권, 손해배상 범위 등을 상호 대등하게 수정해야 합니다.", "분쟁 해결 절차(관할 법원, 중재 조항 등)를 명시하여 법적 분쟁 발생 시 신속한 해결이 가능하도록 해야 합니다.", "업무 범위, 일정, 산출물 등을 구체적으로 작성한 별첨 문서를 첨부하여 계약 내용을 명확히 해야 합니다.", "대금 지급 조건을 단계별(착수금 30%, 중간금 30%, 완료 후 40%)로 나누어 위험을 분산시켜야 합니다."]'::jsonb,
  'freelance',
  '{"party_a": "(주)테크코리아", "party_b": "김민준"}'::jsonb,
  '["warranty", "liability", "dispute_resolution"]'::jsonb,
  3245, 2180, 0.024530,
  NOW() - INTERVAL '85 days'
);

-- Analysis 2: User A - Completed NDA (LOW RISK, 25)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'aaaaaaaa-0002-0002-0002-000000000002',
  '11111111-1111-1111-1111-111111111111',
  '비밀유지계약서_스타트업.pdf',
  '11111111-1111-1111-1111-111111111111/aaaaaaaa-0002-0002-0002-000000000002.pdf',
  'pdf', 189440,
  '비밀유지계약서 (Non-Disclosure Agreement)

제1조 (목적) 본 계약은 양 당사자가 사업 협력 검토 과정에서 상호 교환하는 비밀정보의 보호에 관한 사항을 규정함을 목적으로 한다.

제2조 (비밀정보의 정의) 비밀정보란 서면, 구두, 전자적 형태로 제공되는 기술, 영업, 재무 정보를 포함하되, 다음 각 호는 제외한다:
1. 공지된 정보
2. 제3자로부터 적법하게 취득한 정보
3. 독자적으로 개발한 정보

제3조 (비밀유지의무) 수령 당사자는 비밀정보를 본 계약의 목적 범위 내에서만 사용하고, 제공자의 사전 서면 동의 없이 제3자에게 공개하지 않는다.

제4조 (유효기간) 본 계약의 유효기간은 체결일로부터 2년으로 하며, 계약 종료 후에도 비밀유지의무는 3년간 존속한다.

제5조 (반환) 계약 종료 시 모든 비밀정보 및 복사본을 반환하거나 제공자의 지시에 따라 폐기한다.

제6조 (손해배상) 본 계약 위반으로 인한 손해배상은 실제 발생한 직접 손해로 한정한다.

제7조 (분쟁해결) 본 계약과 관련한 분쟁은 서울중앙지방법원을 관할 법원으로 한다.

갑: (주)혁신스타트업
을: 김민준',
  4, 'completed', 'low', 25,
  '본 비밀유지계약서(NDA)는 전반적으로 균형 잡힌 양호한 계약서입니다. 비밀정보의 범위가 명확하고, 합리적 예외사항이 포함되어 있으며, 유효기간과 손해배상 제한도 적절합니다. 분쟁해결 관할도 명시되어 있어 법적 안정성이 높습니다.',
  '[
    {
      "id": "clause-0002-0001",
      "original_text": "비밀정보란 서면, 구두, 전자적 형태로 제공되는 기술, 영업, 재무 정보를 포함하되, 다음 각 호는 제외한다: 1. 공지된 정보 2. 제3자로부터 적법하게 취득한 정보 3. 독자적으로 개발한 정보",
      "clause_type": "confidentiality",
      "risk_level": "low",
      "risk_score": 20,
      "explanation": "비밀정보의 범위가 명확하게 정의되어 있으며, 표준적인 예외 사항이 잘 포함되어 있습니다. 당사자 간 분쟁 소지가 적은 합리적인 조항입니다.",
      "suggestion": "현재 조항이 양호하나, 필요시 ''비밀''이라고 표시된 정보로 한정하는 조항을 추가하여 더욱 명확히 할 수 있습니다.",
      "relevant_law": "부정경쟁방지 및 영업비밀보호에 관한 법률 제2조(정의)"
    },
    {
      "id": "clause-0002-0002",
      "original_text": "수령 당사자는 비밀정보를 본 계약의 목적 범위 내에서만 사용하고, 제공자의 사전 서면 동의 없이 제3자에게 공개하지 않는다.",
      "clause_type": "confidentiality",
      "risk_level": "low",
      "risk_score": 15,
      "explanation": "비밀유지 의무가 명확하게 규정되어 있으며, 목적 외 사용 금지와 제3자 공개 금지가 적절히 명시되어 있습니다.",
      "suggestion": "현재 조항이 우수합니다. 필요시 임직원에게도 동일한 의무를 부과한다는 문구를 추가할 수 있습니다.",
      "relevant_law": "부정경쟁방지 및 영업비밀보호에 관한 법률 제10조(비밀유지명령)"
    },
    {
      "id": "clause-0002-0003",
      "original_text": "본 계약의 유효기간은 체결일로부터 2년으로 하며, 계약 종료 후에도 비밀유지의무는 3년간 존속한다.",
      "clause_type": "termination",
      "risk_level": "low",
      "risk_score": 25,
      "explanation": "계약 기간과 비밀유지 의무 존속 기간이 합리적으로 설정되어 있습니다. 총 5년(계약 2년 + 사후 3년)은 일반적인 NDA 관행에 부합합니다.",
      "suggestion": "현재 조항이 적절합니다. 다만 업종 특성상 더 긴 보호가 필요하다면 협의를 통해 조정할 수 있습니다.",
      "relevant_law": "민법 제162조(채권의 소멸시효)"
    },
    {
      "id": "clause-0002-0004",
      "original_text": "본 계약 위반으로 인한 손해배상은 실제 발생한 직접 손해로 한정한다.",
      "clause_type": "liability",
      "risk_level": "low",
      "risk_score": 30,
      "explanation": "손해배상 범위가 직접 손해로 명확히 제한되어 있어 예측 가능성이 높고 합리적입니다.",
      "suggestion": "현재 조항이 양호합니다. 필요시 손해배상 상한액을 설정하여 위험을 더욱 제한할 수 있습니다.",
      "relevant_law": "민법 제393조(손해배상의 범위)"
    },
    {
      "id": "clause-0002-0005",
      "original_text": "계약 종료 시 모든 비밀정보 및 복사본을 반환하거나 제공자의 지시에 따라 폐기한다.",
      "clause_type": "confidentiality",
      "risk_level": "low",
      "risk_score": 20,
      "explanation": "비밀정보 반환 및 폐기 의무가 명확하게 규정되어 있어 계약 종료 후 정보 유출 위험을 최소화합니다.",
      "suggestion": "현재 조항이 우수합니다. 필요시 폐기 확인서 제출 의무를 추가할 수 있습니다.",
      "relevant_law": "개인정보 보호법 제21조(개인정보의 파기)"
    },
    {
      "id": "clause-0002-0006",
      "original_text": "본 계약과 관련한 분쟁은 서울중앙지방법원을 관할 법원으로 한다.",
      "clause_type": "dispute_resolution",
      "risk_level": "low",
      "risk_score": 35,
      "explanation": "관할 법원이 명확히 지정되어 있어 분쟁 발생 시 절차가 예측 가능합니다.",
      "suggestion": "현재 조항이 적절합니다. 다만 중재 조항을 추가하여 소송 전 대체 분쟁 해결 방법을 마련하는 것도 고려해볼 수 있습니다.",
      "relevant_law": "민사소송법 제28조(관할의 합의)"
    }
  ]'::jsonb,
  '["전반적으로 균형 잡힌 NDA 계약서입니다. 임직원에 대한 비밀유지 교육 의무를 추가하면 더욱 강화할 수 있습니다.", "손해배상 상한액을 설정하여 양 당사자의 위험을 더욱 명확히 할 수 있습니다."]'::jsonb,
  'nda',
  '{"party_a": "(주)혁신스타트업", "party_b": "김민준"}'::jsonb,
  '[]'::jsonb,
  2890, 1950, 0.019800,
  NOW() - INTERVAL '60 days'
);

-- Analysis 3: User B - Completed service contract (MEDIUM RISK, 52)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'bbbbbbbb-0003-0003-0003-000000000003',
  '22222222-2222-2222-2222-222222222222',
  '컨설팅_용역_계약서.pdf',
  '22222222-2222-2222-2222-222222222222/bbbbbbbb-0003-0003-0003-000000000003.pdf',
  'pdf', 312000,
  '컨설팅 용역 계약서

제1조 (용역의 내용) 을은 갑의 마케팅 전략 수립 및 실행 지원 업무를 수행한다.

제2조 (계약금액 및 지급조건)
- 총 계약금액: 금 2,000만원 (부가세 별도)
- 지급조건: 착수금 30% (계약 체결 시), 중간금 30% (1차 보고서 제출 시), 잔금 40% (최종 보고서 검수 완료 후 14일 이내)

제3조 (용역기간) 계약 체결일로부터 3개월로 하며, 양 당사자 합의 시 연장할 수 있다.

제4조 (산출물) 을은 다음의 산출물을 제공한다:
- 시장 조사 보고서
- 마케팅 전략 기획서
- 실행 계획 로드맵

제5조 (검수) 갑은 산출물 수령 후 7일 이내 검수를 완료한다. 기간 내 이의가 없으면 승인된 것으로 본다.

제6조 (손해배상) 을의 귀책사유로 인한 손해에 대해서는 계약금액 범위 내에서 배상책임을 진다.

제7조 (재산권) 본 용역의 결과물에 대한 저작재산권은 갑에게 귀속되며, 을은 저작인격권을 행사하지 않는다.

제8조 (해지) 일방 당사자의 중대한 계약 위반 시, 상대방은 14일의 시정 기간을 부여한 후 계약을 해지할 수 있다.

갑: (주)글로벌마케팅
을: 박서연',
  5, 'completed', 'medium', 52,
  '본 컨설팅 용역 계약서는 대체로 합리적인 구조를 갖추고 있으나, 일부 조항에서 을(수급인)에게 불리한 요소가 있습니다. 대금 지급 조건은 단계별로 잘 설정되어 있으나, 업무 범위의 추상성과 저작인격권 불행사 조항이 위험 요소입니다. 비밀유지 및 분쟁해결 조항이 누락되어 있습니다.',
  '[
    {
      "id": "clause-0003-0001",
      "original_text": "총 계약금액: 금 2,000만원 (부가세 별도), 지급조건: 착수금 30%, 중간금 30%, 잔금 40% (최종 보고서 검수 완료 후 14일 이내)",
      "clause_type": "payment_terms",
      "risk_level": "low",
      "risk_score": 30,
      "explanation": "대금 지급 조건이 단계별로 명확하게 설정되어 있어 합리적입니다. 검수 완료 후 14일 이내 잔금 지급 조건도 적절합니다.",
      "suggestion": "현재 조항이 우수합니다. 다만 지연 지급 시 지연이자(예: 연 12%) 조항을 추가하면 더욱 보호받을 수 있습니다.",
      "relevant_law": "하도급거래 공정화에 관한 법률 제13조"
    },
    {
      "id": "clause-0003-0002",
      "original_text": "을은 갑의 마케팅 전략 수립 및 실행 지원 업무를 수행한다.",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 55,
      "explanation": "업무 범위가 다소 추상적입니다. ''실행 지원''의 구체적인 범위가 불명확하여 추가 업무 요구 시 분쟁이 발생할 수 있습니다.",
      "suggestion": "''실행 지원''의 구체적 범위(예: 월 2회 회의 참석, 이메일 컨설팅 월 10회 이내)를 명시해야 합니다.",
      "relevant_law": "민법 제664조(도급의 의의)"
    },
    {
      "id": "clause-0003-0003",
      "original_text": "갑은 산출물 수령 후 7일 이내 검수를 완료한다. 기간 내 이의가 없으면 승인된 것으로 본다.",
      "clause_type": "warranty",
      "risk_level": "low",
      "risk_score": 25,
      "explanation": "검수 기간과 묵시적 승인 조항이 합리적으로 설정되어 있어 대금 지급을 보장하는 장치가 마련되어 있습니다.",
      "suggestion": "현재 조항이 우수합니다. 검수 기준을 별도 문서로 첨부하면 더욱 명확합니다.",
      "relevant_law": "민법 제390조(채무불이행과 손해배상)"
    },
    {
      "id": "clause-0003-0004",
      "original_text": "을의 귀책사유로 인한 손해에 대해서는 계약금액 범위 내에서 배상책임을 진다.",
      "clause_type": "liability",
      "risk_level": "low",
      "risk_score": 35,
      "explanation": "손해배상 책임이 계약금액으로 상한이 제한되어 있어 예측 가능하고 합리적입니다.",
      "suggestion": "현재 조항이 적절합니다. 양 당사자 모두 동일한 상한이 적용되는지 확인하는 것이 좋습니다.",
      "relevant_law": "민법 제398조(손해배상액의 예정)"
    },
    {
      "id": "clause-0003-0005",
      "original_text": "본 용역의 결과물에 대한 저작재산권은 갑에게 귀속되며, 을은 저작인격권을 행사하지 않는다.",
      "clause_type": "intellectual_property",
      "risk_level": "medium",
      "risk_score": 60,
      "explanation": "저작재산권 이전은 합리적이나, 저작인격권 불행사 조항은 법적으로 완전히 포기할 수 없는 권리입니다. 또한 대금 지급 전 권리 이전 시점이 명확하지 않습니다.",
      "suggestion": "''최종 대금 완납 시 저작재산권이 이전된다''로 수정하고, 저작인격권은 ''합리적 범위 내에서 행사하지 않는다''로 완화해야 합니다.",
      "relevant_law": "저작권법 제14조(저작인격권의 일신전속성)"
    },
    {
      "id": "clause-0003-0006",
      "original_text": "일방 당사자의 중대한 계약 위반 시, 상대방은 14일의 시정 기간을 부여한 후 계약을 해지할 수 있다.",
      "clause_type": "termination",
      "risk_level": "low",
      "risk_score": 30,
      "explanation": "계약 해지 조건이 양 당사자에게 동등하게 적용되며, 시정 기회를 부여하는 점이 공정합니다.",
      "suggestion": "현재 조항이 우수합니다. ''중대한 위반''의 구체적 예시를 추가하면 더욱 명확합니다.",
      "relevant_law": "민법 제544조(이행지체와 해제)"
    },
    {
      "id": "clause-0003-0007",
      "original_text": "계약 체결일로부터 3개월로 하며, 양 당사자 합의 시 연장할 수 있다.",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 50,
      "explanation": "용역 기간이 명확하나, 기간 내 완료하지 못한 경우의 책임 소재와 지연 사유가 불명확합니다.",
      "suggestion": "''갑의 사유로 인한 지연 시 기간을 연장하며 추가 비용은 갑이 부담한다''는 조항을 추가해야 합니다.",
      "relevant_law": "민법 제664조(도급의 의의)"
    }
  ]'::jsonb,
  '["지연 지급 시 지연이자 조항을 추가하여 대금 회수를 보장해야 합니다.", "저작재산권 이전 시점을 ''최종 대금 완납 시''로 명확히 하고, 포트폴리오 활용권을 추가해야 합니다.", "업무 범위(특히 ''실행 지원'')를 구체적으로 정의하여 추가 업무 분쟁을 방지해야 합니다."]'::jsonb,
  'service',
  '{"party_a": "(주)글로벌마케팅", "party_b": "박서연"}'::jsonb,
  '["confidentiality", "dispute_resolution"]'::jsonb,
  4120, 2850, 0.031200,
  NOW() - INTERVAL '30 days'
);

-- Analysis 4: User A - Processing status (lease)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, contract_type, created_at
) VALUES (
  'aaaaaaaa-0004-0004-0004-000000000004',
  '11111111-1111-1111-1111-111111111111',
  '임대차계약서_2024.pdf',
  '11111111-1111-1111-1111-111111111111/aaaaaaaa-0004-0004-0004-000000000004.pdf',
  'pdf', 524288,
  '부동산 임대차계약서

제1조 임대인 갑과 임차인 을은 다음 부동산에 관하여 임대차계약을 체결한다.

소재지: 서울특별시 강남구 테헤란로 123, 4층 401호
면적: 전용 33.06㎡ (10평)
용도: 사무실

제2조 (임대차기간) 2024년 4월 1일부터 2026년 3월 31일까지 (2년)
제3조 (임대보증금) 금 3,000만원
제4조 (월 차임) 금 150만원 (매월 25일 선납)',
  6, 'processing', 'lease',
  NOW() - INTERVAL '5 minutes'
);

-- Analysis 5: User B - Failed status
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  status, contract_type, created_at
) VALUES (
  'bbbbbbbb-0005-0005-0005-000000000005',
  '22222222-2222-2222-2222-222222222222',
  'corrupted_file.pdf',
  '22222222-2222-2222-2222-222222222222/bbbbbbbb-0005-0005-0005-000000000005.pdf',
  'pdf', 102400,
  'failed', 'other',
  NOW() - INTERVAL '10 days'
);

-- Analysis 6: User B - Pending payment (employment)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, contract_type, created_at
) VALUES (
  'bbbbbbbb-0006-0006-0006-000000000006',
  '22222222-2222-2222-2222-222222222222',
  '취업규칙_검토.pdf',
  '22222222-2222-2222-2222-222222222222/bbbbbbbb-0006-0006-0006-000000000006.pdf',
  'pdf', 1048576,
  '취업규칙

제1장 총칙
제1조 (목적) 이 규칙은 근로기준법에 따라 주식회사 미래기술의 취업에 관한 사항을 정함을 목적으로 한다.
제2조 (적용범위) 이 규칙은 회사에 근무하는 모든 근로자에게 적용한다.',
  12, 'pending_payment', 'employment',
  NOW() - INTERVAL '2 hours'
);

-- Analysis 7: User A - Paid status (other/joint dev)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, contract_type, created_at
) VALUES (
  'aaaaaaaa-0007-0007-0007-000000000007',
  '11111111-1111-1111-1111-111111111111',
  '공동개발계약서.pdf',
  '11111111-1111-1111-1111-111111111111/aaaaaaaa-0007-0007-0007-000000000007.pdf',
  'pdf', 415000,
  '공동개발계약서

제1조 (목적) 갑과 을은 AI 챗봇 공동 개발에 관한 사항을 정한다.
제2조 (개발비용) 총 개발비용은 각 50%씩 부담한다.
제3조 (지적재산권) 공동 개발 결과물의 지적재산권은 각 50%의 지분으로 공동 소유한다.',
  4, 'paid', 'other',
  NOW() - INTERVAL '1 hour'
);

-- Analysis 8: User C - Completed employment contract (MEDIUM risk, 68)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'cccccccc-0008-0008-0008-000000000008',
  '33333333-3333-3333-3333-333333333333',
  '근로계약서_신입사원.pdf',
  '33333333-3333-3333-3333-333333333333/cccccccc-0008-0008-0008-000000000008.pdf',
  'pdf', 287000,
  '근로계약서

회사(이하 "갑")와 근로자(이하 "을")는 다음과 같이 근로계약을 체결한다.

제1조 (근로계약기간) 2024년 3월 1일부터 2025년 2월 28일까지 (1년, 자동 갱신되지 않음)

제2조 (근무장소 및 업무내용)
- 근무장소: 서울시 강남구 본사 및 회사가 지정하는 장소
- 업무내용: 소프트웨어 개발 및 회사가 지시하는 기타 업무

제3조 (근로시간) 주 5일, 1일 8시간을 원칙으로 하되, 업무상 필요 시 연장근로를 할 수 있다.

제4조 (임금)
- 기본급: 월 250만원
- 상여금: 회사 실적에 따라 지급할 수 있음 (지급 여부 및 금액은 회사 재량)
- 연장근로수당: 기본급에 포함된 것으로 본다.

제5조 (경업금지) 을은 재직 중은 물론 퇴직 후 2년간 동종 업계에 취업하거나 유사 사업을 영위할 수 없다.

제6조 (손해배상) 을의 고의 또는 과실로 인한 회사의 손해는 전액 배상하여야 한다.

제7조 (계약해지)
- 회사는 을이 다음 각 호에 해당하는 경우 즉시 해고할 수 있다:
  1. 업무 성과가 현저히 부진한 경우
  2. 회사 명예를 훼손한 경우
  3. 기타 회사가 부적격하다고 판단한 경우

갑: (주)테크솔루션
을: 이지우',
  3, 'completed', 'medium', 68,
  '본 근로계약서는 여러 조항에서 근로기준법 위반 소지가 있으며, 근로자에게 상당히 불리한 내용을 포함하고 있습니다. 특히 포괄임금제(연장근로수당 기본급 포함), 과도한 경업금지(퇴직 후 2년), 무제한 손해배상, 추상적 해고사유 등이 주요 위험 요소입니다. 비밀유지, 지적재산권, 분쟁해결 조항이 누락되어 있어 보완이 필요합니다.',
  '[
    {
      "id": "clause-0008-0001",
      "original_text": "기본급: 월 250만원, 상여금: 회사 실적에 따라 지급할 수 있음 (지급 여부 및 금액은 회사 재량), 연장근로수당: 기본급에 포함된 것으로 본다.",
      "clause_type": "payment_terms",
      "risk_level": "high",
      "risk_score": 80,
      "explanation": "연장근로수당을 기본급에 포함한다는 조항은 근로기준법 위반 소지가 큽니다. 실제 연장근로 시간과 무관하게 고정 급여만 지급하는 것은 불법입니다. 상여금도 회사 재량으로만 규정되어 지급 기준이 불명확합니다.",
      "suggestion": "연장근로수당은 실제 연장근로 발생 시 근로기준법에 따라 별도 지급되어야 합니다. 상여금 지급 기준을 명시해야 합니다.",
      "relevant_law": "근로기준법 제56조(연장·야간 및 휴일 근로)"
    },
    {
      "id": "clause-0008-0002",
      "original_text": "업무내용: 소프트웨어 개발 및 회사가 지시하는 기타 업무",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 55,
      "explanation": "업무 범위가 ''회사가 지시하는 기타 업무''로 포괄적으로 규정되어 전혀 관련 없는 업무까지 강제될 수 있습니다.",
      "suggestion": "업무 내용을 구체적으로 명시하고, ''기타 업무''는 ''본 업무와 관련된 부수적 업무''로 제한해야 합니다.",
      "relevant_law": "근로기준법 제17조(근로조건의 명시)"
    },
    {
      "id": "clause-0008-0003",
      "original_text": "을은 재직 중은 물론 퇴직 후 2년간 동종 업계에 취업하거나 유사 사업을 영위할 수 없다.",
      "clause_type": "termination",
      "risk_level": "high",
      "risk_score": 85,
      "explanation": "퇴직 후 2년간 경업금지는 지나치게 과도하며, 헌법상 직업선택의 자유를 침해할 소지가 큽니다. 판례상 경업금지는 보호할 이익, 합리적 기간·지역·직종, 대가 지급이 있어야 유효합니다.",
      "suggestion": "경업금지는 핵심 영업비밀 접근자에 한정하고, 기간은 6개월~1년 이내로 제한하며, 합리적 대가를 지급해야 합니다.",
      "relevant_law": "헌법 제15조(직업선택의 자유), 대법원 2020다231568 판결"
    },
    {
      "id": "clause-0008-0004",
      "original_text": "을의 고의 또는 과실로 인한 회사의 손해는 전액 배상하여야 한다.",
      "clause_type": "liability",
      "risk_level": "high",
      "risk_score": 75,
      "explanation": "''전액 배상'' 조항은 근로자에게 지나치게 가혹합니다. 판례는 경과실의 경우 사용자의 위험 부담 원칙상 근로자에게 전액 배상을 청구할 수 없다고 봅니다.",
      "suggestion": "''을의 고의 또는 중대한 과실로 인한 손해에 한하여 배상 책임을 진다''로 수정해야 합니다.",
      "relevant_law": "민법 제756조(사용자의 배상책임)"
    },
    {
      "id": "clause-0008-0005",
      "original_text": "회사는 을이 다음 각 호에 해당하는 경우 즉시 해고할 수 있다: 1. 업무 성과가 현저히 부진한 경우 2. 회사 명예를 훼손한 경우 3. 기타 회사가 부적격하다고 판단한 경우",
      "clause_type": "termination",
      "risk_level": "high",
      "risk_score": 80,
      "explanation": "해고 사유가 지나치게 추상적이고 포괄적입니다. 특히 3호 ''회사가 부적격하다고 판단한 경우''는 사실상 자의적 해고를 허용하는 조항입니다.",
      "suggestion": "해고는 근로기준법 제23조의 ''정당한 이유''가 있어야 합니다. 구체적인 해고 사유를 명시하고, 3호는 삭제해야 합니다.",
      "relevant_law": "근로기준법 제23조(해고 등의 제한)"
    },
    {
      "id": "clause-0008-0006",
      "original_text": "2024년 3월 1일부터 2025년 2월 28일까지 (1년, 자동 갱신되지 않음)",
      "clause_type": "termination",
      "risk_level": "medium",
      "risk_score": 60,
      "explanation": "기간제 근로계약이지만 ''자동 갱신되지 않음''이라는 문구는 근로자에게 불안정성을 가중시킵니다.",
      "suggestion": "정규직 전환 기준을 명시하거나, 계약 갱신 시 근로자에게 불리하지 않은 조건을 보장하는 조항을 추가해야 합니다.",
      "relevant_law": "기간제 및 단시간근로자 보호 등에 관한 법률 제4조"
    },
    {
      "id": "clause-0008-0007",
      "original_text": "주 5일, 1일 8시간을 원칙으로 하되, 업무상 필요 시 연장근로를 할 수 있다.",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 50,
      "explanation": "연장근로 가능성을 명시했으나, 한도나 근로자 동의 절차가 없습니다. 근로기준법상 주 12시간을 초과하는 연장근로는 불가합니다.",
      "suggestion": "''주 최대 12시간 이내의 연장근로는 근로자 동의 하에 가능하다''로 수정해야 합니다.",
      "relevant_law": "근로기준법 제53조(연장 근로의 제한)"
    }
  ]'::jsonb,
  '["연장근로수당 포괄임금제 조항을 삭제하고 근로기준법에 따른 별도 지급 조항을 추가해야 합니다.", "경업금지 조항을 대폭 완화(기간 단축, 대가 지급)하거나 삭제해야 합니다.", "해고 사유를 구체화하고 추상적·포괄적 조항(3호)을 삭제해야 합니다.", "손해배상 조항을 ''중대한 과실''로 제한하고 경과실 면책 조항을 추가해야 합니다."]'::jsonb,
  'employment',
  '{"party_a": "(주)테크솔루션", "party_b": "이지우"}'::jsonb,
  '["confidentiality", "intellectual_property", "dispute_resolution"]'::jsonb,
  3580, 2640, 0.028100,
  NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================

-- Payment for Analysis 1 (User A - Completed freelance, 6+ pages → 5900)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000001-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'cg-1704067200-a1b2c3d4',
  5900,
  'tpk_test_20240101_a1b2c3d4e5f6g7h8',
  'done', 'card',
  NOW() - INTERVAL '85 days',
  NOW() - INTERVAL '85 days'
);

-- Payment for Analysis 2 (User A - Completed NDA, ≤5 pages → 3900)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000002-0002-0002-0002-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0002-0002-0002-000000000002',
  'cg-1709251200-x9y8z7w6',
  3900,
  'tpk_test_20240301_x9y8z7w6v5u4',
  'done', 'kakaopay',
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '60 days'
);

-- Payment for Analysis 3 (User B - Completed service, 5 pages → 3900)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000003-0003-0003-0003-000000000003',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-0003-0003-0003-000000000003',
  'cg-1711929600-p1q2r3s4',
  3900,
  'tpk_test_20240401_p1q2r3s4t5u6',
  'done', 'tosspay',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
);

-- Payment for Analysis 4 (User A - Processing lease, paid)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000004-0004-0004-0004-000000000004',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0004-0004-0004-000000000004',
  'cg-1713715200-q4r5s6t7',
  5900,
  'tpk_test_20240422_q4r5s6t7u8v9',
  'done', 'card',
  NOW() - INTERVAL '5 minutes',
  NOW() - INTERVAL '6 minutes'
);

-- Payment for Analysis 7 (User A - Paid, pending analysis)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000007-0007-0007-0007-000000000007',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0007-0007-0007-000000000007',
  'cg-1713715200-m5n6o7p8',
  5900,
  'tpk_test_20240422_m5n6o7p8q9r0',
  'done', 'card',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '1 hour'
);

-- Payment for Analysis 8 (User C - Completed employment, ≤5 pages → 3900)
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES (
  'aa000008-0008-0008-0008-000000000008',
  '33333333-3333-3333-3333-333333333333',
  'cccccccc-0008-0008-0008-000000000008',
  'cg-1713542400-k1l2m3n4',
  3900,
  'tpk_test_20240420_k1l2m3n4o5p6',
  'done', 'kakaopay',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- CONSENT LOGS
-- ============================================================================

INSERT INTO consent_logs (
  id, user_id, analysis_id, consent_type, consent_version,
  ip_address, user_agent, consented_at
) VALUES
(
  'c0000001-0001-0001-0001-000000000001',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'ai_disclaimer', 'v1.0',
  '211.234.123.45',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '85 days'
),
(
  'c0000002-0002-0002-0002-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0001-0001-0001-000000000001',
  'privacy_policy', 'v1.0',
  '211.234.123.45',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '85 days'
),
(
  'c0000003-0003-0003-0003-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0002-0002-0002-000000000002',
  'ai_disclaimer', 'v1.0',
  '211.234.123.45',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '60 days'
),
(
  'c0000004-0004-0004-0004-000000000004',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-0003-0003-0003-000000000003',
  'ai_disclaimer', 'v1.0',
  '121.145.67.89',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
  NOW() - INTERVAL '30 days'
),
(
  'c0000005-0005-0005-0005-000000000005',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-0003-0003-0003-000000000003',
  'privacy_policy', 'v1.0',
  '121.145.67.89',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
  NOW() - INTERVAL '30 days'
),
(
  'c0000006-0006-0006-0006-000000000006',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0004-0004-0004-000000000004',
  'ai_disclaimer', 'v1.0',
  '211.234.123.45',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '5 minutes'
),
(
  'c0000007-0007-0007-0007-000000000007',
  '22222222-2222-2222-2222-222222222222',
  'bbbbbbbb-0006-0006-0006-000000000006',
  'ai_disclaimer', 'v1.0',
  '121.145.67.89',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0',
  NOW() - INTERVAL '2 hours'
),
(
  'c0000008-0008-0008-0008-000000000008',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-0007-0007-0007-000000000007',
  'ai_disclaimer', 'v1.0',
  '211.234.123.45',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '1 hour'
),
(
  'c0000009-0009-0009-0009-000000000009',
  '33333333-3333-3333-3333-333333333333',
  'cccccccc-0008-0008-0008-000000000008',
  'ai_disclaimer', 'v1.0',
  '203.142.88.12',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) Safari/604.1',
  NOW() - INTERVAL '3 days'
),
(
  'c0000010-0010-0010-0010-000000000010',
  '33333333-3333-3333-3333-333333333333',
  'cccccccc-0008-0008-0008-000000000008',
  'privacy_policy', 'v1.0',
  '203.142.88.12',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) Safari/604.1',
  NOW() - INTERVAL '3 days'
);

-- ============================================================================
-- TEST ACCOUNT DATA (test@test.com / test1234)
-- ============================================================================

-- Test Analysis 1: Completed freelance contract (HIGH RISK, 75)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'dddddddd-0001-0001-0001-000000000001',
  '44444444-4444-4444-4444-444444444444',
  '웹개발_외주계약서.pdf',
  '44444444-4444-4444-4444-444444444444/dddddddd-0001-0001-0001-000000000001.pdf',
  'pdf', 356000,
  '외주 개발 계약서

제1조 (목적) 본 계약은 갑이 을에게 위탁하는 웹 애플리케이션 개발 용역에 관한 사항을 정한다.

제2조 (계약기간) 2024년 6월 1일부터 2024년 8월 31일까지 (3개월)

제3조 (계약금액) 총 1,500만원. 완료 후 일시 지급한다.

제4조 (지식재산권) 용역 결과물 일체의 권리는 갑에게 귀속된다. 을은 결과물을 어떠한 목적으로도 사용할 수 없다.

제5조 (하자보수) 을은 검수 완료 후 1년간 무상으로 하자를 보수하여야 한다.

제6조 (지체상금) 을의 사유로 납기가 지연될 경우 지연일수 x 계약금액의 0.5%를 지체상금으로 갑에게 지급한다.

제7조 (해지) 갑은 을의 업무 수행 능력이 부족하다고 판단될 경우 즉시 계약을 해지할 수 있으며, 이 경우 기 지급된 금원은 반환하지 않는다.

갑: (주)디지털웍스
을: 테스트계정',
  4, 'completed', 'high', 75,
  '본 외주 개발 계약서는 발주자(갑)에게 크게 유리한 불균형 계약입니다. 대금 완료 후 일시 지급, 무제한 지식재산권 양도, 과도한 하자보수 기간(1년), 일방적 해지권 등이 프리랜서에게 상당한 위험을 초래합니다. 분쟁해결 조항이 누락되어 있고, 비밀유지 의무도 정의되어 있지 않습니다.',
  '[
    {
      "id": "clause-t001-0001",
      "original_text": "총 1,500만원. 완료 후 일시 지급한다.",
      "clause_type": "payment_terms",
      "risk_level": "high",
      "risk_score": 90,
      "explanation": "3개월간의 용역 대금을 완료 후 일시 지급하는 것은 프리랜서에게 매우 불리합니다. 작업 기간 동안 수입이 전혀 없고, 납품 후 검수 분쟁 시 대금 전체를 받지 못할 위험이 큽니다.",
      "suggestion": "착수금 30%, 중간금 30%, 잔금 40% 등 단계별 지급 조건으로 변경하고, 검수 완료 후 14일 이내 지급 등 기한을 명시해야 합니다.",
      "relevant_law": "하도급거래 공정화에 관한 법률 제13조(하도급대금의 지급)"
    },
    {
      "id": "clause-t001-0002",
      "original_text": "용역 결과물 일체의 권리는 갑에게 귀속된다. 을은 결과물을 어떠한 목적으로도 사용할 수 없다.",
      "clause_type": "intellectual_property",
      "risk_level": "high",
      "risk_score": 82,
      "explanation": "결과물을 어떠한 목적으로도 사용할 수 없다는 조항은 포트폴리오 활용까지 제한하는 과도한 규정입니다. 대금 완납 전에도 권리가 이전되어 분쟁 시 보호받기 어렵습니다.",
      "suggestion": "''대금 완납 시 저작재산권이 이전된다''로 수정하고, ''을은 비상업적 포트폴리오 목적으로 결과물을 활용할 수 있다''는 조항을 추가해야 합니다.",
      "relevant_law": "저작권법 제45조(저작재산권의 양도)"
    },
    {
      "id": "clause-t001-0003",
      "original_text": "을은 검수 완료 후 1년간 무상으로 하자를 보수하여야 한다.",
      "clause_type": "warranty",
      "risk_level": "high",
      "risk_score": 78,
      "explanation": "1년 무상 하자보수는 소프트웨어 외주 계약에서 과도한 기간입니다. 일반적으로 3~6개월이 적정하며, ''하자''의 범위가 정의되지 않아 기능 추가 요청까지 하자로 주장할 수 있습니다.",
      "suggestion": "하자보수 기간을 3개월로 단축하고, 하자의 범위를 ''검수 시 합의된 사양 기준의 버그''로 한정해야 합니다. 기능 추가나 변경 요청은 별도 계약으로 처리해야 합니다.",
      "relevant_law": "민법 제667조(수급인의 담보책임)"
    },
    {
      "id": "clause-t001-0004",
      "original_text": "을의 사유로 납기가 지연될 경우 지연일수 x 계약금액의 0.5%를 지체상금으로 갑에게 지급한다.",
      "clause_type": "liability",
      "risk_level": "medium",
      "risk_score": 55,
      "explanation": "일 0.5% 지체상금율은 다소 높은 편이나 일반적인 범위 내입니다. 다만 갑의 사유로 인한 지연(요구사항 변경, 피드백 지연 등)에 대한 면책 조항이 없어 부당한 불이익을 받을 수 있습니다.",
      "suggestion": "지체상금 상한(예: 계약금액의 10%)을 설정하고, ''갑의 사유로 인한 지연은 지체상금에서 제외한다''는 면책 조항을 추가해야 합니다.",
      "relevant_law": "민법 제398조(손해배상액의 예정)"
    },
    {
      "id": "clause-t001-0005",
      "original_text": "갑은 을의 업무 수행 능력이 부족하다고 판단될 경우 즉시 계약을 해지할 수 있으며, 이 경우 기 지급된 금원은 반환하지 않는다.",
      "clause_type": "termination",
      "risk_level": "high",
      "risk_score": 88,
      "explanation": "''업무 수행 능력이 부족하다고 판단''이라는 주관적 기준으로 즉시 해지가 가능하고, 기 수행한 업무에 대한 대금도 보장되지 않습니다. 사실상 갑의 자의적 해지를 허용하는 독소 조항입니다.",
      "suggestion": "해지 사유를 구체적으로 명시하고(예: 2회 이상 시정 요청 불이행), 시정 기회(14일)를 부여해야 합니다. 해지 시에도 기 수행 업무에 대한 대금은 정산하는 조항이 필요합니다.",
      "relevant_law": "민법 제673조(도급인의 해제권), 하도급법 제8조(부당한 하도급대금의 결정 금지)"
    }
  ]'::jsonb,
  '["대금 지급을 단계별(착수금/중간금/잔금)로 변경하여 프리랜서의 현금 흐름을 보장해야 합니다.", "하자보수 기간을 3개월로 단축하고 하자의 범위를 명확히 정의해야 합니다.", "계약 해지 시 기 수행 업무 대금 정산 조항을 반드시 추가해야 합니다.", "분쟁 해결 방법(관할 법원 또는 중재)을 명시해야 합니다."]'::jsonb,
  'freelance',
  '{"party_a": "(주)디지털웍스", "party_b": "테스트계정"}'::jsonb,
  '["confidentiality", "scope_of_work", "dispute_resolution"]'::jsonb,
  3100, 2350, 0.025400,
  NOW() - INTERVAL '20 days'
);

-- Test Analysis 2: Completed NDA (LOW RISK, 22)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'dddddddd-0002-0002-0002-000000000002',
  '44444444-4444-4444-4444-444444444444',
  '상호_비밀유지계약서.pdf',
  '44444444-4444-4444-4444-444444444444/dddddddd-0002-0002-0002-000000000002.pdf',
  'pdf', 178000,
  '상호 비밀유지 계약서

제1조 (목적) 양 당사자는 협업 프로젝트 검토를 위해 교환하는 비밀정보를 상호 보호한다.

제2조 (비밀정보) 서면으로 ''비밀''이라 표시된 정보에 한하며, 공개정보·독자개발정보·법원명령 정보는 제외한다.

제3조 (의무) 수령자는 자사 정보와 동일한 수준의 주의로 비밀을 유지하되, 업무 목적 외 사용을 금한다.

제4조 (기간) 계약일로부터 2년, 종료 후 비밀유지 의무 2년 존속.

제5조 (반환) 계약 종료 시 30일 이내 비밀정보를 반환 또는 폐기하고 확인서를 제출한다.

제6조 (배상) 위반 시 직접손해에 한하여 배상하며, 상한은 1억원으로 한다.

제7조 (관할) 서울중앙지방법원을 전속관할로 한다.

갑: (주)스마트솔루션
을: 테스트계정',
  2, 'completed', 'low', 22,
  '본 상호 비밀유지계약서는 양 당사자에게 균형 잡힌 우수한 계약서입니다. 비밀정보의 범위가 서면 표시 기준으로 명확하고, 합리적 예외사항·기간 설정·손해배상 상한·관할법원이 모두 적절히 규정되어 있습니다.',
  '[
    {
      "id": "clause-t002-0001",
      "original_text": "서면으로 ''비밀''이라 표시된 정보에 한하며, 공개정보·독자개발정보·법원명령 정보는 제외한다.",
      "clause_type": "confidentiality",
      "risk_level": "low",
      "risk_score": 15,
      "explanation": "비밀정보의 범위가 서면 표시로 한정되어 있어 매우 명확합니다. 예외 사항도 표준적입니다.",
      "suggestion": "현재 조항이 우수합니다. 구두 정보도 포함하려면 ''구두 공개 후 7일 이내 서면으로 확인한 정보''를 추가할 수 있습니다.",
      "relevant_law": "부정경쟁방지 및 영업비밀보호에 관한 법률 제2조(정의)"
    },
    {
      "id": "clause-t002-0002",
      "original_text": "수령자는 자사 정보와 동일한 수준의 주의로 비밀을 유지하되, 업무 목적 외 사용을 금한다.",
      "clause_type": "confidentiality",
      "risk_level": "low",
      "risk_score": 20,
      "explanation": "주의의무 기준이 ''자사 정보와 동일한 수준''으로 합리적이며, 목적 외 사용 금지도 적절합니다.",
      "suggestion": "현재 조항이 적절합니다.",
      "relevant_law": "민법 제681조(수임인의 선관주의의무)"
    },
    {
      "id": "clause-t002-0003",
      "original_text": "위반 시 직접손해에 한하여 배상하며, 상한은 1억원으로 한다.",
      "clause_type": "liability",
      "risk_level": "low",
      "risk_score": 25,
      "explanation": "손해배상이 직접손해로 한정되고 상한액이 명시되어 있어 위험이 예측 가능합니다.",
      "suggestion": "현재 조항이 우수합니다.",
      "relevant_law": "민법 제393조(손해배상의 범위)"
    },
    {
      "id": "clause-t002-0004",
      "original_text": "서울중앙지방법원을 전속관할로 한다.",
      "clause_type": "dispute_resolution",
      "risk_level": "low",
      "risk_score": 30,
      "explanation": "전속관할이 명확히 지정되어 분쟁 발생 시 절차적 안정성이 높습니다.",
      "suggestion": "필요시 중재 조항을 추가할 수 있습니다.",
      "relevant_law": "민사소송법 제28조(관할의 합의)"
    }
  ]'::jsonb,
  '["전반적으로 우수한 NDA입니다. 필요시 구두 비밀정보의 서면 확인 절차를 추가할 수 있습니다."]'::jsonb,
  'nda',
  '{"party_a": "(주)스마트솔루션", "party_b": "테스트계정"}'::jsonb,
  '[]'::jsonb,
  2200, 1580, 0.016800,
  NOW() - INTERVAL '15 days'
);

-- Test Analysis 3: Completed employment contract (MEDIUM RISK, 62)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, overall_risk_level, overall_risk_score,
  summary, clauses, improvements, contract_type, contract_parties,
  missing_clauses, input_tokens, output_tokens, api_cost_usd, created_at
) VALUES (
  'dddddddd-0003-0003-0003-000000000003',
  '44444444-4444-4444-4444-444444444444',
  '근로계약서_중소기업.pdf',
  '44444444-4444-4444-4444-444444444444/dddddddd-0003-0003-0003-000000000003.pdf',
  'pdf', 298000,
  '근로계약서

제1조 (계약기간) 2024년 7월 1일 ~ 2025년 6월 30일 (1년, 평가 후 갱신 가능)

제2조 (업무) 백엔드 개발 및 관련 업무

제3조 (근로시간) 주 5일, 09:00~18:00 (휴게 1시간 포함). 업무 필요시 연장근로 가능.

제4조 (임금) 월 350만원 (식대 포함, 4대보험 공제 전). 연장근로수당은 월 20시간분 포함.

제5조 (휴가) 근로기준법에 따른 연차유급휴가 부여.

제6조 (퇴직) 자발적 퇴직 시 30일 전 서면 통보.

갑: (주)클라우드테크
을: 테스트계정',
  3, 'completed', 'medium', 62,
  '본 근로계약서는 기본적인 근로조건을 갖추고 있으나, 포괄임금제(연장근로수당 20시간분 포함) 조항에 주의가 필요합니다. 업무 범위와 평가 기준이 불명확하며, 비밀유지·지적재산권·분쟁해결 조항이 누락되어 있습니다.',
  '[
    {
      "id": "clause-t003-0001",
      "original_text": "월 350만원 (식대 포함, 4대보험 공제 전). 연장근로수당은 월 20시간분 포함.",
      "clause_type": "payment_terms",
      "risk_level": "high",
      "risk_score": 72,
      "explanation": "포괄임금제로 연장근로수당 20시간분이 포함되어 있으나, 실제 연장근로가 20시간을 초과하면 추가 수당을 받을 수 없는 구조입니다. 판례상 포괄임금제는 엄격한 요건 하에서만 유효합니다.",
      "suggestion": "포괄임금 부분의 기본급과 연장수당 금액을 각각 명시하고, 20시간 초과분은 별도 지급한다는 조항을 추가해야 합니다.",
      "relevant_law": "근로기준법 제56조(연장·야간 및 휴일 근로)"
    },
    {
      "id": "clause-t003-0002",
      "original_text": "백엔드 개발 및 관련 업무",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 50,
      "explanation": "''관련 업무''의 범위가 불명확하여 본래 직무와 무관한 업무를 지시받을 수 있습니다.",
      "suggestion": "''백엔드 API 개발, 데이터베이스 설계 및 이와 직접 관련된 부수 업무''로 구체화해야 합니다.",
      "relevant_law": "근로기준법 제17조(근로조건의 명시)"
    },
    {
      "id": "clause-t003-0003",
      "original_text": "업무 필요시 연장근로 가능.",
      "clause_type": "scope_of_work",
      "risk_level": "medium",
      "risk_score": 55,
      "explanation": "연장근로 한도와 근로자 동의 절차가 명시되지 않았습니다.",
      "suggestion": "''주 12시간 이내 연장근로는 근로자 동의 하에 가능하다''로 수정해야 합니다.",
      "relevant_law": "근로기준법 제53조(연장 근로의 제한)"
    },
    {
      "id": "clause-t003-0004",
      "original_text": "2024년 7월 1일 ~ 2025년 6월 30일 (1년, 평가 후 갱신 가능)",
      "clause_type": "termination",
      "risk_level": "medium",
      "risk_score": 58,
      "explanation": "''평가 후 갱신 가능''이라는 문구는 갱신 기대권을 인정하기 어렵고 평가 기준도 불명확합니다.",
      "suggestion": "갱신 평가 기준을 구체적으로 명시하고, 비갱신 시 30일 전 사전 통보 의무를 추가해야 합니다.",
      "relevant_law": "기간제 및 단시간근로자 보호 등에 관한 법률 제4조"
    }
  ]'::jsonb,
  '["포괄임금제 조항에서 기본급과 연장수당을 분리 명시하고 초과분 별도 지급을 보장해야 합니다.", "업무 범위를 구체적으로 한정하여 직무 외 업무 지시를 방지해야 합니다.", "갱신 평가 기준과 비갱신 통보 절차를 명확히 해야 합니다."]'::jsonb,
  'employment',
  '{"party_a": "(주)클라우드테크", "party_b": "테스트계정"}'::jsonb,
  '["confidentiality", "intellectual_property", "liability", "dispute_resolution"]'::jsonb,
  2800, 2100, 0.022500,
  NOW() - INTERVAL '7 days'
);

-- Test Analysis 4: Pending payment (service)
INSERT INTO analyses (
  id, user_id, original_filename, file_path, file_type, file_size_bytes,
  extracted_text, page_count, status, contract_type, created_at
) VALUES (
  'dddddddd-0004-0004-0004-000000000004',
  '44444444-4444-4444-4444-444444444444',
  '디자인_용역계약서.pdf',
  '44444444-4444-4444-4444-444444444444/dddddddd-0004-0004-0004-000000000004.pdf',
  'pdf', 267000,
  'UI/UX 디자인 용역 계약서

제1조 (목적) 모바일 앱 UI/UX 디자인 용역에 관한 계약을 체결한다.
제2조 (금액) 총 800만원
제3조 (기간) 2개월',
  3, 'pending_payment', 'service',
  NOW() - INTERVAL '1 hour'
);

-- Test Payments
INSERT INTO payments (
  id, user_id, analysis_id, order_id, amount,
  payment_key, status, method, approved_at, created_at
) VALUES
(
  'ee000001-0001-0001-0001-000000000001',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0001-0001-0001-000000000001',
  'cg-1718000000-t1a2b3c4',
  3900,
  'tpk_test_20240610_t1a2b3c4d5e6',
  'done', 'card',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  'ee000002-0002-0002-0002-000000000002',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0002-0002-0002-000000000002',
  'cg-1718500000-t5f6g7h8',
  3900,
  'tpk_test_20240615_t5f6g7h8i9j0',
  'done', 'kakaopay',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),
(
  'ee000003-0003-0003-0003-000000000003',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0003-0003-0003-000000000003',
  'cg-1719000000-t9k0l1m2',
  3900,
  'tpk_test_20240622_t9k0l1m2n3o4',
  'done', 'tosspay',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
);

-- Test Consent Logs
INSERT INTO consent_logs (
  id, user_id, analysis_id, consent_type, consent_version,
  ip_address, user_agent, consented_at
) VALUES
(
  'c0000011-0011-0011-0011-000000000011',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0001-0001-0001-000000000001',
  'ai_disclaimer', 'v1.0',
  '127.0.0.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '20 days'
),
(
  'c0000012-0012-0012-0012-000000000012',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0001-0001-0001-000000000001',
  'privacy_policy', 'v1.0',
  '127.0.0.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '20 days'
),
(
  'c0000013-0013-0013-0013-000000000013',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0002-0002-0002-000000000002',
  'ai_disclaimer', 'v1.0',
  '127.0.0.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '15 days'
),
(
  'c0000014-0014-0014-0014-000000000014',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0003-0003-0003-000000000003',
  'ai_disclaimer', 'v1.0',
  '127.0.0.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '7 days'
),
(
  'c0000015-0015-0015-0015-000000000015',
  '44444444-4444-4444-4444-444444444444',
  'dddddddd-0004-0004-0004-000000000004',
  'ai_disclaimer', 'v1.0',
  '127.0.0.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  NOW() - INTERVAL '1 hour'
);

-- ============================================================================
-- VERIFICATION QUERIES (run manually to check seed data)
-- ============================================================================

-- SELECT 'Users' as t, email, raw_user_meta_data->>'full_name' as name
-- FROM auth.users WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');

-- SELECT 'Profiles' as t, id, email, display_name, free_analyses_remaining
-- FROM profiles WHERE id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333');

-- SELECT 'Analyses' as t, original_filename, contract_type, status, overall_risk_level, overall_risk_score
-- FROM analyses WHERE user_id IN ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222','33333333-3333-3333-3333-333333333333')
-- ORDER BY created_at;

-- SELECT 'Payments' as t, p.order_id, p.amount, p.status, p.method, a.original_filename
-- FROM payments p JOIN analyses a ON p.analysis_id = a.id
-- ORDER BY p.created_at;

-- SELECT 'Consents' as t, consent_type, consent_version, user_id, consented_at
-- FROM consent_logs ORDER BY consented_at;
