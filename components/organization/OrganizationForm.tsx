
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AvailabilityStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

const existingNames = [
  "tech solutions",
  "cloud technologies",
  "devopshub",
];

// Temporary mock availability check.
// Replace with the real backend API after merging.
async function checkNameAvailability(
  name: string
): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const normalizedName = name
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  return !existingNames.includes(normalizedName);
}

// Temporary mock creation.
// Replace with POST /api/organizations after backend integration.
async function createOrganization(name: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    success: true,
    organization: {
      name,
      slug,
    },
  };
}

export default function OrganizationForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [status, setStatus] =
    useState<AvailabilityStatus>("idle");
  const [availabilityMessage, setAvailabilityMessage] =
    useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState("");

  const trimmedName = name.trim();

  const isValid =
    trimmedName.length >= 2 &&
    trimmedName.length <= 80;

  useEffect(() => {
    if (!isValid) {
      setStatus("idle");
      setAvailabilityMessage("");
      return;
    }

    let isCurrent = true;

    setStatus("checking");
    setAvailabilityMessage("");

    const timer = setTimeout(async () => {
      try {
        const available =
          await checkNameAvailability(trimmedName);

        if (!isCurrent) return;

        setStatus(available ? "available" : "taken");

        setAvailabilityMessage(
          available
            ? "Organization name is available!"
            : "This organization name is already taken."
        );
      } catch {
        if (!isCurrent) return;

        setStatus("error");
        setAvailabilityMessage(
          "Unable to check name availability. Please try again."
        );
      }
    }, 500);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [trimmedName, isValid]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isValid || status !== "available" || isCreating) {
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const result = await createOrganization(trimmedName);

      if (!result.success) {
        throw new Error("Organization creation failed.");
      }

      setSuccess("Organization created successfully!");

      router.push(
        `/dashboard/${result.organization.slug}`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="organizationName"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Organization Name
        </label>

        <input
          id="organizationName"
          type="text"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError("");
            setSuccess("");
          }}
          placeholder="e.g. Tech Solutions"
          maxLength={80}
          disabled={isCreating}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
        />

        <div className="mt-2 flex justify-between text-xs text-gray-500">
          <span>Enter 2–80 characters.</span>
          <span>{name.length}/80</span>
        </div>

        {name.length > 0 && !isValid && (
          <p className="mt-2 text-sm text-red-600">
            Organization name must contain 2–80 characters.
          </p>
        )}

        {isValid && status === "checking" && (
          <p className="mt-2 text-sm text-gray-500">
            Checking availability...
          </p>
        )}

        {status === "available" && (
          <p className="mt-2 text-sm text-green-600">
            {availabilityMessage}
          </p>
        )}

        {(status === "taken" || status === "error") && (
          <p className="mt-2 text-sm text-red-600">
            {availabilityMessage}
          </p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={
          !isValid ||
          status !== "available" ||
          isCreating
        }
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {isCreating
          ? "Creating Organization..."
          : "Create Organization"}
      </button>
    </form>
  );
}
