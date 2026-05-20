export const dynamic = "force-dynamic";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import AdminBottomNav from "@/components/admin/AdminBottomNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/20">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b bg-background px-4 flex items-center justify-between sticky top-0 z-50">
          <span className="text-xl font-bold tracking-tighter text-brand">
            SUPP<span className="text-foreground">ADMIN</span>
          </span>
          
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
        </header>

        <main className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full pb-24 lg:pb-10">
          {children}
        </main>
      </div>

      <AdminBottomNav />
    </div>
  );
}
