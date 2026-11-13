import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import Navbar from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export const instant = false;

export default async function DashboardPage() {
  await auth.protect();
  const user = await syncAuthenticatedUser();
  const memberships = user
    ? await prisma.organizationMember.findMany({
        where: { userId: user.id },
        select: {
          role: true,
          organization: { select: { name: true, slug: true, _count: { select: { members: true } } } },
        },
        orderBy: { joinedAt: "desc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-7xl p-6 sm:p-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Welcome to DevOpsHub</h2>
          <p className="mt-2 text-gray-600">Choose a workspace to continue.</p>
        </section>

        <section className="mt-8">
          <h3 className="mb-5 text-lg font-semibold text-gray-900">Your Organizations</h3>
          {memberships.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {memberships.map(({ organization, role }) => (
                <Link key={organization.slug} href={`/dashboard/${organization.slug}`} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-300">
                  <h4 className="font-semibold text-gray-900">{organization.name}</h4>
                  <p className="mt-2 text-sm text-gray-500">{organization._count.members} members · {role}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <p className="text-gray-600">You are not a member of any organization yet.</p>
              <Link href="/onboarding" className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-700">Create or join an organization</Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
