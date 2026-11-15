"use client";

import { useEffect, useState } from "react";

type Organization = { name: string; slug: string; createdAt: string; memberCount: number; role: string };

export default function OrganizationSettings({ slug }: { slug: string }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/organizations/${encodeURIComponent(slug)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to load organization settings");
        return data.organization as Organization;
      })
      .then((data) => { if (!cancelled) setOrganization(data); })
      .catch((cause: unknown) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Failed to load organization settings"); });
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-600">Organization Management</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Organization Settings</h1>
        <p className="mt-2 text-gray-500">View your organization information.</p>
      </section>
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
        {error ? <p role="alert" className="mt-4 text-sm text-red-600">{error}</p> : !organization ? <p className="mt-4 text-sm text-gray-500">Loading organization settings…</p> : (
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm text-gray-500">Organization Name</dt><dd className="mt-1 font-medium text-gray-900">{organization.name}</dd></div>
            <div><dt className="text-sm text-gray-500">Organization Slug</dt><dd className="mt-1 font-medium text-gray-900">{organization.slug}</dd></div>
            <div><dt className="text-sm text-gray-500">Members</dt><dd className="mt-1 font-medium text-gray-900">{organization.memberCount}</dd></div>
            <div><dt className="text-sm text-gray-500">Your Role</dt><dd className="mt-1 font-medium text-gray-900">{organization.role}</dd></div>
            <div><dt className="text-sm text-gray-500">Created</dt><dd className="mt-1 font-medium text-gray-900">{new Date(organization.createdAt).toLocaleDateString()}</dd></div>
          </dl>
        )}
      </section>
    </div>
  );
}
