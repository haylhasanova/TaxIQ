import { adminDb } from "@/lib/firebase/admin";
import { requireAdminSession } from "@/lib/auth-admin-guard";
import { UserRoleSelect } from "@/components/admin/user-role-select";
import type { UserDoc } from "@/lib/repositories/users";

export default async function AdminUsersPage() {
  await requireAdminSession(["super_admin"]);
  const snapshot = await adminDb.collection("users").orderBy("createdAt", "desc").limit(100).get();
  const users = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as UserDoc) }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold">Users</h1>
      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">
                  <UserRoleSelect uid={user.uid} role={user.role} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
