import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { syncAuthenticatedUser } from "@/lib/user-sync";

function generateSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
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

    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name || name.length < 2 || name.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "Organization name must contain 2–80 characters",
        },
        { status: 400 },
      );
    }

    const slugInput =
      typeof body.slug === "string" && body.slug.trim() ? body.slug : name;

    const slug = generateSlug(slugInput);

    if (!slug || slug.length > 60) {
      return NextResponse.json(
        { success: false, message: "Invalid organization slug" },
        { status: 400 },
      );
    }

    const existingOrganization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrganization) {
      return NextResponse.json(
        { success: false, message: "Organization slug already exists" },
        { status: 409 },
      );
    }

    const organization = await prisma.$transaction(async (tx) => {
      return tx.organization.create({
        data: {
          name,
          slug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
        include: {
          members: {
            select: {
              id: true,
              role: true,
              userId: true,
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
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "Organization slug already exists" },
        { status: 409 },
      );
    }

    console.error("Organization creation error:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create organization" },
      { status: 500 },
    );
  }
}
