import { auth } from "@clerk/nextjs/server";
import Navbar from "../../components/layout/Navbar";

export const instant = false;
interface OverviewCardProps {
  title: string;
  value: number;
  description: string;
}

function OverviewCard({ title, value, description }: OverviewCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gray-700">{title}</h3>

      <p className="mt-3 text-3xl font-bold text-gray-900">{value}</p>

      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

export default async function DashboardPage() {
  await auth.protect();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Dashboard Content */}
      <div className="mx-auto max-w-7xl p-6 sm:p-8">
        {/* Welcome Section */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Welcome to DevOpsHub!
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your projects and deployments from one place.
          </p>
        </section>

        {/* Overview Cards */}
        <section className="mt-8">
          <h3 className="mb-5 text-lg font-semibold text-gray-900">Overview</h3>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewCard
              title="Total Projects"
              value={0}
              description="Projects connected to DevOpsHub"
            />

            <OverviewCard
              title="Active Deployments"
              value={0}
              description="Currently running deployments"
            />

            <OverviewCard
              title="Team Members"
              value={0}
              description="Members in your organization"
            />
          </div>
        </section>

        {/* Getting Started */}
        <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-900">Get Started</h3>

          <p className="mt-2 text-gray-600">
            Your DevOpsHub workspace is ready. Project management, GitHub
            integrations, and deployment features will be available in upcoming
            phases.
          </p>
        </section>
      </div>
    </main>
  );
}
