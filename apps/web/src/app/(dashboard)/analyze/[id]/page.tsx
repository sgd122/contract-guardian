import { AnalysisResultPage } from "@/_pages/analysis-result";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return <AnalysisResultPage params={params} />;
}
