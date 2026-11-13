
"use client";

import Link from "next/link";
import { useState } from "react";
import OrganizationSwitcher from "./OrganizationSwitcher";

interface OrganizationSidebarProps {
  slug: string;
}

export default function OrganizationSidebar({
  slug,
}: OrganizationSidebarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navigation = [
    { name: "Overview", path: "" },
    { name: "Projects", path: "/projects" },
    { name: "Deployments", path: "/deployments" },
    { name: "Integrations", path: "/integrations" },
    { name: "Team", path: "/team" },
    { name: "Organization Settings", path: "/settings" },
  ];

  return (
    <>
      {/* Mobile header */}
      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:hidden">
        <Link
          href={`/dashboard/${slug}`}
          className="text-xl font-bold text-blue-600"
        >
          DevOpsHub
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          className="rounded-lg border border-gray-200 px-3 py-2 text-gray-700"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile backdrop */}
      {menuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:sticky md:top-0 md:z-20 md:min-h-screen md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-200 p-6">
          <Link
            href={`/dashboard/${slug}`}
            className="text-xl font-bold text-blue-600"
          >
            DevOpsHub
          </Link>
          <p className="mt-1 text-xs text-gray-500">
            Organization Workspace
          </p>
        </div>

        <OrganizationSwitcher currentSlug={slug} />

        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={`/dashboard/${slug}${item.path}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block rounded-lg px-4 py-3 text-sm text-gray-600 hover:bg-gray-100"
          >
            Back to Dashboard
          </Link>
        </div>
      </aside>
    </>
  );
}
