
import OnboardingCard from "./OnboardingCard";

export default function OnboardingOptions() {
  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <OnboardingCard
        title="Create an Organization"
        description="Start a new workspace for your team. Manage projects, deployments, integrations and team members in one place."
        href="/organizations/new"
        buttonText="Create Organization"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 21V9h6v12M9 12h6M9 15h6" />
          </svg>
        }
      />

      <OnboardingCard
        title="Join an Organization"
        description="Already part of a team? Find an existing organization and request access to collaborate with its members."
        href="/organizations/join"
        buttonText="Find Organization"
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="10" cy="7" r="4" />
            <path d="M20 8v6M17 11h6" />
          </svg>
        }
      />
    </div>
  );
}
