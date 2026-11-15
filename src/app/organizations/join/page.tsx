import Link from "next/link";

export default function JoinOrganizationPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-5 py-12">
      <section className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-blue-600">Organization Membership</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Join an Organization</h1>
        <p className="mt-3 text-gray-600">
          You can join an organization using an invitation link sent by one of its owners or admins.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
          Go to Dashboard
        </Link>
      </section>
    </main>
  );
}
