
import { createHash } from "node:crypto";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const { token } = await params;

    if (!token || !/^[a-f0-9]{64}$/i.test(token)) {
      return NextResponse.json(
        { success: false, message: "Invalid invitation link" },
        { status: 404 },
      );
    }

    const verifiedEmails = clerkUser.emailAddresses
      .filter(
        (address) => address.verification?.status === "verified",
      )
      .map((address) => normalizeEmail(address.emailAddress));

    if (verifiedEmails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Your account must have a verified email address",
        },
        { status: 403 },
      );
    }

    const tokenHash = createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const invitation =
        await tx.organizationInvitation.findUnique({
          where: { tokenHash },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            expiresAt: true,
            organizationId: true,
            organization: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        });

      if (!invitation) {
        return {
          error: "NOT_FOUND",
        } as const;
      }

      if (invitation.status !== "PENDING") {
        return {
          error: "INVALID_STATUS",
          status: invitation.status,
        } as const;
      }

      const now = new Date();

      if (invitation.expiresAt <= now) {
        await tx.organizationInvitation.updateMany({
          where: {
            id: invitation.id,
            status: "PENDING",
          },
          data: {
            status: "EXPIRED",
          },
        });

        return {
          error: "EXPIRED",
        } as const;
      }

      if (!verifiedEmails.includes(normalizeEmail(invitation.email))) {
        return {
          error: "EMAIL_MISMATCH",
        } as const;
      }

      if (invitation.role === "OWNER") {
        return {
          error: "INVALID_ROLE",
        } as const;
      }

      const updated = await tx.organizationInvitation.updateMany({
        where: {
          id: invitation.id,
          status: "PENDING",
          expiresAt: { gt: now },
        },
        data: {
          status: "ACCEPTED",
          acceptedAt: now,
        },
      });

      if (updated.count !== 1) {
        return {
          error: "ALREADY_PROCESSED",
        } as const;
      }

      await tx.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
      });

      return {
        success: true,
        organization: invitation.organization,
      } as const;
    });

    if ("error" in result) {
      switch (result.error) {
        case "NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Invitation not found" },
            { status: 404 },
          );

        case "EXPIRED":
          return NextResponse.json(
            { success: false, message: "Invitation has expired" },
            { status: 410 },
          );

        case "EMAIL_MISMATCH":
          return NextResponse.json(
            {
              success: false,
              message:
                "Your verified email does not match the invited email address",
            },
            { status: 403 },
          );

        case "INVALID_ROLE":
          return NextResponse.json(
            { success: false, message: "OWNER role cannot be assigned through invitations" },
            { status: 400 },
          );

        default:
          return NextResponse.json(
            {
              success: false,
              message: "This invitation is no longer available",
            },
            { status: 409 },
          );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invitation accepted successfully",
      organization: result.organization,
    });
  } catch (error) {
    console.error("Accept organization invitation error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "You are already a member of this organization",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to accept invitation",
      },
      { status: 500 },
    );
  }
}

