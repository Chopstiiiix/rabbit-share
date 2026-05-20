import { hasVerifiedAppAdminEmail } from "@/lib/admin";
import { currentUser } from "@clerk/nextjs/server";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardLink() {
  const user = await currentUser();

  if (!hasVerifiedAppAdminEmail(user?.emailAddresses)) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="pressable-card inline-flex items-center gap-2 rounded-full border border-pink-300/30 bg-pink-500 px-4 py-2 text-sm font-semibold text-white"
    >
      <ShieldCheck size={15} />
      Admin
    </Link>
  );
}
