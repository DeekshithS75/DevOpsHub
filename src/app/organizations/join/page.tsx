
"use client";

import { useState } from "react";

const availableOrganizations = [
  {
    id: 1,
    name: "Tech Solutions",
    slug: "tech-solutions",
    description: "A software development and technology team.",
    members: 12,
  },
  {
    id: 2,
    name: "Cloud Technologies",
    slug: "cloud-technologies",
    description: "A team working on cloud infrastructure and DevOps.",
    members: 8,
  },
  {
    id: 3,
    name: "DevOps Community",
    slug: "devops-community",
    description: "A community focused on deployment and automation.",
    members: 25,
  },
];

export default function JoinOrganizationPage() {
  const [search, setSearch] = useState("");
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [message, setMessage] = useState("");

  const filteredOrganizations = availableOrganizations.filter((org) =>
    `${org.name} ${org.slug}`
      .toLowerCase()
      .includes(search.toLowerCase().trim())
  );

  function handleRequest(id: number) {
    setRequestedIds((previous) => [...previous, id]);
    setMessage("Join request submitted successfully (demo only).");
  }

  function handleCancel(id: number) {
    setRequestedIds((previous) =>
      previous.filter((requestedId) => requestedId !== id)
    );
    setMessage("Join request cancelled.");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <section>
          <p className="text-sm font-medium text-blue-600">
            Organization Membership
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Join an Organization
          </h1>
          <p className="mt-2 text-gray-600">
            Find an existing organization and request access to collaborate.
          </p>
        </section>

        <section>
          <label
            htmlFor="organizationSearch"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Search organizations
          </label>
          <input
            id="organizationSearch"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setMessage("");
            }}
            placeholder="Search by organization name or slug..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        {message && (
          <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
            {message}
          </p>
        )}

        <section className="space-y-4">
          {filteredOrganizations.map((org) => {
            const requested = requestedIds.includes(org.id);

            return (
              <article
                key={org.id}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {org.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {org.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Slug: {org.slug}</span>
                      <span>{org.members} members</span>
                    </div>
                  </div>

                  {requested ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-yellow-100 px-3 py-1.5 text-xs font-semibold text-yellow-700">
                        PENDING
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCancel(org.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-800"
                      >
                        Cancel request
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRequest(org.id)}
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Request to Join
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {filteredOrganizations.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
              <h2 className="font-semibold text-gray-900">
                No organizations found
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Try searching with a different name or slug.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
