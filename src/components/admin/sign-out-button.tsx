"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/az/sign-in");
  }

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-danger/40 hover:text-danger"
    >
      <LogOut className="h-3.5 w-3.5" />
      Çıxış
    </button>
  );
}
