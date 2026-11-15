
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Invitation = {
  email: string;
  organizationName: string;
  role: "DEVELOPER" | "VIEWER" | "ADMIN";
  expiresAt: string;
};

type InvitationResponse = {
  valid: boolean;
  invitation?: Invitation;
  message?: string;
};

type AcceptResponse = {
  success: boolean;
  message?: string;
  organization?: {
    name: string;
    slug: string;
  };
};

async function readApiResponse(response: Response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "Invitation service is currently unavailable. Please try again later."
    );
  }
}

export default function InvitationClient({
  token,
}: {
  token: string;
}) {
  const router = useRouter();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchInvitation() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `/api/invitations/${encodeURIComponent(token)}`,
          { signal: controller.signal }
        );

        const data: InvitationResponse = await readApiResponse(response);

        if (!response.ok || !data.valid || !data.invitation) {
          throw new Error(
            data.message || "This invitation is invalid or has expired."
          );
        }

        setInvitation(data.invitation);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Unable to load invitation."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchInvitation();

    return () => controller.abort();
  }, [token]);

  async function handleAccept() {
    try {
      setAccepting(true);
      setError("");

      const response = await fetch(
        `/api/invitations/${encodeURIComponent(token)}/accept`,
        { method: "POST" }
      );

      const data: AcceptResponse = await readApiResponse(response);

      if (!response.ok || !data.success || !data.organization?.slug) {
        throw new Error(data.message || "Unable to accept invitation.");
      }

      router.push(
        `/dashboard/${encodeURIComponent(data.organization.slug)}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to accept invitation."
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-600">Loading invitation...</p>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Invitation unavailable
          </h1>

          <p className="mt-3 text-sm text-red-600">{error}</p>

          <Link
            href="/sign-in"
            className="mt-6 inline-block font-medium text-blue-600 hover:underline"
          >
            Go to Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            You're invited!
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            You've been invited to join an organization on DevOpsHub.
          </p>
        </div>

        <div className="space-y-4 rounded-xl bg-gray-50 p-5">
          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Organization
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {invitation.organizationName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Invitation email
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {invitation.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Assigned role
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {invitation.role}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase text-gray-500">
              Expires on
            </p>
            <p className="mt-1 font-semibold text-gray-900">
              {new Date(invitation.expiresAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {accepting ? "Accepting..." : "Accept Invitation"}
        </button>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-medium text-blue-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
