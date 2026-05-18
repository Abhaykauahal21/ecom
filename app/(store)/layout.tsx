import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import MobileTabBar from "@/components/store/MobileTabBar";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
