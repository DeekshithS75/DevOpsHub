import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLowerCase();
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim().replace(/\s+/g, " ")
        : "";

    if (name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name must contain 2–80 characters",
        },
        { status: 400 },
      );
    }

    const normalizedName = normalizeName(name);
    const baseSlug = generateSlug(name);

    if (!baseSlug || baseSlug.length > 60) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid organization name for slug generation",
        },
        { status: 400 },
      );
    }

    const existingOrganization = await prisma.organization.findUnique({
      where: { normalizedName },
      select: { id: true },
    });

    if (existingOrganization) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name is already taken",
        },
        { status: 409 },
      );
    }

    const organization = await prisma.$transaction(async (tx) => {
      const existingSlugs = await tx.organization.findMany({
        where: {
          slug: {
            startsWith: baseSlug,
          },
        },
        select: {
          slug: true,
        },
      });

      const usedSlugs = new Set(
        existingSlugs.map((organization) => organization.slug),
      );

      let slug = baseSlug;
      let suffix = 2;

      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      return tx.organization.create({
        data: {
          name,
          normalizedName,
          slug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          members: {
            select: {
              role: true,
            },
          },
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Organization created successfully",
        organization,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Organization name or slug already exists. Please try again.",
        },
        { status: 409 },
      );
    }

    console.error("Organization creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create organization",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await syncAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const memberships = await prisma.organizationMember.findMany({
      where: {
        userId: user.id,
      },
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const organizations = memberships.map((membership) => ({
      ...membership.organization,
      role: membership.role,
    }));

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error("Organization listing error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve organizations",
      },
      { status: 500 },
    );
  }
}
