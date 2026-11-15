import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";
import { sendOrganizationInvitationEmail } from "@/lib/emails/organization-invitation";

const OWNER_ROLES = ["ADMIN", "DEVELOPER", "VIEWER"] as const;
const ADMIN_ROLES = ["DEVELOPER", "VIEWER"] as const;

type InvitationRole = (typeof OWNER_ROLES)[number];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  let invitationId: string | null = null;

  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { slug } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
      },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      select: {
        role: true,
      },
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this organization",
        },
        { status: 403 },
      );
    }

    if (!["OWNER", "ADMIN"].includes(membership.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "You do not have permission to invite members",
        },
        { status: 403 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const payload = body as {
      email?: unknown;
      role?: unknown;
    };

    if (typeof payload.email !== "string" || typeof payload.role !== "string") {
      return NextResponse.json(
        { success: false, message: "Email and role are required" },
        { status: 400 },
      );
    }

    const email = normalizeEmail(payload.email);
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email.length > 254 || !emailPattern.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address" },
        { status: 400 },
      );
    }

    const allowedRoles: readonly InvitationRole[] =
      membership.role === "OWNER" ? OWNER_ROLES : ADMIN_ROLES;

    if (!allowedRoles.includes(payload.role as InvitationRole)) {
      return NextResponse.json(
        { success: false, message: "You cannot assign this role" },
        { status: 400 },
      );
    }

    const role = payload.role as InvitationRole;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId: organization.id,
          },
        },
        select: { id: true },
      });

      if (existingMembership) {
        return NextResponse.json(
          {
            success: false,
            message: "This user is already an organization member",
          },
          { status: 409 },
        );
      }
    }

    const now = new Date();

    await prisma.organizationInvitation.updateMany({
      where: {
        organizationId: organization.id,
        email,
        status: "PENDING",
        expiresAt: { lte: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    const existingInvitation = await prisma.organizationInvitation.findFirst({
      where: {
        organizationId: organization.id,
        email,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      select: { id: true },
    });

    if (existingInvitation) {
      return NextResponse.json(
        {
          success: false,
          message: "A pending invitation already exists for this email",
        },
        { status: 409 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");

    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        tokenHash,
        role,
        expiresAt,
        invitedById: user.id,
        organizationId: organization.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
      },
    });

    invitationId = invitation.id;

    try {
      await sendOrganizationInvitationEmail({
        email,
        organizationName: organization.name,
        inviterName: user.name || user.email,
        role,
        token,
      });
    } catch (emailError) {
      await prisma.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: "REVOKED" },
      });

      console.error("Invitation email delivery failed:", emailError);

      return NextResponse.json(
        {
          success: false,
          message: "Invitation could not be sent. Please try again.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Invitation sent successfully",
        invitation,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Organization invitation creation error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create organization invitation" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { slug } = await params;

    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!organization) {
      return NextResponse.json(
        { success: false, message: "Organization not found" },
        { status: 404 },
      );
    }

    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: organization.id,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          message: "You are not a member of this organization",
        },
        { status: 403 },
      );
    }

    const now = new Date();

    await prisma.organizationInvitation.updateMany({
      where: {
        organizationId: organization.id,
        status: "PENDING",
        expiresAt: { lte: now },
      },
      data: { status: "EXPIRED" },
    });

    const invitations = await prisma.organizationInvitation.findMany({
      where: {
        organizationId: organization.id,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        expiresAt: true,
        createdAt: true,
        invitedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    console.error("Get organization invitations error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to fetch organization invitations" },
      { status: 500 },
    );
  }
}
