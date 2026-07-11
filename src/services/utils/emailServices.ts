import nodemailer from "nodemailer";
import { prisma } from "@/../lib/prisma";
import dayjs from "dayjs";
import 'dayjs/locale/th';
import { NotificationType } from "@prisma/client";

// ========================================
// SMTP CONFIG RESOLUTION (2 tiers)
// ========================================

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

/**
 * Resolve SMTP config with priority:
 * 1. System-level SMTP from SystemSetting table
 * 2. Environment variables (fallback)
 */
async function resolveSmtpConfig(): Promise<SmtpConfig> {
  // Tier 1: System-level SMTP from SystemSetting
  const systemKeys = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_SECURE", "EMAIL_USER", "EMAIL_PASSWORD", "EMAIL_FROM"];
  const systemSettings = await prisma.systemSetting.findMany({
    where: { key: { in: systemKeys } },
  });

  const settingsMap: Record<string, string> = {};
  for (const s of systemSettings) {
    settingsMap[s.key] = s.value;
  }

  if (settingsMap.EMAIL_HOST && settingsMap.EMAIL_USER && settingsMap.EMAIL_PASSWORD) {
    return {
      host: settingsMap.EMAIL_HOST,
      port: Number(settingsMap.EMAIL_PORT) || 587,
      secure: settingsMap.EMAIL_SECURE === "true",
      user: settingsMap.EMAIL_USER,
      password: settingsMap.EMAIL_PASSWORD,
      from: settingsMap.EMAIL_FROM || settingsMap.EMAIL_USER,
    };
  }

  // Tier 2: Environment variables (fallback)
  return {
    host: process.env.EMAIL_HOST || "",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === "true",
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || "",
  };
}

// ========================================
// EMAIL LOGGING
// ========================================

async function logEmail(
  userId: string | null | undefined,
  to: string,
  subject: string,
  type: string,
  success: boolean,
  error?: string
) {
  if (!userId) return;
  try {
    await prisma.emailLog.create({
      data: { userId, to, subject, type, success, error: error || null },
    });
  } catch (err) {
    console.error("Failed to log email:", err);
  }
}

// ========================================
// CORE SEND MAIL
// ========================================

export async function sendMail(
  to: string,
  subject: string,
  html: string,
  options?: { userId?: string | null; type?: string; smtpConfig?: SmtpConfig }
): Promise<boolean> {
  try {
    const smtp = options?.smtpConfig || await resolveSmtpConfig();

    if (!smtp.host || !smtp.user || !smtp.password) {
      console.error("Email SMTP not configured");
      await logEmail(options?.userId, to, subject, options?.type || "general", false, "SMTP not configured");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.password },
    });

    await transporter.sendMail({
      from: `"iCute Booking" <${smtp.from}>`,
      to,
      subject,
      html,
    });

    await logEmail(options?.userId, to, subject, options?.type || "general", true);
    return true;
  } catch (error: any) {
    console.error("Error sending email:", error);
    await logEmail(options?.userId, to, subject, options?.type || "general", false, error?.message || "Unknown error");
    return false;
  }
}

