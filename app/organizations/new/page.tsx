
import { auth } from "@clerk/nextjs/server";
import OrganizationForm from "@/components/organization/OrganizationForm";

export const instant = false;

export default async function CreateOrganizationPage() {
  await auth.protect();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">
          Create an Organization
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Create a workspace to manage your projects, deployments and team.
        </p>

        <div className="mt-8">
          <OrganizationForm />
        </div>
      </div>
    </main>
  );
}
