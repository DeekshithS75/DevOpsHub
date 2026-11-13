import { auth } from "@clerk/nextjs/server";

export async function getAuthenticatedUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return {
    clerkUserId: userId,
  };
}
