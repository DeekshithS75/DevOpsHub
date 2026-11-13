
import TeamContent from "./TeamContent";

export const instant = false;

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  await params;

  return <TeamContent />;
}
