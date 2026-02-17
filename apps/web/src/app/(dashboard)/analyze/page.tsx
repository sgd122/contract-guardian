import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@cg/api/query-keys";
import { getAnalysis } from "@/shared/api/actions";
import { AnalyzePage } from "@/_pages/analyze";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string }>;
}) {
  const { resume: resumeId } = await searchParams;
  const queryClient = new QueryClient();

  if (resumeId) {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.analyses.resume(resumeId),
      queryFn: () => getAnalysis(resumeId),
    });
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AnalyzePage />
    </HydrationBoundary>
  );
}
