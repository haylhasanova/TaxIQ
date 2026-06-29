import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/auth-admin-guard";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import type { UserDoc } from "@/lib/repositories/users";

export default async function AdminUsersPage() {
  await requireAdminSession(["super_admin"]);
  const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").limit(100).get();
  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as UserDoc) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">İstifadəçilər</h1>
        <p className="text-sm text-muted">Rolları idarə edin (yalnız super admin)</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs font-bold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3">E-poçt</th>
              <th className="px-5 py-3">Rol</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-3.5 font-medium">{user.email}</td>
                <td className="px-5 py-3.5">
                  <UserRoleSelect uid={user.uid} role={user.role} />
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={2} className="px-5 py-10 text-center text-muted">
                  Hələ istifadəçi yoxdur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
