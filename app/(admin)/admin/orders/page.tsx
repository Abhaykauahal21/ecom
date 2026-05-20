export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";
import OrderTable from "./OrderTable";

export default async function AdminOrdersPage() {
  const orders = await withRetry(async () => {
    return await prisma.order.findMany({
      include: {
        user: true,
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    });
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders and fulfillment status.</p>
      </div>

      <OrderTable initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
