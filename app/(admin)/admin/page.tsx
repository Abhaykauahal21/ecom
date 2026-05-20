export const dynamic = "force-dynamic";

import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RevenueChart from "@/components/admin/RevenueChart";
import prisma from "@/lib/prisma";
import { withRetry } from "@/lib/safe-db";

const LOW_STOCK = [
    { name: "Elite Whey Isolate", stock: 2, brand: "SuppStore Elite" },
    { name: "Nitro Blast Pre-Workout", stock: 5, brand: "NitroX" },
    { name: "Daily Multi-Vitamin", stock: 0, brand: "HealthFirst" },
];

export default async function AdminDashboard() {
  const data = await withRetry(async () => {
    const [
      totalOrders,
      revenueResult,
      totalCustomers,
      lowStockCount,
      lowStockItems,
      recentOrders,
      last30DaysOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { stock: { lte: 5 } } }),
      prisma.product.findMany({ 
        where: { stock: { lte: 5 } }, 
        take: 5,
        orderBy: { stock: 'asc' }
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: true, orderItems: true }
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30))
          }
        },
        select: { createdAt: true, totalAmount: true }
      })
    ]);

    return {
      totalOrders,
      revenueResult,
      totalCustomers,
      lowStockCount,
      lowStockItems,
      recentOrders,
      last30DaysOrders
    };
  });

  const totalRevenue = data.revenueResult._sum.totalAmount ? Number(data.revenueResult._sum.totalAmount) : 0;

  // Process chart data (last 30 days)
  const chartData: any[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    chartData.push({ name: dateStr, revenue: 0 });
  }

  data.last30DaysOrders.forEach(order => {
    const dateStr = order.createdAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const existing = chartData.find(c => c.name === dateStr);
    if (existing) {
      existing.revenue += Number(order.totalAmount);
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
            title="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            icon={DollarSign} 
            trend="+0.0%" 
            trendUp={true} 
            description="Lifetime" 
        />
        <StatsCard 
            title="Total Orders" 
            value={data.totalOrders.toString()} 
            icon={ShoppingBag} 
            trend="+0.0%" 
            trendUp={true} 
            description="Lifetime" 
        />
        <StatsCard 
            title="Customers" 
            value={data.totalCustomers.toString()} 
            icon={Users} 
            trend="+0.0%" 
            trendUp={true} 
            description="Lifetime" 
        />
        <StatsCard 
            title="Low Stock" 
            value={data.lowStockCount.toString()} 
            icon={AlertTriangle} 
            trend={data.lowStockCount > 0 ? "Action Needed" : "All Good"} 
            trendUp={data.lowStockCount === 0} 
            description="Items under 5 units" 
            warning={data.lowStockCount > 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold uppercase tracking-tight">Revenue Analytics</CardTitle>
                    <CardDescription>Daily revenue for the last 30 days</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-xs font-bold uppercase">Export Report</Button>
            </div>
          </CardHeader>
          <CardContent className="h-[400px] p-0 pb-4">
            <RevenueChart data={chartData} />
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className={`text-lg font-bold uppercase tracking-tight flex items-center gap-2 ${data.lowStockItems.length > 0 ? 'text-destructive' : 'text-green-500'}`}>
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.lowStockItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="h-12 w-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <p className="font-bold">Inventory is healthy</p>
                <p className="text-xs">No items are currently low on stock.</p>
              </div>
            ) : (
              data.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold leading-none line-clamp-1" title={item.name}>{item.name}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.brand}</p>
                  </div>
                  <Badge variant={item.stock === 0 ? "destructive" : "outline"} className="font-bold shrink-0">
                    {item.stock} left
                  </Badge>
                </div>
              ))
            )}
            <Link href="/admin/products">
              <Button variant="outline" className="w-full text-xs font-bold uppercase mt-4">Manage Inventory</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold uppercase tracking-tight">Recent Orders</CardTitle>
            <Link href="/admin/orders">
                <Button variant="link" className="text-brand font-bold uppercase text-xs">View All</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.recentOrders.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">No recent orders.</td></tr>
                ) : data.recentOrders.map((order) => {
                  const customerName = order.user?.name || "Unknown";
                  const displayId = order.id.includes('_') ? order.id.split('_')[1] : order.id.slice(-8).toUpperCase();

                  return (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-bold uppercase">{displayId}</td>
                      <td className="px-6 py-4 line-clamp-1">{customerName}</td>
                      <td className="px-6 py-4 font-bold">₹{Number(order.totalAmount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <Badge className={`font-black uppercase text-[10px] tracking-widest ${
                          order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                          order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-brand/10 text-brand'
                        }`}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                          <Link href={`/admin/orders/${order.id}`}>
                              <Button variant="ghost" size="sm" className="font-bold text-xs uppercase hover:text-brand">Edit</Button>
                          </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View for Recent Orders */}
          <div className="md:hidden divide-y">
            {data.recentOrders.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No recent orders.</div>
            ) : data.recentOrders.map((order) => {
              const customerName = order.user?.name || "Unknown";
              const displayId = order.id.includes('_') ? order.id.split('_')[1] : order.id.slice(-8).toUpperCase();

              return (
                <div key={order.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-bold text-sm leading-none line-clamp-1">{customerName}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{displayId}</p>
                    </div>
                    <Badge className={`font-black uppercase text-[9px] tracking-widest px-2 py-0 ${
                      order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                      order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-brand/10 text-brand'
                    }`}>
                      {order.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Amount</p>
                      <p className="font-black">₹{Number(order.totalAmount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Date</p>
                      <p className="text-xs font-bold text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase h-7">Edit</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, trend, trendUp, description, warning }: any) {
    return (
        <Card className={`border-none shadow-sm transition-all hover:shadow-md ${warning ? 'bg-destructive/5' : ''}`}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${warning ? 'bg-destructive/10' : 'bg-brand/10'}`}>
                        <Icon className={`h-5 w-5 ${warning ? 'text-destructive' : 'text-brand'}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-green-500' : warning ? 'text-destructive' : 'text-red-500'}`}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trend}
                    </div>
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
                    <p className="text-3xl font-black">{value}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}
