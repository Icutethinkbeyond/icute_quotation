// services/utils/NotificationFlexService.ts
import { NotificationType } from "@prisma/client";
import { prisma } from "@/../lib/prisma";
import dayjs from "dayjs";
import 'dayjs/locale/th';

import { buildBookingFlexPayload, buildBookingFlexPayloadCompact } from "./line-flex-templates";
import { sendLinePushMessage } from "./line-messaging";

interface FlexData {
  id: string;
  storeName: string;
  serviceName: string;
  serviceImageUrl?: string;
  date: string;
  time: string;
  price?: number;
  discountPrice?: number;
  employeeName?: string;
  customerName?: string;
  note?: string;
  storeTel?: string;
  storeAddress?: string;
  liffUrl?: string;
}

export interface FlexNotificationData {
  id: string;
  customerName: string;
  customerSurname?: string;
  customerPhone?: string;
  customerEmail?: string;
  storeId: string;
  storeName: string;
  storeTel?: string;
  storeAddress?: string;
  lineChannelAccessToken?: string;
  lineUserId?: string;
  serviceId?: string;
  serviceName: string;
  serviceImageUrl?: string;
  employeeId?: string;
  employeeName?: string;
  bookingDate: string | Date;
  bookingStartTime: string;
  bookingEndTime: string;
  priceAtBooking?: number;
  discountAtBooking?: number;
  note?: string;
}

function getTitleAndColor(notificationType: NotificationType): { title: string; color: string } {
  switch (notificationType) {
    case NotificationType.CUSTOMER_PENDING:
      return { title: "รอยืนยันการจอง", color: "#f59e0b" };
    case NotificationType.STORE_BOOKING_CONFIRMED:
      return { title: "ยืนยันการจองสำเร็จ", color: "#00b900" };
    case NotificationType.CUSTOMER_CANCELED:
      return { title: "การจองถูกยกเลิก", color: "#ff4b4b" };
    case NotificationType.STORE_BOOKING_RESCHEDULED:
      return { title: "เลื่อนนัดสำเร็จ", color: "#f5a623" };
    case NotificationType.STORE_BOOKING_NOSHOW:
      return { title: "ไม่มารับบริการ", color: "#6b7280" };
    case NotificationType.STORE_BOOKING_REMINDER:
      return { title: "แจ้งเตือนนัดหมาย", color: "#8b5cf6" };
    case NotificationType.STORE_BOOKING_COMPLETED:
      return { title: "ขอบคุณที่ใช้บริการ", color: "#005cfc" };
    case NotificationType.STORE_AUTO_CANCELLED:
      return { title: "การจองถูกยกเลิก", color: "#ef4444" };
    case NotificationType.STORE_CANCELED_BY_CUSTOMER:
      return { title: "การจองถูกยกเลิก", color: "#ef4444" };
    case NotificationType.STORE_NEW_BOOKING:
      return { title: "มีการจองใหม่", color: "#3b82f6" };
    default:
      return { title: "อัปเดตสถานะ", color: "#111111" };
  }
}

function buildFlexDataFromNotificationData(data: any): FlexData {

  console.log(data)
  
  const formattedDate = data.bookingDate instanceof Date
    ? dayjs(data.bookingDate).locale('th').format('DD MMMM YYYY')
    : typeof data.bookingDate === 'string'
      ? data.bookingDate
      : dayjs(data.bookingDate).locale('th').format('DD MMMM YYYY');

  const customerName = data.customerName || 
    (data.customer ? `${data.customer.firstName || ''} ${data.customer.lastName || ''}`.trim() : "-");
  const employeeName = data.employeeName || 
    (data.employee ? (data.employee.nickname || data.employee.name) : "-");
  const storeName = data.storeName || (data.store?.storeName || "-");
  const serviceName = data.serviceName || (data.service?.name || "-");
  const serviceImageUrl = data.service?.imageUrl;
  const storeTel = data.storeTel || data.store?.tel;
  const storeAddress = data.storeAddress || data.store?.addressCustom || data.store?.address;

  return {
    id: data.id,
    storeName: storeName,
    serviceName: serviceName,
    serviceImageUrl: serviceImageUrl,
    date: formattedDate,
    time: `${data.bookingStartTime} - ${data.bookingEndTime}`,
    price: data.priceAtBooking,
    discountPrice: data.discountAtBooking,
    employeeName: employeeName,
    customerName: customerName,
    note: data.note,
    storeTel: storeTel,
    storeAddress: storeAddress,
  };
}

/**
 * ส่ง LINE Flex Message โดยรับ data เป็น parameter (รองรับทั้งแบบ flat และ nested)
 */
