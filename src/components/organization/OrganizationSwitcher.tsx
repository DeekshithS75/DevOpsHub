
"use client";

import { useState } from "react";
import Link from "next/link";

interface OrganizationSwitcherProps {
  currentSlug: string;
}

const organizations = [
  {
    name: "My New Company",
    slug: "my-new-company",
    role: "OWNER",
  },
  {
    name: "Cloud Technologies",
    slug: "cloud-technologies",
    role: "DEVELOPER",
  },
  {
    name: "DevOps Team",
    slug: "devops-team",
    role: "VIEWER",
  },
];

export default function OrganizationSwitcher({
  currentSlug,
}: OrganizationSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOrganization = organizations.find(
    (org) => org.slug === currentSlug
  );

  return (
    <div className="relative border-b border-gray-200 p-4">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-3 text-left transition hover:bg-gray-50"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">
            {currentOrganization?.name ?? "Select Organization"}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {currentOrganization?.role ?? "No organization selected"}
          </p>
        </div>

        <span className="ml-2 text-gray-500">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-4 right-4 top-full z-50 mt-2 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
          <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Your Organizations
          </p>

          {organizations.map((org) => {
            const isSelected = org.slug === currentSlug;

            return (
              <Link
                key={org.slug}
                href={`/dashboard/${org.slug}`}
                onClick={() => setIsOpen(false)}
                className={`mb-1 flex items-center justify-between rounded-lg px-3 py-3 transition ${
                  isSelected
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {org.name}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {org.role}
                  </p>
                </div>

                {isSelected && (
                  <span className="ml-2 text-sm font-bold text-blue-600">
                    ✓
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
