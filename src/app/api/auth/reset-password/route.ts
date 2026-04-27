import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/../lib/prisma";
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse, forbiddenResponse } from "@/services/api/response";
import { TokenPurpose } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword, confirmPassword } = body;

    if (!token || !newPassword || !confirmPassword) {
      return errorResponse("ข้อมูลไม่ครบถ้วน");
    }

    if (newPassword !== confirmPassword) {
      return errorResponse("รหัสผ่านไม่ตรงกัน");
    }

    // 1. ค้นหา Token
    const resetRecord = await prisma.verificationToken.findFirst({
      where: {
        token,
        purpose: TokenPurpose.PASSWORD_RESET,
      },
    });

    if (!resetRecord) {
      return notFoundResponse("Token ไม่ถูกต้องหรือไม่พบ");
    }

    if (resetRecord.used) {
      return forbiddenResponse("Token นี้ถูกใช้งานไปแล้ว");
    }

    if (resetRecord.expiresAt < new Date()) {
      return forbiddenResponse("Token หมดอายุแล้ว");
    }

    // 2. เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. อัปเดต User และ Token ใน Transaction
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId: resetRecord.userId },
        data: { password: hashedPassword },
      });

      await tx.verificationToken.update({
        where: { id: resetRecord.id },
        data: { used: true },
      });
    });

    return successResponse(null, "รีเซ็ตรหัสผ่านสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่");
  } catch (error: any) {
    console.error("Reset password error:", error);
    return serverErrorResponse(error.message || "เกิดข้อผิดพลาด");
  }
}
