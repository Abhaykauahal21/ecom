import { getUserProfile } from "@/app/actions/user";
import ProfileManager from "./ProfileManager";
import { User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Kavya Boss Nutrition",
  description: "Manage your personal profile details, contact information, delivery addresses, and track order history.",
};

export default async function ProfilePage() {
  const result = await getUserProfile();

  if (!result.success || !result.user) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center space-y-6">
        <div className="bg-red-500/10 text-red-500 h-16 w-16 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tight">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You must be logged in to view and update your profile details.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Link href="/sign-in?redirect_url=/profile" className="block w-full">
            <Button className="w-full bg-brand text-black hover:bg-brand/90 font-black uppercase text-xs tracking-widest h-12 rounded-2xl shadow-lg shadow-brand/20">
              Sign In
            </Button>
          </Link>
          <Link href="/" className="block w-full">
            <Button variant="outline" className="w-full font-bold uppercase text-xs h-12 rounded-2xl">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="space-y-2 mb-10">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
          My <span className="text-brand">Account</span>
        </h1>
        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
          Manage your personal details, delivery addresses, and track order status.
        </p>
      </div>

      <ProfileManager initialUser={result.user} />
    </div>
  );
}
