
import { auth } from "@clerk/nextjs/server";
import WelcomeHeader from "@/components/onboarding/WelcomeHeader";
import OnboardingOptions from "@/components/onboarding/OnboardingOptions";

export const instant = false;

export default async function OnboardingPage() {
  await auth.protect();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-5 py-12">
      <div className="w-full max-w-4xl space-y-12">
        <WelcomeHeader />
        <OnboardingOptions />
      </div>
    </main>
  );
}
