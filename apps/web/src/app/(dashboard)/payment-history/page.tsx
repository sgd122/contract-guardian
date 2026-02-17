import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { queryKeys } from "@cg/api/query-keys";
import { getPaymentHistory } from "@/shared/api/actions";
import { PaymentHistoryPage } from "@/_pages/payment-history";

export default async function Page() {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.payments.history,
    queryFn: getPaymentHistory,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentHistoryPage />
    </HydrationBoundary>
  );
}
