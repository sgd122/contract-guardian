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
              최종 수정일: 2026년 2월 16일
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
                  5. 개인정보의 처리 위탁 및 국외 이전
                </h2>
                <p className="mt-2">
                  서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하고
                  있으며, 일부 수탁사는 국외에 소재합니다.
                </p>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full border-collapse text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 pr-3 text-left font-medium text-foreground">수탁사</th>
                        <th className="py-2 pr-3 text-left font-medium text-foreground">소재국</th>
                        <th className="py-2 pr-3 text-left font-medium text-foreground">이전 항목</th>
                        <th className="py-2 pr-3 text-left font-medium text-foreground">목적</th>
                        <th className="py-2 text-left font-medium text-foreground">보호 조치</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 pr-3">Anthropic (Claude API)</td>
                        <td className="py-2 pr-3">미국</td>
                        <td className="py-2 pr-3">계약서 텍스트</td>
                        <td className="py-2 pr-3">AI 분석</td>
                        <td className="py-2">API 전송 시 TLS 암호화, 분석 후 미보관</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-3">Google (Gemini API)</td>
                        <td className="py-2 pr-3">미국</td>
                        <td className="py-2 pr-3">계약서 텍스트</td>
                        <td className="py-2 pr-3">AI 분석 (대체)</td>
                        <td className="py-2">API 전송 시 TLS 암호화, 분석 후 미보관</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 pr-3">Supabase (AWS)</td>
                        <td className="py-2 pr-3">대한민국 (ap-northeast-2)</td>
                        <td className="py-2 pr-3">모든 서비스 데이터</td>
                        <td className="py-2 pr-3">데이터베이스, 파일 저장, 인증</td>
                        <td className="py-2">AES-256 암호화, RLS 접근 통제</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3">토스페이먼츠</td>
                        <td className="py-2 pr-3">대한민국</td>
                        <td className="py-2 pr-3">결제 정보 (금액, 주문번호)</td>
                        <td className="py-2 pr-3">결제 및 환불 처리</td>
                        <td className="py-2">PCI DSS 인증, HMAC 서명 검증</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
                  8. 개인정보보호책임자
                </h2>
                <p className="mt-2">
                  개인정보보호법 제31조에 따라 개인정보보호책임자를 다음과
                  같이 지정합니다.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>직책: 대표자 (개인정보보호책임자 겸임)</li>
                  <li>문의: <a href="/help" className="text-primary hover:underline">문의하기 페이지</a></li>
                </ul>
                <p className="mt-2">
                  개인정보 열람, 수정, 삭제 요청 및 기타 문의사항은
                  문의하기 페이지를 통해 연락해 주시기 바랍니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  9. 개인정보의 파기 절차 및 방법
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    업로드된 계약서 및 분석 결과: 분석 완료 후 90일 경과
                    시 자동 삭제 (데이터베이스 기록 및 저장소 파일 일괄
                    삭제)
                  </li>
                  <li>
                    회원 탈퇴: 탈퇴 즉시 계정 정보, 분석 기록, 저장
                    파일을 복구 불가능한 방법으로 파기
                  </li>
                  <li>
                    결제 기록: 전자상거래법에 따라 5년 보관 후 파기
                  </li>
                  <li>
                    접근 로그: 개인정보보호법 시행령에 따라 최소 6개월
                    보관 후 파기
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
