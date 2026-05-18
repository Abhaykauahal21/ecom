import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Activity } from "lucide-react";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";
import { RevenueLineChart, CategoryBarChart } from "./AnalyticsCharts";

export default async function AdminAnalyticsPage() {
  const data = await withRetry(async () => {
    const [
      revenueResult,
      totalOrders,
      totalCustomers,
      ordersToday,
      allOrders,
      categories,
      orderItems
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.count({ 
        where: { 
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } 
        }
      }),
      prisma.order.findMany({ select: { createdAt: true, totalAmount: true } }),
      prisma.category.findMany(),
      prisma.orderItem.findMany({ include: { product: true } })
    ]);

    return {
      revenueResult,
      totalOrders,
      totalCustomers,
      ordersToday,
      allOrders,
      categories,
      orderItems
    };
  });

  const totalRevenue = data.revenueResult._sum.totalAmount ? Number(data.revenueResult._sum.totalAmount) : 0;

  // Process Sales Data (Monthly)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const salesMap = new Map();
  months.forEach(m => salesMap.set(m, 0));
  
  data.allOrders.forEach(order => {
    const month = months[order.createdAt.getMonth()];
    salesMap.set(month, salesMap.get(month) + Number(order.totalAmount));
  });

  // Filter out months with 0 sales from the start to make the chart look better, unless all are 0
  let salesData = Array.from(salesMap.entries()).map(([name, sales]) => ({ name, sales }));
  const firstMonthWithSales = salesData.findIndex(d => d.sales > 0);
  if (firstMonthWithSales > 0) {
      salesData = salesData.slice(Math.max(0, firstMonthWithSales - 1));
  }

  // Process Category Data
  const categoryMap = new Map();
  data.categories.forEach(c => categoryMap.set(c.id, { name: c.name, revenue: 0 }));

  data.orderItems.forEach(item => {
    const cat = categoryMap.get(item.product.categoryId);
    if (cat) {
      cat.revenue += (Number(item.price) * item.quantity);
    }
  });

  const categoryData = Array.from(categoryMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5); // Top 5 categories

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Analytics Overview</h1>
        <p className="text-muted-foreground">Monitor your store's performance and sales metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Total Revenue
            </CardTitle>
            <div className="h-10 w-10 bg-brand/20 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs font-bold text-green-500 mt-1 flex items-center">
              Lifetime Earnings
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Orders
            </CardTitle>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{data.totalOrders}</div>
            <p className="text-xs font-bold text-blue-500 mt-1 flex items-center">
              Total orders placed
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Customers
            </CardTitle>
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{data.totalCustomers}</div>
            <p className="text-xs font-bold text-purple-500 mt-1 flex items-center">
              Registered customers
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Orders Today
            </CardTitle>
            <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Activity className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{data.ordersToday}</div>
            <p className="text-xs font-bold text-orange-500 mt-1 flex items-center">
              Placed in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm">Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px]">
              <RevenueLineChart data={salesData} />
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="uppercase tracking-widest text-sm">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <CategoryBarChart data={categoryData} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
