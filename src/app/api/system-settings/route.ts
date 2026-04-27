export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/../lib/prisma";
import { successResponse, errorResponse, forbiddenResponse, serverErrorResponse } from "@/services/api/response";
import { RoleName } from "@prisma/client";
import { getCurrentUserAndCompanyIdsByToken } from "@/services/utils/auth";

const SETTING_KEYS: Record<string, string[]> = {
  line: ["LINE_CLIENT_ID", "LINE_CLIENT_SECRET", "LINE_CHANNEL_ID", "LINE_HELP_URL_TH", "LINE_HELP_URL_EN"],
  cloudinary: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
  email: ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_SECURE", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM", "EMAIL_HELP_URL_TH", "EMAIL_HELP_URL_EN"],
};

const ALL_GROUPS = Object.keys(SETTING_KEYS);

const HELP_LINK_KEYS = ["LINE_HELP_URL_TH", "LINE_HELP_URL_EN", "EMAIL_HELP_URL_TH", "EMAIL_HELP_URL_EN"];

// GET /api/system-settings?group=line|cloudinary|email
export async function GET(request: NextRequest) {
  try {
    const { roleName } = await getCurrentUserAndCompanyIdsByToken(request);

    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");

    const groups = group && ALL_GROUPS.includes(group) ? [group] : ALL_GROUPS;

    // Only SUPERADMIN can get full settings. Others only get help links.
    const isSuperAdmin = roleName === RoleName.SUPERADMIN;

    let keys: string[];
    if (isSuperAdmin) {
      keys = groups.flatMap((g) => SETTING_KEYS[g]);
    } else {
      keys = HELP_LINK_KEYS;
    }

    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const settingsMap: Record<string, string> = {};
    for (const s of settings) {
      settingsMap[s.key] = s.value;
    }

    const result: Record<string, Record<string, string>> = {};
    for (const g of groups) {
      result[g] = {};
      
      if (isSuperAdmin) {
        for (const key of SETTING_KEYS[g]) {
          result[g][key] = settingsMap[key] || "";
        }
      } else {
        if (g === "line") {
          result[g]["LINE_HELP_URL_TH"] = settingsMap["LINE_HELP_URL_TH"] || "";
          result[g]["LINE_HELP_URL_EN"] = settingsMap["LINE_HELP_URL_EN"] || "";
        } else if (g === "email") {
          result[g]["EMAIL_HELP_URL_TH"] = settingsMap["EMAIL_HELP_URL_TH"] || "";
          result[g]["EMAIL_HELP_URL_EN"] = settingsMap["EMAIL_HELP_URL_EN"] || "";
        }
      }
    }

    return successResponse(result);
  } catch (error: any) {
    console.error("System Settings GET Error:", error);
    if (error.message === "Unauthorized") return forbiddenResponse();
    return serverErrorResponse();
  }
}

// PATCH /api/system-settings
export async function PATCH(request: NextRequest) {
  try {
    const { roleName } = await getCurrentUserAndCompanyIdsByToken(request);

    if (roleName !== RoleName.SUPERADMIN) {
      return forbiddenResponse("มีสิทธิ์เฉพาะ SUPERADMIN เท่านั้น");
    }

    const body = await request.json();
    const { group, settings } = body as {
      group: string;
      settings: Record<string, string>;
    };

    if (!group || !ALL_GROUPS.includes(group)) {
      return errorResponse("Invalid group", 400);
    }

    const allowedKeys = SETTING_KEYS[group];

    // Upsert each setting
    const promises = Object.entries(settings)
      .filter(([key]) => allowedKeys.includes(key))
      .map(([key, value]) =>
        prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(value || "") },
          create: { key, value: String(value || ""), group },
        })
      );

    await Promise.all(promises);

    return successResponse(null, "บันทึกการตั้งค่าสำเร็จ");
  } catch (error: any) {
    console.error("System Settings PATCH Error:", error);
    if (error.message === "Unauthorized") return forbiddenResponse();
    return serverErrorResponse();
  }
}
