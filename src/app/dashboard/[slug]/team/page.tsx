
import TeamContent from "./TeamContent";

export const instant = false;

interface TeamPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { slug } = await params;

  return <TeamContent slug={slug} />;
}
