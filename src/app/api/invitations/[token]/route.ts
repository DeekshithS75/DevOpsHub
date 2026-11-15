
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { success: false, valid: false, message: "Invalid invitation link" },
        { status: 404 },
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const invitation = await prisma.organizationInvitation.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        organization: {
          select: {
            name: true,
            slug: true,
          },
        },
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, valid: false, message: "Invitation not found" },
        { status: 404 },
      );
    }

    if (invitation.status === "PENDING" && invitation.expiresAt <= new Date()) {
      await prisma.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
        },
        data: {
          status: "EXPIRED",
        },
      });

      return NextResponse.json(
        { success: false, valid: false, message: "Invitation has expired" },
        { status: 410 },
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          message: `Invitation is ${invitation.status.toLowerCase()}`,
        },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
      invitation: {
        email: invitation.email,
        organizationName: invitation.organization.name,
        organizationSlug: invitation.organization.slug,
        role: invitation.role,
        inviterName:
          invitation.invitedBy.name || invitation.invitedBy.email,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error("Invitation validation error:", error);

    return NextResponse.json(
      {
        success: false,
        valid: false,
        message: "Failed to validate invitation",
      },
      { status: 500 },
    );
  }
}

