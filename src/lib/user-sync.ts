import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function syncAuthenticatedUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;

  if (!email) {
    throw new Error("Authenticated user has no primary email address");
  }

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  const user = await prisma.user.upsert({
    where: {
      clerkUserId: clerkUser.id,
    },
    create: {
      clerkUserId: clerkUser.id,
      email,
      name,
    },
    update: {
      email,
      name,
    },
  });

  return user;
}
