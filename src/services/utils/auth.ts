import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// export type AuthType = "store" | "customer";

export enum AuthType {
  store = "store",
  customer = "customer",
  admin = "admin"
}

interface JWTUserPayload {
  id?: string;
  storeId?: string;
  email?: string;
  exp?: number;
  type?: AuthType;
  roleName?: string;
}

function getCookieName(type: AuthType) {
  if (type === AuthType.store) {
    return process.env.NODE_ENV === "production"
      ? "__Secure-store-session-token"
      : "store-session-token";
  }

  return process.env.NODE_ENV === "production"
    ? "__Secure-customer-session-token"
    : "customer-session-token";
}

export async function getCurrentUserAndStoreIdsByToken(
  request: NextRequest,
  type: AuthType
): Promise<{ userId: string; storeId?: string; email: string; roleName?: string }> {
  
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

  // 3️⃣ ตรวจ type กันข้ามฝั่ง
  if (token.type !== type) {
    throw new Error("Unauthorized");
  }

  // console.log(token)

  const userId = token.id;
  const storeId = token.storeId;
  const email = token.email;
  const roleName = token.roleName;

  // 4️⃣ ตรวจ payload ขั้นต่ำ
  if (!userId || !email) {
    throw new Error("Unauthorized");
  }

  if(roleName !== "ADMIN"){
  // 5️⃣ ถ้าเป็น store ต้องมี storeId
    if (type === "store" && !storeId) {
        throw new Error("Unauthorized");
      }
  }

  return {
    userId,
    storeId,
    email,
    roleName,
  };
}
