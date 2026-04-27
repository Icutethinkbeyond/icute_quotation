

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
function getLocale(pathname: string) {
  return locales.find((loc) => pathname.startsWith(`/${loc}`)) || "th";
}

function getStoreCookieName() {
  return process.env.NODE_ENV === "production"
    ? "__Secure-accounting-session-token"
    : "accounting-session-token";
}

// -----------------------------
// 🔥 CORS helper (ใช้เฉพาะถ้าจำเป็น)
// -----------------------------
function withCors(req: NextRequest, res: NextResponse) {
  const origin = req.headers.get("origin");

  // 👉 production ควร whitelist
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    process.env.CUSTOMER_ENDPOINT,
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.headers.set("Access-Control-Allow-Origin", origin);
  }

  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
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
  // Root → redirect
  // -----------------------------
  const isRoot =
    pathname === "/" ||
    locales.some(
      (loc) =>
        pathname === `/${loc}` ||
        pathname === `/${loc}/` 
    );

  if (isRoot) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/sign-in`, req.url)
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
  // 1️⃣ STORE PROTECTED
  // -----------------------------
  if (pathname.includes("/protected")) {
    if (!merchantToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/auth/sign-in`, req.url)
      );
    }

    return withCors(req, intlMiddleware(req));
  }

  // -----------------------------
  // 2️⃣ STORE AUTH (กัน login ซ้ำ)
  // -----------------------------
  if (pathname.includes("/auth")) {
    if (merchantToken) {
      return NextResponse.redirect(
        new URL(`/${locale}/protected/dashboard`, req.url)
      );
    }

    return withCors(req, intlMiddleware(req));
  }

  // -----------------------------
  // 3️⃣ NOT FOUND
  // -----------------------------
  if (pathname.includes("/not-found")) {
    return NextResponse.redirect(
      new URL(`/${locale}/auth/sign-in`, req.url)
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