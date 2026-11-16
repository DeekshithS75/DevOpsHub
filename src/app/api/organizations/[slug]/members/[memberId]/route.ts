import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

const OWNER_ALLOWED_ROLES = ["ADMIN", "DEVELOPER", "VIEWER"] as const;
const ADMIN_ALLOWED_ROLES = ["DEVELOPER", "VIEWER"] as const;

type AssignableRole = (typeof OWNER_ALLOWED_ROLES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; memberId: string }> },
) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { slug, memberId } = await params;

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON request body" },
        { status: 400 },
      );
    }

    const role = (body as { role?: unknown })?.role;

    if (typeof role !== "string") {
      return NextResponse.json(
        { success: false, message: "A valid role is required" },
        { status: 400 },
      );
    }

    if (!OWNER_ALLOWED_ROLES.includes(role as AssignableRole)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const actorMembership = await tx.organizationMember.findFirst({
        where: {
          userId: user.id,
          organization: { slug },
        },
        select: {
          organizationId: true,
          role: true,
        },
      });

      if (!actorMembership) {
        return { error: "ORGANIZATION_NOT_FOUND" } as const;
      }

      if (!["OWNER", "ADMIN"].includes(actorMembership.role)) {
        return { error: "FORBIDDEN" } as const;
      }

      const targetMember = await tx.organizationMember.findFirst({
        where: {
          id: memberId,
          organizationId: actorMembership.organizationId,
        },
        select: {
          id: true,
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!targetMember) {
        return { error: "MEMBER_NOT_FOUND" } as const;
      }

      if (targetMember.role === "OWNER") {
        return { error: "OWNER_PROTECTED" } as const;
      }

      const allowedRoles =
        actorMembership.role === "OWNER"
          ? OWNER_ALLOWED_ROLES
          : ADMIN_ALLOWED_ROLES;

      if (!allowedRoles.includes(role as never)) {
        return { error: "ROLE_NOT_ALLOWED" } as const;
      }

      const updated = await tx.organizationMember.update({
        where: { id: targetMember.id },
        data: { role: role as AssignableRole },
        select: {
          id: true,
          role: true,
          joinedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return { member: updated } as const;
    });

    if ("error" in result) {
      switch (result.error) {
        case "ORGANIZATION_NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Organization not found" },
            { status: 404 },
          );

        case "FORBIDDEN":
          return NextResponse.json(
            {
              success: false,
              message: "You do not have permission to manage members",
            },
            { status: 403 },
          );

        case "MEMBER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Member not found in this organization",
            },
            { status: 404 },
          );

        case "OWNER_PROTECTED":
          return NextResponse.json(
            {
              success: false,
              message: "The organization owner cannot be modified",
            },
            { status: 403 },
          );

        case "ROLE_NOT_ALLOWED":
          return NextResponse.json(
            { success: false, message: "You cannot assign this role" },
            { status: 403 },
          );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Member role updated successfully",
      member: result.member,
    });
  } catch (error) {
    console.error("Member role update error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to update member role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string; memberId: string }> },
) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { slug, memberId } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const actorMembership = await tx.organizationMember.findFirst({
        where: {
          userId: user.id,
          organization: { slug },
        },
        select: {
          organizationId: true,
          role: true,
        },
      });

      if (!actorMembership) {
        return { error: "ORGANIZATION_NOT_FOUND" } as const;
      }

      if (!["OWNER", "ADMIN"].includes(actorMembership.role)) {
        return { error: "FORBIDDEN" } as const;
      }

      const targetMember = await tx.organizationMember.findFirst({
        where: {
          id: memberId,
          organizationId: actorMembership.organizationId,
        },
        select: {
          id: true,
          userId: true,
          role: true,
        },
      });

      if (!targetMember) {
        return { error: "MEMBER_NOT_FOUND" } as const;
      }

      if (targetMember.role === "OWNER") {
        return { error: "OWNER_PROTECTED" } as const;
      }

      if (targetMember.userId === user.id) {
        return { error: "SELF_REMOVAL_NOT_ALLOWED" } as const;
      }

      if (
        actorMembership.role === "ADMIN" &&
        !["DEVELOPER", "VIEWER"].includes(targetMember.role)
      ) {
        return { error: "ROLE_NOT_ALLOWED" } as const;
      }

      await tx.organizationMember.delete({
        where: { id: targetMember.id },
      });

      return { success: true } as const;
    });

    if ("error" in result) {
      switch (result.error) {
        case "ORGANIZATION_NOT_FOUND":
          return NextResponse.json(
            { success: false, message: "Organization not found" },
            { status: 404 },
          );

        case "FORBIDDEN":
          return NextResponse.json(
            {
              success: false,
              message: "You do not have permission to remove members",
            },
            { status: 403 },
          );

        case "MEMBER_NOT_FOUND":
          return NextResponse.json(
            {
              success: false,
              message: "Member not found in this organization",
            },
            { status: 404 },
          );

        case "OWNER_PROTECTED":
          return NextResponse.json(
            {
              success: false,
              message: "The organization owner cannot be removed",
            },
            { status: 403 },
          );

        case "SELF_REMOVAL_NOT_ALLOWED":
          return NextResponse.json(
            {
              success: false,
              message: "You cannot remove yourself through this endpoint",
            },
            { status: 403 },
          );

        case "ROLE_NOT_ALLOWED":
          return NextResponse.json(
            {
              success: false,
              message: "You cannot remove a member with this role",
            },
            { status: 403 },
          );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Organization member removal error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to remove organization member" },
      { status: 500 },
    );
  }
}
