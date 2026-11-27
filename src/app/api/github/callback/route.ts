import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";
import { createGitHubAppJwt } from "@/lib/github-app";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  const storedState = request.cookies.get("github_install_state")?.value;

  const returnedState = request.nextUrl.searchParams.get("state");

  const installationId = request.nextUrl.searchParams.get("installation_id");

  const setupAction = request.nextUrl.searchParams.get("setup_action");

  const redirectUrl = new URL("/", request.url);

  const fail = (message: string, status: number) => {
    const response = NextResponse.json({ success: false, message }, { status });

    response.cookies.delete("github_install_state");
    return response;
  };

  if (!userId) {
    return fail("Unauthorized", 401);
  }

  if (!storedState || !returnedState || storedState !== returnedState) {
    return fail("Invalid installation state", 403);
  }

  if (
    !installationId ||
    !/^\d+$/.test(installationId) ||
    !["install", "update"].includes(setupAction ?? "")
  ) {
    return fail("Invalid installation details", 400);
  }

  try {
    const appJwt = await createGitHubAppJwt();

    const githubResponse = await fetch(
      `https://api.github.com/app/installations/${installationId}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${appJwt}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        cache: "no-store",
      },
    );

    const installation = await githubResponse.json();

    if (!githubResponse.ok) {
      return fail("Unable to verify GitHub installation", 400);
    }

    if (
      !installation.account?.id ||
      !installation.account?.login ||
      !installation.account?.type
    ) {
      return fail("Invalid GitHub account details", 400);
    }

    const user = await syncAuthenticatedUser();

    if (!user) {
      return fail("Unable to identify DevOpsHub user", 401);
    }

    await prisma.gitHubConnection.upsert({
      where: {
        userId: user.id,
      },
      update: {
        installationId: BigInt(String(installation.id)),
        accountId: BigInt(String(installation.account.id)),
        accountLogin: installation.account.login,
        accountType: installation.account.type,
      },
      create: {
        userId: user.id,
        installationId: BigInt(String(installation.id)),
        accountId: BigInt(String(installation.account.id)),
        accountLogin: installation.account.login,
        accountType: installation.account.type,
      },
    });

    redirectUrl.searchParams.set("github", "connected");

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("github_install_state");

    return response;
  } catch {
    return fail("GitHub connection failed", 500);
  }
}
