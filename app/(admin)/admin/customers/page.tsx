import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";
import CustomerTable from "./CustomerTable";

export default async function AdminCustomersPage() {
  const customers = await withRetry(async () => {
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return users.map(user => {
      const ordersCount = user.orders.length;
      const totalSpent = user.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        ordersCount,
        totalSpent,
      };
    });
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Customers</h1>
          <p className="text-muted-foreground">Manage your store's registered users and guest buyers.</p>
        </div>
        <Button className="bg-foreground text-background hover:bg-brand hover:text-black font-bold uppercase tracking-widest">
          Export CSV
        </Button>
      </div>

      <CustomerTable initialCustomers={JSON.parse(JSON.stringify(customers))} />
    </div>
  );
}
