import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export const instant = false;

interface OrganizationDashboardProps {
  params: Promise<{ slug: string }>;
}

export default async function OrganizationDashboard({
  params,
}: OrganizationDashboardProps) {
  const [{ slug }, user] = await Promise.all([params, syncAuthenticatedUser()]);

  if (!user) notFound();

  const membership = await prisma.organizationMember.findFirst({
    where: { userId: user.id, organization: { slug } },
    select: {
      role: true,
      organization: {
        select: {
          name: true,
          slug: true,
          createdAt: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  if (!membership) notFound();

  const organization = membership.organization;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section>
        <p className="text-sm font-medium text-blue-600">Organization Overview</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{organization.name}</h1>
        <p className="mt-2 text-gray-500">Manage your organization&apos;s workspace.</p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <OverviewCard label="Organization Members" value={organization._count.members} />
        <OverviewCard label="Your Role" value={membership.role} />
        <OverviewCard label="Created On" value={organization.createdAt.toLocaleDateString()} />
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Organization Details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-gray-500">Organization Name</dt><dd className="mt-1 font-medium text-gray-900">{organization.name}</dd></div>
          <div><dt className="text-sm text-gray-500">Organization Slug</dt><dd className="mt-1 font-medium text-gray-900">{organization.slug}</dd></div>
        </dl>
      </section>
    </div>
  );
}

function OverviewCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
