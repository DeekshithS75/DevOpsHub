"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error";

type ApiResponse = {
  success: boolean;
  message?: string;
  available?: boolean;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
};

export default function OrganizationForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [status, setStatus] = useState<AvailabilityStatus>("idle");
  const [availabilityMessage, setAvailabilityMessage] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState("");

  const trimmedName = name.trim();

  const isValid = trimmedName.length >= 2 && trimmedName.length <= 80;

  useEffect(() => {
    if (!isValid) {
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setStatus("checking");
      setAvailabilityMessage("");
      try {
        const response = await fetch(
          `/api/organizations/check-name?name=${encodeURIComponent(trimmedName)}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        const data: ApiResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to check name availability.");
        }

        setStatus(data.available ? "available" : "taken");
        setAvailabilityMessage(
          data.message || "Unable to check name availability.",
        );
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setStatus("error");
        setAvailabilityMessage(
          err instanceof Error
            ? err.message
            : "Unable to check name availability.",
        );
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedName, isValid]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValid || status !== "available" || isCreating) {
      return;
    }

    setIsCreating(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success || !data.organization?.slug) {
        if (response.status === 409) {
          setStatus("taken");
          setAvailabilityMessage(
            data.message || "This organization name is already taken.",
          );
        }

        throw new Error(data.message || "Organization creation failed.");
      }

      setSuccess("Organization created successfully!");

      router.push(`/dashboard/${data.organization.slug}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
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
          <p className="mt-2 text-sm text-gray-500">Checking availability...</p>
        )}

        {status === "available" && (
          <p className="mt-2 text-sm text-green-600">{availabilityMessage}</p>
        )}

        {(status === "taken" || status === "error") && (
          <p className="mt-2 text-sm text-red-600">{availabilityMessage}</p>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {success && (
        <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          {success}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || status !== "available" || isCreating}
        className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
      >
        {isCreating ? "Creating Organization..." : "Create Organization"}
      </button>
    </form>
  );
}
