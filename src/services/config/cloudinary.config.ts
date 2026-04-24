import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

  // Reconfigure Cloudinary from DB system settings if env vars are missing
  export async function ensureCloudinaryConfig() {
    const config = cloudinary.config();
    if (config.cloud_name && config.api_key && config.api_secret) return;

    try {
      const { prisma } = await import("@/../lib/prisma");
      
      // Try to access systemSetting table - may not exist in this project's schema
      try {
        const settings = await (prisma as any).systemSetting?.findMany({
          where: { group: "cloudinary" },
        });
        if (settings) {
          const map: Record<string, string> = {};
          for (const s of settings) {
            map[s.key] = s.value;
          }
          if (map.CLOUDINARY_CLOUD_NAME && map.CLOUDINARY_API_KEY && map.CLOUDINARY_API_SECRET) {
            cloudinary.config({
              cloud_name: map.CLOUDINARY_CLOUD_NAME,
              api_key: map.CLOUDINARY_API_KEY,
              api_secret: map.CLOUDINARY_API_SECRET,
            });
          }
        }
      } catch (e) {
        // Table doesn't exist in schema or other error - keep env vars
      }
    } catch {
      // DB not available or no settings found, keep env vars
    }
  }

export default cloudinary;