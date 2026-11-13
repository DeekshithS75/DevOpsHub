
import Link from "next/link";
import { ReactNode } from "react";

interface OnboardingCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  buttonText: string;
}

export default function OnboardingCard({
  title,
  description,
  href,
  icon,
  buttonText,
}: OnboardingCardProps) {
  return (
    <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h2 className="text-xl font-semibold text-gray-900">
        {title}
      </h2>

      <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
      >
        {buttonText}
      </Link>
    </div>
  );
}
