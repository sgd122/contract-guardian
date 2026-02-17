import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@cg/api/query-keys";
import { getAnalysis } from "@/shared/api/actions";
import { AnalysisResultPage } from "@/_pages/analysis-result";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.analyses.detail(id),
    queryFn: () => getAnalysis(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalysisResultPage params={params} />
    </HydrationBoundary>
  );
}
