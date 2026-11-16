import { CustomerOrderStatus } from "@/features/operational/customer-order-status";

export const instant = false;

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;

  return <CustomerOrderStatus publicToken={publicToken} />;
}
