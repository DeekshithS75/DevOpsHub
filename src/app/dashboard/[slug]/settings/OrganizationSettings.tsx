
"use client";

import { useState } from "react";

interface OrganizationSettingsProps {
  slug: string;
}

export default function OrganizationSettings({
  slug,
}: OrganizationSettingsProps) {
  const [name, setName] = useState("My New Company");
  const [description, setDescription] = useState(
    "Our team's deployment management workspace."
  );
  const [saved, setSaved] = useState(false);

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-600">
          Organization Management
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Organization Settings
        </h1>
        <p className="mt-2 text-gray-500">
          Manage your organization information and preferences.
        </p>
      </section>

      <form
        onSubmit={handleSave}
        className="space-y-6 rounded-xl border border-gray-200 bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            General Information
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your organization&apos;s basic details.
          </p>
        </div>

        <div>
          <label
            htmlFor="organizationName"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Organization Name
          </label>
          <input
            id="organizationName"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            minLength={2}
            maxLength={80}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="organizationDescription"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="organizationDescription"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setSaved(false);
            }}
            rows={4}
            maxLength={300}
            className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-500"
          />
          <p className="mt-1 text-right text-xs text-gray-400">
            {description.length}/300
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Organization Slug
          </label>
          <input
            value={slug}
            readOnly
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            This is the current organization URL identifier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-5">
          <button
            type="submit"
            disabled={name.trim().length < 2}
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Save Changes
          </button>

          {saved && (
            <p className="text-sm font-medium text-green-600">
              Changes saved locally (demo only).
            </p>
          )}
        </div>
      </form>

      <section className="rounded-xl border border-red-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Danger Zone
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Organization deletion is a sensitive action and requires
          backend authorization and confirmation.
        </p>
        <button
          type="button"
          disabled
          className="mt-4 cursor-not-allowed rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-400"
        >
          Delete Organization (Unavailable)
        </button>
      </section>
    </div>
  );
}
