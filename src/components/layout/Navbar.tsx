
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 sm:px-8">
      <Link href="/dashboard">
        <h1 className="text-2xl font-bold text-blue-600">
          DevOpsHub
        </h1>
      </Link>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-500 sm:block">
          Deployment Management Platform
        </span>

        <UserButton />
      </div>
    </header>
  );
}
