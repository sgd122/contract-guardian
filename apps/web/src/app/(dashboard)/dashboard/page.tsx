import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@cg/api/query-keys";
import { getAnalyses } from "@/shared/api/actions";
import { DashboardPage } from "@/_pages/dashboard";

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.analyses.all,
    queryFn: getAnalyses,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardPage />
    </HydrationBoundary>
  );
}
