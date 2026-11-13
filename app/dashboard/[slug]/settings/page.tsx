
import OrganizationSettings from "./OrganizationSettings";

export const instant = false;

interface SettingsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsPage({
  params,
}: SettingsPageProps) {
  const { slug } = await params;

  return <OrganizationSettings slug={slug} />;
}
