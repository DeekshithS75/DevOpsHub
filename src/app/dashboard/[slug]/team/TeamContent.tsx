
"use client";

import { useState } from "react";

type Role = "OWNER" | "DEVELOPER" | "VIEWER";
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

function RoleBadge({ role }: { role: Role }) {
  const styles: Record<Role, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    DEVELOPER: "bg-blue-100 text-blue-700",
    VIEWER: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[role]}`}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        status === "ACTIVE"
          ? "bg-green-100 text-green-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("DEVELOPER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filteredMembers = members.filter((member) =>
    `${member.name} ${member.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const alreadyExists = members.some(
      (member) => member.email.toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      setError("This member already exists in the organization.");
      return;
    }

    const newMember: Member = {
      id: Date.now(),
      name: normalizedEmail.split("@")[0],
      email: normalizedEmail,
      role,
      status: "PENDING",
    };

    setMembers((previous) => [...previous, newMember]);
    setEmail("");
    setRole("DEVELOPER");
    setSuccess("Member added successfully (demo only).");
  }

  function handleRemoveMember(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmed) return;

    setMembers((previous) =>
      previous.filter((member) => member.id !== id)
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">

      {/* Header */}
      <section>
        <p className="text-sm font-medium text-blue-600">
          Organization Management
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Team Members
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your organization members and their roles.
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
            {members.filter((m) => m.status === "ACTIVE").length}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="text-sm text-gray-500">Pending Members</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {members.filter((m) => m.status === "PENDING").length}
          </p>
        </div>
      </section>

      {/* Add Member */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Add Team Member
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter a registered user's email and select their role.
        </p>

        <form
          onSubmit={handleAddMember}
          className="mt-5 grid gap-4 sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setSuccess("");
            }}
            placeholder="Enter member email"
            className="rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            required
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          >
            <option value="DEVELOPER">Developer</option>
            <option value="VIEWER">Viewer</option>
            <option value="OWNER">Owner</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Add Member
          </button>
        </form>

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}

        {success && (
          <p className="mt-3 text-sm text-green-600">{success}</p>
        )}
      </section>

      {/* Members Table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Members
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              View and manage your team.
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
                <th className="px-6 py-4 text-right font-medium">Action</th>
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
                    <StatusBadge status={member.status} />
                  </td>

                  <td className="px-6 py-4 text-right">
                    {member.role !== "OWNER" && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
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
