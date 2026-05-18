"use client";

import { Search, Filter, MoreHorizontal, User as UserIcon, Mail } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MOCK_CUSTOMERS = [
  {
    id: "cus_1",
    name: "Rahul Sharma",
    email: "rahul.s@example.com",
    orders: 12,
    totalSpent: 45000,
    joinDate: "2023-01-15",
    status: "Active"
  },
  {
    id: "cus_2",
    name: "Priya Patel",
    email: "priya.fit@example.com",
    orders: 4,
    totalSpent: 12400,
    joinDate: "2023-06-22",
    status: "Active"
  },
  {
    id: "cus_3",
    name: "Amit Kumar",
    email: "amit.k99@example.com",
    orders: 1,
    totalSpent: 2999,
    joinDate: "2023-11-05",
    status: "Inactive"
  },
  {
    id: "cus_4",
    name: "Neha Singh",
    email: "neha.singh.pt@example.com",
    orders: 24,
    totalSpent: 105000,
    joinDate: "2022-08-10",
    status: "Active"
  }
];

export default function AdminCustomersPage() {
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

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search customers by name or email..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="font-bold uppercase text-xs">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-center">Orders</th>
                  <th className="px-6 py-4">Total Spent</th>
                  <th className="px-6 py-4">Join Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {MOCK_CUSTOMERS.map((customer) => (
                  <tr key={customer.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-brand/20 text-brand flex items-center justify-center font-black">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold">{customer.name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" /> {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{customer.orders}</td>
                    <td className="px-6 py-4 font-bold text-green-600">₹{customer.totalSpent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-muted-foreground">{customer.joinDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${
                        customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CustomerActions />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y">
            {MOCK_CUSTOMERS.map((customer) => (
              <div key={customer.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-brand/20 text-brand flex items-center justify-center font-black shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">{customer.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold truncate max-w-[180px]">{customer.email}</p>
                    </div>
                  </div>
                  <CustomerActions />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Spent</p>
                    <p className="font-black text-green-600">₹{customer.totalSpent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Orders</p>
                    <p className="font-bold">{customer.orders} total</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Status</p>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      customer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Join Date</p>
                    <p className="font-bold text-xs">{customer.joinDate}</p>
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

function CustomerActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem className="font-bold text-xs uppercase cursor-pointer">
          Order History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