// ========================================
// HTML TEMPLATE
// ========================================

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export function getHtmlTemplate(content: string, brandName: string = "iCute Booking") {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #182E4E; padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 40px 30px; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    .button { display: inline-block; padding: 14px 30px; background-color: #3BB173; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .divider { border-top: 1px solid #e5e7eb; margin: 30px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .info-label { font-weight: 600; color: #6b7280; font-size: 14px; }
    .info-value { font-weight: 500; color: #1e293b; font-size: 14px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }
    .status-confirmed { background: #dcfce7; color: #166534; }
    .status-cancelled { background: #fee2e2; color: #991b1b; }
    .status-rescheduled { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${brandName}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.<br>
      ระบบจัดการการจองคิวออนไลน์
    </div>
  </div>
</body>
</html>`;
}

// ========================================
// AUTH EMAILS (System SMTP - no storeId)
// ========================================

export async function sendVerificationEmail(toEmail: string, token: string, userId?: string) {
  const verificationLink = `${BASE_URL}/api/auth/verify-email?token=${token}`;

  const content = `
    <h2>สวัสดีครับ/ค่ะ,</h2>
    <p>ขอบคุณที่ร่วมเป็นส่วนหนึ่งของ iCute Account! กรุณายืนยันอีเมลโดยคลิกปุ่มด้านล่าง:</p>
    <div style="text-align: center;">
      <a href="${verificationLink}" class="button">ยืนยันอีเมลของคุณ</a>
    </div>
    <p style="word-break: break-all; font-size: 14px; color: #3BB173;">${verificationLink}</p>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #6b7280;">ลิงก์นี้จะมีอายุ 24 ชั่วโมง หากคุณไม่ได้ลงทะเบียน กรุณาเพิกเฉย</p>
  `;

  return await sendMail(toEmail, "ยืนยันอีเมลสำหรับ iCute Account", getHtmlTemplate(content), { userId, type: "verification" });
}

export async function sendResetPasswordEmail(toEmail: string, token: string, userId?: string) {
  const resetLink = `${BASE_URL}/auth/reset-password?token=${token}`;

  const content = `
    <h2>คำขอรีเซ็ตรหัสผ่าน</h2>
    <p>เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีที่ผูกกับอีเมลนี้ กรุณาคลิกปุ่มด้านล่าง:</p>
    <div style="text-align: center;">
      <a href="${resetLink}" class="button">รีเซ็ตรหัสผ่าน</a>
    </div>
    <p style="word-break: break-all; font-size: 14px; color: #3BB173;">${resetLink}</p>
    <div class="divider"></div>
    <p style="font-size: 14px; color: #6b7280;">ลิงก์นี้จะมีอายุ 1 ชั่วโมง หากคุณไม่ได้ร้องขอ กรุณาเพิกเฉย</p>
  `;

  return await sendMail(toEmail, "รีเซ็ตรหัสผ่าน iCute Account", getHtmlTemplate(content), { userId, type: "reset_password" });
}


// ========================================
// TEST EMAIL (custom SMTP settings)
// ========================================

export async function sendTestEmail(settings: {
  emailHost: string;
  emailPort: number;
  emailSecure: boolean;
  emailUser: string;
  emailPassword: string;
  emailFrom: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: settings.emailHost,
      port: settings.emailPort,
      secure: settings.emailSecure,
      auth: { user: settings.emailUser, pass: settings.emailPassword },
    });

    const content = `
      <h2>ทดสอบการตั้งค่าอีเมลสำเร็จ!</h2>
      <p>ระบบของคุณสามารถเชื่อมต่อกับ SMTP Server และส่งอีเมลได้ถูกต้องแล้ว</p>
      <div class="divider"></div>
      <p style="font-size: 14px; color: #6b7280;">อีเมลนี้ถูกส่งมาเพื่อทดสอบการตั้งค่าในระบบ iCute Booking</p>
    `;

    await transporter.sendMail({
      from: `"iCute Booking" <${settings.emailFrom}>`,
      to: settings.emailUser,
      subject: "ทดสอบการตั้งค่าอีเมล - iCute Booking",
      html: getHtmlTemplate(content),
    });

    return { success: true, message: "ส่งอีเมลทดสอบสำเร็จ กรุณาตรวจสอบในกล่องข้อความของคุณ" };
  } catch (error: any) {
    console.error("Error sending test email:", error);
    return { success: false, message: `ส่งอีเมลทดสอบไม่สำเร็จ: ${error.message || "Unknown error"}` };
  }
}

// ========================================
// UNIFIED BOOKING EMAIL (All statuses) - Supports both CUSTOMER and STORE
// ========================================

type RecipientType = 'CUSTOMER' | 'STORE';

interface EmailData {
  id?: string;
  customerName?: string;
  customerSurname?: string;
  customerPhone?: string;
  customerEmail?: string;
  bookingDate?: string | Date;
  bookingStartTime?: string;
  bookingEndTime?: string;
  note?: string;
  priceAtBooking?: number;
  discountAtBooking?: string;
  employeeName?: string;
  serviceName?: string;
  storeName?: string;
  storeTel?: string;
  storeAddress?: string;
  storeEmail?: string;
  employee?: { nickname?: string; name?: string };
  service?: { name?: string; imageUrl?: string };
  store?: { storeName?: string; tel?: string; address?: string; addressCustom?: string; email?: string; emailUser?: string; user?: { email?: string } };
}

function getEmailContent(
  data: EmailData,
  status: NotificationType,
  recipientType: RecipientType
): { title: string; icon: string; badge: { bg: string; color: string; text: string }; content: string; detailsSection: string } {
  const {
    customerName = '',
    customerSurname = '',
    customerPhone = '',
    customerEmail = '',
    bookingDate,
    bookingStartTime = '',
    bookingEndTime = '',
    note,
    priceAtBooking,
    id,
    discountAtBooking,
    employeeName = '',
    serviceName = '',
    storeName = '',
    storeTel = '',
    storeAddress = '',
    employee = {},
    service = {},
    store = {},
  } = data;

  const customerNameFull = `${customerName}${customerSurname ? ` ${customerSurname}` : ''}`.trim() || 'ลูกค้า';
  const employeeNickname = employeeName || employee?.nickname || employee?.name || '-';
  const serviceNameValue = serviceName || service?.name || '-';
  const storeNameValue = storeName || store?.storeName || '-';
  const storeTelValue = storeTel || store?.tel || '';
  const storeAddressValue = storeAddress || store?.address || store?.addressCustom || '';
  const bookingId = id || '';

  const priceDisplay = discountAtBooking
    ? `฿${Number(discountAtBooking).toLocaleString()}`
    : priceAtBooking
      ? `฿${Number(priceAtBooking).toLocaleString()}`
      : '฿0';

  const formattedDate = bookingDate instanceof Date
    ? dayjs(bookingDate).locale("th").format("DD MMMM YYYY")
    : bookingDate || '-';

  const getStatusContent = (notificationType: NotificationType, isStore: boolean) => {
    switch (notificationType) {
      case NotificationType.USER_NEW_REGISTRATION:
        return {
          title: "ร้านค้าใหม่ลงทะเบียน",
          icon: "🏪",
          badge: { bg: "#06b6d4", color: "white", text: "ใหม่" },
          content: `<p>ร้าน "${storeNameValue}" ได้ลงทะเบียนเข้าใช้งานระบบ</p>`
        };

      default:
        return {
          title: "อัปเดตสถานะการจอง",
          icon: "📋",
          badge: { bg: "#6b7280", color: "white", text: "อัปเดต" },
          content: isStore
            ? `<p>สถานะการจองของลูกค้า ${customerNameFull} ได้รับการอัปเดต</p>`
            : `<p>สวัสดีคุณ ${customerNameFull} สถานะการจองของคุณได้รับการอัปเดต</p>`
        };
    }
  };

  const isStore = recipientType === 'STORE';
  const statusInfo = getStatusContent(status, isStore);
  const badgeStyle = `background: ${statusInfo.badge.bg}; color: ${statusInfo.badge.color}; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600;`;

  let detailsSection = '';

  if (isStore) {
    detailsSection = `
      <div style="text-align: center; margin: 20px 0;">
        <span style="${badgeStyle}">${statusInfo.badge.text}</span>
      </div>
      <div class="info-row"><span class="info-label">รหัวการจอง</span><span class="info-value">#${bookingId?.slice(-8).toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">ชื่อลูกค้า</span><span class="info-value">${customerNameFull}</span></div>
      <div class="info-row"><span class="info-label">เบอร์โทร</span><span class="info-value">${customerPhone || '-'}</span></div>
      <div class="info-row"><span class="info-label">อีเมล</span><span class="info-value">${customerEmail || '-'}</span></div>
      <div class="info-row"><span class="info-label">บริการ</span><span class="info-value">${serviceNameValue}</span></div>
      <div class="info-row"><span class="info-label">ราคา</span><span class="info-value" style="font-weight: 700; color: #3BB173;">${priceDisplay}</span></div>
      <div class="info-row"><span class="info-label">พนักงาน</span><span class="info-value">${employeeNickname}</span></div>
      <div class="info-row"><span class="info-label">วันที่</span><span class="info-value">${formattedDate}</span></div>
      <div class="info-row"><span class="info-label">เวลา</span><span class="info-value">${bookingStartTime} - ${bookingEndTime}</span></div>
      ${note ? `<div class="info-row"><span class="info-label">หมายเหตุ</span><span class="info-value">${note}</span></div>` : ""}
    `;
  } else {
    detailsSection = `
      <div style="text-align: center; margin: 20px 0;">
        <span style="${badgeStyle}">${statusInfo.badge.text}</span>
      </div>
      <div class="info-row"><span class="info-label">รหัวการจอง</span><span class="info-value">#${bookingId?.slice(-8).toUpperCase()}</span></div>
      <div class="info-row"><span class="info-label">ร้าน</span><span class="info-value">${storeNameValue}</span></div>
      <div class="info-row"><span class="info-label">บริการ</span><span class="info-value">${serviceNameValue}</span></div>
      <div class="info-row"><span class="info-label">ราคา</span><span class="info-value" style="font-weight: 700; color: #3BB173;">${priceDisplay}</span></div>
      <div class="info-row"><span class="info-label">พนักงาน</span><span class="info-value">${employeeNickname}</span></div>
      <div class="info-row"><span class="info-label">วันที่</span><span class="info-value">${formattedDate}</span></div>
      <div class="info-row"><span class="info-label">เวลา</span><span class="info-value">${bookingStartTime} - ${bookingEndTime}</span></div>
      ${storeTelValue ? `<div class="info-row"><span class="info-label">ติดต่อ</span><span class="info-value">${storeTelValue}</span></div>` : ""}
      ${storeAddressValue ? `<div class="info-row"><span class="info-label">สถานที่</span><span class="info-value">${storeAddressValue}</span></div>` : ""}
      ${note ? `<div class="info-row"><span class="info-label">หมายเหตุ</span><span class="info-value">${note}</span></div>` : ""}
    `;
  }

  return {
    ...statusInfo,
    detailsSection,
  };
}

export async function sendBookingStatusEmail(
  data: any,
  userId: string,
  status: NotificationType,
  sendToCustomer: boolean = true,
  sendToStore: boolean = false
): Promise<{ customerEmailSent?: boolean; storeEmailSent?: boolean }> {

  const customerEmail = data.customerEmail || data.customer?.email;
  const storeEmail = data.storeEmail || data.store?.emailUser || data.store?.user?.email;
  const storeName = data.storeName || data.store?.storeName || 'iCute Booking';
  const serviceName = data.serviceName || data.service?.name;
  const employeeNickname = data.employeeName || data.employee?.nickname || data.employee?.name;

  const customerContent = getEmailContent(data, status, 'CUSTOMER');
  const storeContent = getEmailContent(data, status, 'STORE');

  const results: { customerEmailSent?: boolean; storeEmailSent?: boolean } = {};

  if (sendToCustomer && customerEmail) {
    const customerHtml = getHtmlTemplate(
      `${customerContent.content}<div class="divider"></div>${customerContent.detailsSection}`,
      storeName
    );
    const subject = `${customerContent.icon} ${customerContent.title} - ${serviceName || 'การจอง'} ${storeName !== 'iCute Booking' ? `- ${storeName}` : ''}`;

    results.customerEmailSent = await sendMail(
      customerEmail,
      subject,
      customerHtml,
      { userId, type: `booking_${status}` }
    );
  }

  if (sendToStore && storeEmail) {
    const storeHtml = getHtmlTemplate(
      `${storeContent.content}<div class="divider"></div>${storeContent.detailsSection}`,
      storeName
    );
    const subject = `${storeContent.icon} ${storeContent.title} - ${data.customerName || 'ลูกค้า'}`;

    results.storeEmailSent = await sendMail(
      storeEmail,
      `[Store] ${subject}`,
      storeHtml,
      { userId, type: `booking_${status}_store` }
    );
  }

  return results;
}

// ========================================
// SEND EMAIL BY BOOKING ID (fetch data from DB)
// ========================================

export async function sendEmailByBookingId(
  bookingId: string,
  statusOrType: string,
  sendToCustomer: boolean = true,
  sendToStore: boolean = false
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "Booking model not found in current schema" };
}