export async function sendFlexMessageWithData(
  data: any,
  notificationType: NotificationType
): Promise<{ success: boolean; error?: any }> {
  try {

    // console.log(data)

    const lineUserId = data.lineUserId || data.customer?.lineUserId;
    const lineChannelAccessToken = data.lineChannelAccessToken || data.store?.lineChannelAccessToken;
    const storeId = data.storeId || data.store?.id;

    if (!lineUserId) {
      console.log(`Notification skipped: No lineUserId`);
      return { success: false, error: "No lineUserId" };
    }

    if (!lineChannelAccessToken) {
      console.log(`Notification skipped: No lineChannelAccessToken`);
      return { success: false, error: "No lineChannelAccessToken" };
    }

    const { title, color } = getTitleAndColor(notificationType);
    const flexData = buildFlexDataFromNotificationData(data);
    const flexPayload = buildBookingFlexPayload(title, color, flexData);

    const result: any = await sendLinePushMessage(
      lineUserId,
      [flexPayload],
      lineChannelAccessToken,
      storeId,
      notificationType
    );

    await prisma.lineLog.create({
      data: {
        to: lineUserId,
        type: notificationType,
        success: result.success,
        error: result.success ? null : JSON.stringify(result.error),
        storeId: storeId,
      }
    });

    return result;
  } catch (error) {
    console.error("Error in sendFlexMessageWithData:", error);
    return { success: false, error };
  }
}

/**
 * ส่ง LINE Flex Message (version สั้น) โดยรับ data เป็น parameter
 */
export async function sendFlexMessageCompactWithData(
  data: any,
  notificationType: NotificationType
): Promise<{ success: boolean; error?: any }> {
  try {
    const lineUserId = data.lineUserId || data.customer?.lineUserId;
    const lineChannelAccessToken = data.lineChannelAccessToken || data.store?.lineChannelAccessToken;
    const storeId = data.storeId || data.store?.id;

    if (!lineUserId || !lineChannelAccessToken) {
      return { success: false, error: "Missing lineUserId or lineChannelAccessToken" };
    }

    const { title, color } = getTitleAndColor(notificationType);
    const flexData = buildFlexDataFromNotificationData(data);
    const flexPayload = buildBookingFlexPayloadCompact(title, color, flexData);

    const result: any = await sendLinePushMessage(
      lineUserId,
      [flexPayload],
      lineChannelAccessToken,
      storeId,
      notificationType
    );

    await prisma.lineLog.create({
      data: {
        to: lineUserId,
        type: notificationType,
        success: result.success,
        error: result.success ? null : JSON.stringify(result.error),
        storeId: storeId,
      }
    });

    return result;
  } catch (error) {
    console.error("Error in sendFlexMessageCompactWithData:", error);
    return { success: false, error };
  }
}

/**
 * @deprecated ใช้ sendFlexMessageWithData แทน - ฟังก์ชันเดิมที่ query จาก database
 */
export async function notifyBookingFlexEvent(type: string, bookingId: string) {
  const notificationType = type as NotificationType;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        store: {
          select: {
            storeName: true,
            tel: true,
            addressCustom: true,
            lineChannelAccessToken: true,
            id: true
          }
        },
        customer: {
          select: { lineUserId: true }
        },
        employee: {
          select: { name: true, nickname: true }
        }
      }
    });

    if (!booking || !booking.customer?.lineUserId) {
      console.log(`Notification skipped: Booking ${bookingId} not found or customer has no lineUserId`);
      return;
    }

    const { title, color } = getTitleAndColor(notificationType);

    const flexData: FlexData = {
      id: booking.id,
      storeName: booking.store?.storeName || "ร้านค้า",
      serviceName: booking.service?.name || "บริการ",
      serviceImageUrl: booking.service?.imageUrl || undefined,
      date: dayjs(booking.bookingDate).locale('th').format('DD MMMM YYYY'),
      time: `${booking.bookingStartTime} - ${booking.bookingEndTime}`,
      price: booking.priceAtBooking || booking.service?.price || 0,
      discountPrice: booking.discountAtBooking,
      employeeName: booking.employee?.nickname || booking.employee?.name || "-",
      customerName: booking.customerName,
      note: booking.note || undefined,
      storeTel: booking.store?.tel || undefined,
      storeAddress: booking.store?.addressCustom || undefined,
    };

    const flexPayload = buildBookingFlexPayload(title, color, flexData);

    const result: any = await sendLinePushMessage(
      booking.customer.lineUserId,
      [flexPayload],
      booking.store.lineChannelAccessToken || undefined,
      booking.storeId,
      type
    );

    await prisma.lineLog.create({
      data: {
        to: booking.customer.lineUserId,
        type: notificationType,
        success: result.success,
        error: result.success ? null : JSON.stringify(result.error),
        storeId: booking.storeId,
      }
    });

    return result;
  } catch (error) {
    console.error("Error in notifyBookingFlexEvent:", error);
    return { success: false, error };
  }
}
