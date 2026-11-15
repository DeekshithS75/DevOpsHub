"use client";

import { useCallback, useEffect, useState } from "react";
import InviteMemberForm from "@/components/organization/InviteMemberForm";

type Role = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER";
type Member = { id: string; role: Role; joinedAt: string; user: { name: string | null; email: string } };
type Invitation = { id: string; email: string; role: Exclude<Role, "OWNER">; status: "PENDING"; createdAt: string; expiresAt: string };
type ApiResult<T> = { success: boolean; message?: string } & T;

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    OWNER: "bg-purple-100 text-purple-700", ADMIN: "bg-indigo-100 text-indigo-700",
    DEVELOPER: "bg-blue-100 text-blue-700", VIEWER: "bg-gray-100 text-gray-700",
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}>{role}</span>;
}

export default function TeamContent({ slug }: { slug: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [canManage, setCanManage] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadTeam = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [membersResponse, invitationsResponse] = await Promise.all([
        fetch(`/api/organizations/${encodeURIComponent(slug)}/members`),
        fetch(`/api/organizations/${encodeURIComponent(slug)}/invitations`),
      ]);
      const memberData = (await membersResponse.json()) as ApiResult<{ members: Member[]; currentUserRole: Role }>;
      const invitationData = (await invitationsResponse.json()) as ApiResult<{ invitations: Invitation[] }>;
      if (!membersResponse.ok) throw new Error(memberData.message || "Failed to load team members");
      if (!invitationsResponse.ok) throw new Error(invitationData.message || "Failed to load invitations");
      setMembers(memberData.members);
      setCanManage(["OWNER", "ADMIN"].includes(memberData.currentUserRole));
      setInvitations(invitationData.invitations);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to load team data");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void loadTeam(); }, [loadTeam]);

  async function handleInvite(email: string, role: "DEVELOPER" | "VIEWER" | "ADMIN") {
    const response = await fetch(`/api/organizations/${encodeURIComponent(slug)}/invitations`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }),
    });
    const data = (await response.json()) as ApiResult<{ invitation: Invitation }>;
    if (!response.ok) throw new Error(data.message || "Unable to send invitation");
    setInvitations((current) => [data.invitation, ...current]);
    setMessage(data.message || "Invitation sent successfully");
  }

  async function handleRevoke(id: string) {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) return;
    setError("");
    const response = await fetch(`/api/organizations/${encodeURIComponent(slug)}/invitations/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = (await response.json()) as ApiResult<Record<string, never>>;
    if (!response.ok) { setError(data.message || "Unable to revoke invitation"); return; }
    setInvitations((current) => current.filter((invitation) => invitation.id !== id));
    setMessage(data.message || "Invitation revoked successfully");
  }

  const filteredMembers = members.filter((member) =>
    `${member.user.name ?? ""} ${member.user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  const date = (value: string) => new Date(value).toLocaleDateString();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-600">Organization Management</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Team Members</h1>
        <p className="mt-2 text-gray-500">Manage your organization members and invitations.</p>
      </section>

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="text-sm font-medium text-green-600">{message}</p>}

      <section className="grid gap-5 sm:grid-cols-3">
        <Summary label="Total Members" value={members.length} />
        <Summary label="Active Members" value={members.length} color="text-green-600" />
        <Summary label="Pending Invitations" value={invitations.length} color="text-yellow-600" />
      </section>

      {canManage && <InviteMemberForm onInvite={handleInvite} />}

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Pending Invitations</h2>
          <p className="mt-1 text-sm text-gray-500">Invitations waiting for recipients to accept.</p>
        </div>
        {loading ? <p className="px-6 py-10 text-center text-sm text-gray-500">Loading invitations…</p> : invitations.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">No pending invitations.</p>
        ) : <div className="divide-y divide-gray-100">{invitations.map((invitation) => (
          <div key={invitation.id} className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="font-medium text-gray-900">{invitation.email}</p>
              <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">{invitation.status}</span><RoleBadge role={invitation.role} /></div>
              <p className="text-xs text-gray-500">Invited: {date(invitation.createdAt)} · Expires: {date(invitation.expiresAt)}</p>
            </div>
            {canManage && <button type="button" onClick={() => void handleRevoke(invitation.id)} className="self-start text-sm font-medium text-red-600 hover:text-red-800 sm:self-center">Revoke Invitation</button>}
          </div>
        ))}</div>}
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-semibold text-gray-900">Team Members</h2><p className="mt-1 text-sm text-gray-500">Current members of your organization.</p></div>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search members..." className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 sm:max-w-xs" />
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-6 py-4 font-medium">Member</th><th className="px-6 py-4 font-medium">Role</th><th className="px-6 py-4 font-medium">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-100">{loading ? <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">Loading team members…</td></tr> : filteredMembers.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50"><td className="px-6 py-4"><p className="font-medium text-gray-900">{member.user.name || member.user.email}</p><p className="mt-1 text-sm text-gray-500">{member.user.email}</p></td><td className="px-6 py-4"><RoleBadge role={member.role} /></td><td className="px-6 py-4"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">ACTIVE</span></td></tr>
          ))}{!loading && filteredMembers.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">No team members found.</td></tr>}</tbody>
        </table></div>
      </section>
    </div>
  );
}

function Summary({ label, value, color = "text-gray-900" }: { label: string; value: number; color?: string }) {
  return <div className="rounded-xl border border-gray-200 bg-white p-5"><p className="text-sm text-gray-500">{label}</p><p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p></div>;
}
