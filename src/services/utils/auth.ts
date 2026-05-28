import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export enum AuthType {
  user = "user",
  admin = "admin"
}

interface JWTUserPayload {
  id?: string;
  companyId?: string;
  email?: string;
  exp?: number;
  type?: AuthType;
  roleName?: string;
}

function getCookieName(type: AuthType) {
  return process.env.NODE_ENV === "production"
    ? "__Secure-accounting-session-token"
    : "accounting-session-token";
}

export async function getCurrentUserAndCompanyIdsByToken(
  request: NextRequest,
  type: AuthType = AuthType.user
): Promise<{ userId: string; companyId?: string; email: string; roleName?: string }> {
  
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: getCookieName(type),
  })) as JWTUserPayload | null;

  // 1️⃣ ไม่มี token
  if (!token) {
    throw new Error("Unauthorized");
  }

  // 2️⃣ ตรวจ expiration
  const currentTime = Math.floor(Date.now() / 1000);
  if (typeof token.exp === "number" && token.exp < currentTime) {
    throw new Error("Unauthorized");
  }

  const userId = token.id;
  const companyId = token.companyId;
  const email = token.email;
  const roleName = token.roleName;

  // 3️⃣ ตรวจ payload ขั้นต่ำ
  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  return {
    userId,
    companyId,
    email,
    roleName,
  };
}
