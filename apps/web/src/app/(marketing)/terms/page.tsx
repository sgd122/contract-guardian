import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export const metadata = {
  title: "이용약관 - 계약서 지킴이",
  description: "계약서 지킴이 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-20">
          <div className="container max-w-3xl">
            <h1 className="text-3xl font-bold">이용약관</h1>
            <p className="mt-4 text-sm text-muted-foreground">
              최종 수정일: 2026년 2월 1일
            </p>

            <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제1조 (목적)
                </h2>
                <p className="mt-2">
                  본 약관은 계약서 지킴이(이하 &quot;서비스&quot;)의 이용과
                  관련하여 서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을
                  규정하는 것을 목적으로 합니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제2조 (서비스의 내용)
                </h2>
                <p className="mt-2">
                  서비스는 AI 기술을 활용하여 이용자가 업로드한 계약서를
                  분석하고, 위험 요소를 식별하며 수정 방향을 제안합니다. 본
                  서비스의 분석 결과는 참고용이며, 법률 자문을 대체하지
                  않습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제3조 (이용자의 의무)
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>
                    이용자는 본인이 권한을 가진 계약서만 업로드해야 합니다.
                  </li>
                  <li>
                    타인의 개인정보가 포함된 문서를 무단으로 업로드해서는 안
                    됩니다.
                  </li>
                  <li>서비스를 불법적인 목적으로 사용해서는 안 됩니다.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제4조 (서비스 제공자의 책임 제한)
                </h2>
                <p className="mt-2">
                  서비스 제공자는 AI 분석 결과의 정확성이나 완전성을 보장하지
                  않습니다. 분석 결과에 기반한 의사결정으로 인해 발생한 손해에
                  대해 책임을 지지 않습니다. 중요한 계약 체결 시에는 반드시
                  법률 전문가의 자문을 받으시기 바랍니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제5조 (결제 및 환불)
                </h2>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>서비스 이용 요금은 건당 결제 방식입니다.</li>
                  <li>
                    분석이 시작되기 전에는 전액 환불이 가능합니다.
                  </li>
                  <li>
                    분석이 시작된 이후에는 시스템 오류로 결과를 제공하지 못한
                    경우에만 환불해 드립니다.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제6조 (데이터 보관 및 삭제)
                </h2>
                <p className="mt-2">
                  업로드된 계약서는 암호화되어 저장되며, 분석 완료 후 90일
                  이내에 자동 삭제됩니다. 이용자는 언제든지 자신의 데이터
                  삭제를 요청할 수 있습니다.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground">
                  제7조 (약관의 변경)
                </h2>
                <p className="mt-2">
                  서비스 제공자는 필요한 경우 본 약관을 변경할 수 있으며, 변경
                  사항은 서비스 내 공지를 통해 알려드립니다.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
