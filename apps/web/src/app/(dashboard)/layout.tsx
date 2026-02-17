import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@cg/api/query-keys";
import { getSession } from "@/shared/api/actions";
import { DashboardLayout } from "@/widgets/layouts";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.auth.session,
    queryFn: getSession,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardLayout>{children}</DashboardLayout>
    </HydrationBoundary>
  );
}
