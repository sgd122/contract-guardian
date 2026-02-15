import { Header } from "@/widgets/header";
import { Footer } from "@/widgets/footer";

export function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold">개인정보처리방침</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              최종 수정일: 2026년 2월 1일
            </p>

            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  1. 수집하는 개인정보 항목
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    필수 항목: 이메일 주소, OAuth 프로필 정보(이름, 프로필
                    사진)
                  </li>
                  <li>자동 수집: 서비스 이용 기록, 접속 로그</li>
                  <li>
                    업로드 파일: 분석을 위해 업로드한 계약서 파일
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  2. 개인정보의 수집 및 이용 목적
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>서비스 제공 및 계약 이행</li>
                  <li>이용자 식별 및 인증</li>
                  <li>서비스 개선 및 통계 분석</li>
                  <li>결제 처리 및 환불</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  3. 개인정보의 보유 및 이용 기간
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>회원 정보: 회원 탈퇴 시까지</li>
                  <li>
                    업로드된 계약서: 분석 완료 후 90일 이내 자동 삭제
                  </li>
                  <li>결제 기록: 관련 법령에 따라 5년 보관</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  4. 개인정보의 제3자 제공
                </h2>
                <p className="mt-2">
                  서비스 제공자는 이용자의 개인정보를 제3자에게 제공하지
                  않습니다. 다만, 다음의 경우에는 예외로 합니다:
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>이용자가 사전에 동의한 경우</li>
                  <li>법령에 의해 요구되는 경우</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  5. 개인정보의 처리 위탁
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    AI 분석: Anthropic (Claude API) / Google (Gemini API)
                    - 계약서 텍스트 분석 처리
                  </li>
                  <li>결제 처리: 토스페이먼츠 - 결제 및 환불 처리</li>
                  <li>
                    데이터 저장: Supabase - 데이터베이스 및 파일 저장
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  6. 개인정보의 안전성 확보 조치
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>개인정보 암호화 저장 및 전송</li>
                  <li>접근 권한 관리 및 접근 통제</li>
                  <li>보안 프로그램 설치 및 갱신</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  7. 이용자의 권리
                </h2>
                <p className="mt-2">
                  이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제를
                  요청할 수 있습니다. 계정 삭제 시 관련 개인정보는 즉시
                  파기됩니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  8. 문의처
                </h2>
                <p className="mt-2">
                  개인정보 관련 문의사항이 있으시면 아래 연락처로 문의해
                  주시기 바랍니다.
                </p>
                <p className="mt-2">이메일: support@contract-guardian.kr</p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
