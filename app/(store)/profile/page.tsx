import { getUserProfile } from "@/app/actions/user";
import ProfileManager from "./ProfileManager";
import { User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AuthRequiredModal from "@/components/store/AuthRequiredModal";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Profile | Kavya Boss Nutrition",
  description: "Manage your personal profile details, contact information, delivery addresses, and track order history.",
};

export default async function ProfilePage() {
  const result = await getUserProfile();

  if (!result.success || !result.user) {
    return <AuthRequiredModal fallbackUrl="/" />;
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
