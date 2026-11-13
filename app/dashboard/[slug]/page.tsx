export const instant = false;
interface OrganizationDashboardProps {
  params: Promise<{ slug: string }>;
}

// Temporary sample data.
// Replace with GET /api/organizations/[slug] after backend integration.
const organizations = [
  {
    name: "My New Company",
    slug: "my-new-company",
    role: "OWNER",
    memberCount: 1,
    createdAt: "November 12, 2026",
  },
  {
    name: "Cloud Technologies",
    slug: "cloud-technologies",
    role: "DEVELOPER",
    memberCount: 5,
    createdAt: "October 20, 2026",
  },
  {
    name: "DevOps Team",
    slug: "devops-team",
    role: "VIEWER",
    memberCount: 8,
    createdAt: "September 15, 2026",
  },
];

export default async function OrganizationDashboard({
  params,
}: OrganizationDashboardProps) {
  const { slug } = await params;

  const organization = organizations.find(
    (org) => org.slug === slug
  );

  if (!organization) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Organization Not Found
          </h1>
          <p className="mt-2 text-gray-500">
            The organization you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Organization Header */}
      <section>
        <p className="text-sm font-medium text-blue-600">
          Organization Overview
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          {organization.name}
        </h1>

        <p className="mt-2 text-gray-500">
          Manage your organization's projects and deployments.
        </p>
      </section>

      {/* Overview Cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Organization Members
          </p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">
            {organization.memberCount}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Your Role
          </p>

          <h2 className="mt-3 text-3xl font-bold text-blue-600">
            {organization.role}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">
            Created On
          </p>

          <h2 className="mt-3 text-xl font-bold text-gray-900">
            {organization.createdAt}
          </h2>
        </div>
      </section>

      {/* Organization Details */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Organization Details
        </h2>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-sm text-gray-500">
              Organization Name
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {organization.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Organization Slug
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {organization.slug}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Your Role
            </p>
            <p className="mt-1 font-medium text-gray-900">
              {organization.role}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
