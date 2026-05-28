import { NextRequest } from "next/server";
import { prisma } from "@/../lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/services/api/response";
import { TokenPurpose } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/services/utils/emailServices";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return errorResponse("กรุณากรอกอีเมล");
    }

    // 1. ตรวจสอบว่ามีผู้ใช้อยู่หรือไม่
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("ไม่พบอีเมลนี้ในระบบ");
    }

    if (user.isEmailVerified) {
      return errorResponse("อีเมลนี้ได้รับการยืนยันแล้ว");
    }

    // 2. สร้าง Token ใหม่
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const verificationToken = await prisma.verificationToken.create({
      data: {
        userId: user.userId,
        token,
        purpose: TokenPurpose.EMAIL_VERIFICATION,
        expiresAt,
      },
    });

    // 3. ส่งอีเมลยืนยัน
    try {
      await sendVerificationEmail(email, verificationToken.token);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      return errorResponse("เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง");
    }

    return successResponse(null, "ส่งอีเมลยืนยันใหม่แล้ว กรุณาตรวจสอบในกล่องข้อความของคุณ");
  } catch (error: any) {
    console.error("Resend verify error:", error);
    return serverErrorResponse(error.message || "เกิดข้อผิดพลาด");
  }
}
