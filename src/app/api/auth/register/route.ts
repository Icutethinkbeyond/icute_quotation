import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/../lib/prisma";
import { successResponse, errorResponse, serverErrorResponse } from "@/services/api/response";
import { RoleName, TokenPurpose } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "@/services/utils/emailServices";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, companyName } = body;

    if (!email || !password || !name || !companyName) {
      return errorResponse("กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    // 1. ตรวจสอบว่ามีผู้ใช้รายนี้อยู่แล้วหรือไม่
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse("อีเมลนี้ถูกใช้งานไปแล้ว");
    }

    // 2. ค้นหา Role "ADMIN"
    let adminRole = await prisma.role.findUnique({
      where: { name: RoleName.ADMIN },
    });

    // ถ้าไม่มี Role ADMIN ให้สร้างใหม่
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: RoleName.ADMIN,
          description: "Administrator",
          permissions: JSON.stringify(["ALL"]),
        },
      });
    }

    // 3. เข้ารหัสรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. สร้าง User, Company และ CompanyUser ใน Transaction
    const result = await prisma.$transaction(async (tx) => {
      // สร้างผู้ใช้
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          roleId: adminRole!.roleId,
          userStatus: "ACTIVE",
          isEmailVerified: false,
        },
      });

      // สร้างบริษัท
      const company = await tx.company.create({
        data: {
          companyName,
          companyEmail: email,
        },
      });

      // เชื่อมผู้ใช้กับบริษัท
      await tx.companyUser.create({
        data: {
          userId: user.userId,
          companyId: company.companyId,
        },
      });

      // สร้าง Token ยืนยันอีเมล
      const token = uuidv4();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // หมดอายุใน 24 ชั่วโมง

      const verificationToken = await tx.verificationToken.create({
        data: {
          userId: user.userId,
          token,
          purpose: TokenPurpose.EMAIL_VERIFICATION,
          expiresAt,
        },
      });

      return { user, company, verificationToken };
    });

    // 5. ส่งอีเมลยืนยัน
    try {
        await sendVerificationEmail(email, result.verificationToken.token);
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // ไม่ return error เพราะสร้าง account สำเร็จแล้ว
    }

    return successResponse(
      { userId: result.user.userId },
      "ลงทะเบียนสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันตัวตน",
      201
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return serverErrorResponse(error.message || "เกิดข้อผิดพลาดในการลงทะเบียน");
  }
}
