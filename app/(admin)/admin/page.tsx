"use client";

import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  AlertTriangle,
  TrendingUp,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const chartData = [
  { name: "01 May", revenue: 4500, orders: 12 },
  { name: "05 May", revenue: 5200, orders: 15 },
  { name: "10 May", revenue: 4800, orders: 10 },
  { name: "15 May", revenue: 7000, orders: 22 },
  { name: "20 May", revenue: 6500, orders: 18 },
  { name: "25 May", revenue: 9000, orders: 28 },
  { name: "30 May", revenue: 8500, orders: 25 },
];

const RECENT_ORDERS = [
    { id: "ord_1", customer: "Rahul Sharma", amount: 5098, status: "SHIPPED", date: "2 mins ago" },
    { id: "ord_2", customer: "Anjali Gupta", amount: 1299, status: "PENDING", date: "1 hour ago" },
    { id: "ord_3", customer: "Vikram Singh", amount: 2499, status: "CONFIRMED", date: "3 hours ago" },
    { id: "ord_4", customer: "Priya Patel", amount: 899, status: "DELIVERED", date: "Yesterday" },
];

const LOW_STOCK = [
    { name: "Elite Whey Isolate", stock: 2, brand: "SuppStore Elite" },
    { name: "Nitro Blast Pre-Workout", stock: 5, brand: "NitroX" },
    { name: "Daily Multi-Vitamin", stock: 0, brand: "HealthFirst" },
];

export default function AdminDashboard() {
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
            value="₹1,24,500" 
            icon={DollarSign} 
            trend="+12.5%" 
            trendUp={true} 
            description="vs last month" 
        />
        <StatsCard 
            title="Total Orders" 
            value="482" 
            icon={ShoppingBag} 
            trend="+8.2%" 
            trendUp={true} 
            description="vs last month" 
        />
        <StatsCard 
            title="New Customers" 
            value="124" 
            icon={Users} 
            trend="-2.4%" 
            trendUp={false} 
            description="vs last month" 
        />
        <StatsCard 
            title="Low Stock" 
            value="12" 
            icon={AlertTriangle} 
            trend="Critical" 
            trendUp={false} 
            description="Items need restock" 
            warning={true}
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
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00FF87" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00FF87" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 'bold' }} 
                    tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#00FF87' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#00FF87" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold uppercase tracking-tight flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {LOW_STOCK.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-bold leading-none">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.brand}</p>
                </div>
                <Badge variant={item.stock === 0 ? "destructive" : "outline"} className="font-bold">
                  {item.stock} left
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full text-xs font-bold uppercase mt-4">Manage Inventory</Button>
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
                {RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-bold">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 font-bold">₹{order.amount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <Badge className={`font-black uppercase text-[10px] tracking-widest ${
                        order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-brand/10 text-brand'
                      }`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4">
                        <Link href={`/admin/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase hover:text-brand">Edit</Button>
                        </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View for Recent Orders */}
          <div className="md:hidden divide-y">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm leading-none">{order.customer}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{order.id}</p>
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
                    <p className="font-black">₹{order.amount.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Date</p>
                    <p className="text-xs font-bold text-muted-foreground">{order.date}</p>
                  </div>
                  <div>
                    <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="font-bold text-[10px] uppercase h-7">Edit</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
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
