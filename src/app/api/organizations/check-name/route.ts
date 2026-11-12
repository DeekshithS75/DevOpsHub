import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export async function GET(request: NextRequest) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const name = request.nextUrl.searchParams.get("name");

    if (!name || name.trim().length < 2 || name.trim().length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name must contain 2–80 characters",
        },
        { status: 400 },
      );
    }

    const normalizedName = name.trim().replace(/\s+/g, " ").toLowerCase();

    const existingOrganization = await prisma.organization.findUnique({
      where: {
        normalizedName,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      success: true,
      available: !existingOrganization,
      message: existingOrganization
        ? "Organization name is already taken"
        : "Organization name is available",
    });
  } catch (error) {
    console.error("Organization name availability error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to check organization name availability",
      },
      { status: 500 },
    );
  }
}
