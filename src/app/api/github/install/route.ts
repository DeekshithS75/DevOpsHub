
import { auth } from "@clerk/nextjs/server";
import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const appSlug = process.env.GITHUB_APP_SLUG;

  if (!appSlug) {
    return NextResponse.json(
      { success: false, message: "GitHub App slug is missing" },
      { status: 500 },
    );
  }

  const state = randomBytes(32).toString("hex");

  const installationUrl = new URL(
    `https://github.com/apps/${appSlug}/installations/new`,
  );

  installationUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(installationUrl);

  response.cookies.set("github_install_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}

