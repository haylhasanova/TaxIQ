"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";

const ROLES = ["reader", "author", "editor", "super_admin"] as const;

export function UserRoleSelect({ uid, role }: { uid: string; role: string }) {
  const [current, setCurrent] = useState(role);
  const [saving, setSaving] = useState(false);

  async function handleChange(nextRole: string) {
    setSaving(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        },
        body: JSON.stringify({ uid, role: nextRole }),
      });
      if (res.ok) setCurrent(nextRole);
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={current}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>
          {r}
        </option>
      ))}
    </select>
  );
}
