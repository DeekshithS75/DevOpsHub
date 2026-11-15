
"use client";

import { useState } from "react";
import InviteMemberForm from "@/components/organization/InviteMemberForm";

type Role = "OWNER" | "DEVELOPER" | "VIEWER" | "ADMIN";
type Status = "ACTIVE" | "PENDING";

interface Member {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

const initialMembers: Member[] = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "OWNER",
    status: "ACTIVE",
  },
  {
    id: 2,
    name: "Sarah Williams",
    email: "sarah@example.com",
    role: "DEVELOPER",
    status: "ACTIVE",
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    role: "VIEWER",
    status: "ACTIVE",
  },
];

interface Invitation {
  id: number;
  email: string;
  role: "DEVELOPER" | "VIEWER" | "ADMIN";
  status: "PENDING";
  createdAt: string;
  expiresAt: string;
}

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-indigo-100 text-indigo-700",
    DEVELOPER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
      {status}
    </span>
  );
}

export default function TeamPage() {
  const [members] = useState(initialMembers);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function handleInvite(
    email: string,
    role: "DEVELOPER" | "VIEWER" | "ADMIN"
  ) {
    const alreadyMember = members.some(
      (member) => member.email.toLowerCase() === email
    );

    const alreadyInvited = invitations.some(
      (invitation) => invitation.email.toLowerCase() === email
    );

    if (alreadyMember) {
      throw new Error("This person is already a member.");
    }

    if (alreadyInvited) {
      throw new Error("A pending invitation already exists for this email.");
    }

    // Temporary mock invitation. Replace with the API call later.
    await new Promise((resolve) => setTimeout(resolve, 700));

    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    const invitation: Invitation = {
      id: Date.now(),
      email,
      role,
      status: "PENDING",
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    setInvitations((previous) => [...previous, invitation]);
    setMessage("");
  }

  function handleRevoke(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to revoke this invitation?"
    );

    if (!confirmed) return;

    setInvitations((previous) =>
      previous.filter((invitation) => invitation.id !== id)
    );

    setMessage("Invitation revoked successfully (demo only).");
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-600">
          Organization Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Team Members
        </h1>
        <p className="mt-2 text-gray-500">
          Manage your organization members and invitations.
        </p>
      </section>

      {/* Summary */}
      <section className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Total Members</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {members.length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Active Members</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {members.filter((member) => member.status === "ACTIVE").length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Invitations</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {invitations.length}
          </p>
        </div>
      </section>

      {/* Invite Form */}
      <InviteMemberForm onInvite={handleInvite} />

      {message && (
        <p role="status" className="text-sm font-medium text-green-600">
          {message}
        </p>
      )}

      {/* Pending Invitations */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Pending Invitations
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Invitations waiting for recipients to accept.
          </p>
        </div>

        {invitations.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            No pending invitations.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">
                    {invitation.email}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={invitation.status} />
                    <RoleBadge role={invitation.role} />
                  </div>

                  <p className="text-xs text-gray-500">
                    Invited: {formatDate(invitation.createdAt)}
                    {" · "}
                    Expires: {formatDate(invitation.expiresAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRevoke(invitation.id)}
                  className="self-start text-sm font-medium text-red-600 hover:text-red-800 sm:self-center"
                >
                  Revoke Invitation
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Members Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Team Members
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Current members of your organization.
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 sm:max-w-xs"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {member.name}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {member.email}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <RoleBadge role={member.role} />
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-500">
                    No team members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
