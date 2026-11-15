
import InvitationClient from "./InvitationClient";

export const instant = false;

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <InvitationClient token={token} />;
}
