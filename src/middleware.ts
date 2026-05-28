

import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const locales = ["en", "th"] as const;

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: "th",
  localeDetection: false,
});

// -----------------------------
// Utils
// -----------------------------
function getLocale(pathname: string): typeof locales[number] {
  const found = locales.find((loc) => pathname.startsWith(`/${loc}`));
  if (found) {
    return found;
  }
  return "th";
}

function getStoreCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Secure-store-session-token"
    : "store-session-token";
}

// -----------------------------
// 🔥 CORS helper (ใช้เฉพาะถ้าจำเป็น)
// -----------------------------
function withCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");

  // 👉 production ควร whitelist
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  // res.headers.set(
  //   "Access-Control-Allow-Methods",
  //   "GET,POST,PUT,DELETE,OPTIONS"
  // );
  // res.headers.set(
  //   "Access-Control-Allow-Headers",
  //   "Content-Type, Authorization"
  // );
  // res.headers.set("accept", "application/json");

  return res;
}

// -----------------------------
// Middleware
// -----------------------------
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const locale = getLocale(pathname);

  // -----------------------------
  // 🔥 handle preflight (CORS)
  // -----------------------------
  if (req.method === "OPTIONS") {
    return withCors(req, new NextResponse(null, { status: 200 }));
  }

  // req.headers.set("accept", "application/json");

  // -----------------------------
  // Root → redirect (only bare "/", not /<locale>)
  // /<locale> serves its own page.tsx (homepage)
  // -----------------------------
  const isRoot = pathname === "/";

  if (isRoot) {
    return NextResponse.redirect(
      new URL(`/${locale}`, req.url)
    );
  }

   // -----------------------------
   // 🔐 get token (reuse)
   // -----------------------------
   const merchantToken = await getToken({
     req,
     secret: process.env.NEXTAUTH_SECRET,
     cookieName: getStoreCookieName(),
   });

    // -----------------------------
    // 🛡️ ROLE REDIRECT (CUSTOMER not access to /store/protected)
    // -----------------------------
    if (
      merchantToken &&
      (merchantToken as any).roleName === "CUSTOMER" &&
      pathname.includes("/store/protected")
    ) {
      // Try to get shop_username from token for personalized redirect
      const shopUsername = (merchantToken as any).shopUsername || (merchantToken as any).shop_name;
      if (shopUsername) {
        return NextResponse.redirect(new URL(`/${locale}/customer/${shopUsername}`, req.url));
      }
      // Fallback to customer list page
      return NextResponse.redirect(new URL(`/${locale}/customer`, req.url));
    }

    // -----------------------------
    // 🛡️ ROLE REDIRECT (STAFF/ADMIN not access to /customer protected routes)
    // -----------------------------
    if (
      merchantToken &&
      ((merchantToken as any).roleName === "STAFF" ||
       (merchantToken as any).roleName === "ADMIN") &&
      pathname.includes(`/customer/`) && 
      pathname.includes(`/protected/`)
    ) {
      // Extract the shop_username from the pathname
      // Example: /th/customer/abc123/protected/booking
      // We want to redirect to: /th/customer/abc123
      const pathnameParts = pathname.split('/');
      // We know the format: [ '', locale, 'customer', shopUsername, ... ]
      const localeIndex = pathnameParts.findIndex(part => locales.includes(part as typeof locales[number]));
      if (localeIndex !== -1 && pathnameParts.length > localeIndex + 2) {
        const shopUsername = pathnameParts[localeIndex + 2];
        const redirectUrl = `/${locale}/customer/${shopUsername}`;
        return NextResponse.redirect(new URL(redirectUrl, req.url));
      }
      // Fallback: redirect to customer root
      return NextResponse.redirect(new URL(`/${locale}/customer`, req.url));
    }

  // -----------------------------
  // 1️⃣ STORE PROTECTED
  // -----------------------------
  if (pathname.includes("/store/protected")) {
    if (!merchantToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/store/auth/sign-in`, req.url)
      );
    }

    return withCors(req, intlMiddleware(req));
  }

  // -----------------------------
  // 2️⃣ STORE AUTH (กัน login ซ้ำ)
  // -----------------------------
  if (pathname.includes("/store/auth")) {
    if (merchantToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/store/protected/dashboard`, req.url)
      );
    }

    return withCors(req, intlMiddleware(req));
  }

  // -----------------------------
  // 3️⃣ NOT FOUND
  // -----------------------------
  if (pathname.includes("/not-found")) {
    // return NextResponse.redirect(
    //   new URL(`/${locale}/store/auth/sign-in`, req.url)
    // );
    return NextResponse.redirect(
      new URL(`/${locale}/home`, req.url)
    );
  }

  // -----------------------------
  // 4️⃣ PUBLIC
  // -----------------------------
  return withCors(req, intlMiddleware(req));
}

// -----------------------------
// Config
// -----------------------------
export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};