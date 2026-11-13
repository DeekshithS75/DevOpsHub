import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

export async function GET({ params }) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { slug } = await params;

    const membership = await prisma.organizationMember.findFirst({
      where: {
        userId: user.id,
        organization: {
          slug,
        },
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                members: true,
              },
            },
          },
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      organization: {
        ...membership.organization,
        memberCount: membership.organization._count.members,
        role: membership.role,
      },
    });
  } catch (error) {
    console.error("Organization details error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve organization details",
      },
      { status: 500 },
    );
  }
}
