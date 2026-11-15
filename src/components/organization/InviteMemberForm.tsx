
"use client";

import { useState } from "react";

type InviteRole = "DEVELOPER" | "VIEWER" | "ADMIN";

interface InviteMemberFormProps {
  onInvite: (email: string, role: InviteRole) => Promise<void>;
}

export default function InviteMemberForm({
  onInvite,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("DEVELOPER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await onInvite(normalizedEmail, role);
      setSuccess(`Invitation sent to ${normalizedEmail}.`);
      setEmail("");
      setRole("DEVELOPER");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send invitation. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        Invite a Member
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Invite someone to join your organization.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label
            htmlFor="inviteEmail"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Email Address
          </label>

          <input
            id="inviteEmail"
            type="email"
            placeholder="developer@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        <div>
          <label
            htmlFor="inviteRole"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Select Role
          </label>

          <select
            id="inviteRole"
            value={role}
            onChange={(event) =>
              setRole(event.target.value as InviteRole)
            }
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="DEVELOPER">Developer</option>
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {success && (
          <p role="status" className="text-sm text-green-600">
            {success}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {loading ? "Sending Invitation..." : "Send Invitation"}
        </button>
      </form>
    </section>
  );
}
