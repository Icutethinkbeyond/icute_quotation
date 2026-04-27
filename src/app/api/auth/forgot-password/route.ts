import { NextRequest } from "next/server";
import { prisma } from "@/../lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/services/api/response";
import { TokenPurpose } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sendResetPasswordEmail } from "@/services/utils/emailServices";

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
      // เพื่อความปลอดภัย ไม่ควรบอกว่าไม่เจออีเมล แต่ในที่นี้อาจจะบอกเพื่อ UX
      return errorResponse("ไม่พบอีเมลนี้ในระบบ");
    }

    // 2. สร้าง Token สำหรับรีเซ็ตรหัสผ่าน
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // หมดอายุใน 1 ชั่วโมง

    const resetToken = await prisma.verificationToken.create({
      data: {
        userId: user.userId,
        token,
        purpose: TokenPurpose.PASSWORD_RESET,
        expiresAt,
      },
    });

    // 3. ส่งอีเมลรีเซ็ตรหัสผ่าน
    try {
      await sendResetPasswordEmail(email, resetToken.token);
    } catch (emailError) {
      console.error("Failed to send reset password email:", emailError);
      return errorResponse("เกิดข้อผิดพลาดในการส่งอีเมล กรุณาลองใหม่อีกครั้ง");
    }

    return successResponse(
      null,
      "ส่งอีเมลรีเซ็ตรหัสผ่านแล้ว กรุณาตรวจสอบในกล่องข้อความของคุณ"
    );
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return serverErrorResponse(error.message || "เกิดข้อผิดพลาด");
  }
}
