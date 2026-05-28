import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/../lib/prisma";
import { TokenPurpose } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/verification-status?status=error&message=Token missing", req.url));
  }

  try {
    // 1. ค้นหา Token
    const verificationRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        purpose: TokenPurpose.EMAIL_VERIFICATION,
      },
    });

    if (!verificationRecord) {
      return NextResponse.redirect(new URL("/auth/verification-status?status=error&message=Invalid token", req.url));
    }

    if (verificationRecord.used) {
        return NextResponse.redirect(new URL("/auth/verification-status?status=error&message=Token already used", req.url));
    }

    if (verificationRecord.expiresAt < new Date()) {
      return NextResponse.redirect(new URL("/auth/verification-status?status=error&message=Token expired", req.url));
    }

    // 2. อัปเดต User และ Token ใน Transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId: verificationRecord.userId },
        data: { isEmailVerified: true },
      });

      await tx.verificationToken.update({
        where: { id: verificationRecord.id },
        data: { used: true },
      });
    });

    return NextResponse.redirect(new URL("/auth/verification-status?status=success", req.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(new URL("/auth/verification-status?status=error&message=Server error", req.url));
  }
}
