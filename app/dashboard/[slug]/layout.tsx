
import OrganizationSidebar from "@/components/organization/OrganizationSidebar";

interface OrganizationLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function OrganizationLayout({
  children,
  params,
}: OrganizationLayoutProps) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OrganizationSidebar slug={slug} />

      <main className="min-w-0 flex-1 px-5 pb-8 pt-20 sm:px-8 md:pt-8">
        {children}
      </main>
    </div>
  );
}
