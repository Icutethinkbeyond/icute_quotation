// services/notification-service.ts
import { PrismaClient, NotificationType, SendMethod, NotificationTarget, BookingStatus, CustomerType, Role } from "@prisma/client";
import { notifyBookingFlexEvent, sendFlexMessageWithData } from "./notificationFlexService";
import { sendBookingStatusEmail } from "./emailServices";

const prisma = new PrismaClient();

export interface NotifyOptions {
  sendLine?: boolean;
  sendEmail?: boolean;
}

export interface NotifyStoreBookingParams {
  bookingId?: string;
  booking: any;
  notificationType: NotificationType;
  options?: NotifyOptions;
  isStatusOnlyChange?: boolean;
}

/**
 * สร้างเนื้อหาของ Notification ตาม Type (สำหรับ Store ใช้ message สั้น)
 */
function getNotificationContent(type: NotificationType, booking: any
): { title: string; message: string } {
  const customerName = booking.customerName || 'ลูกค้า';
  const serviceName = booking.service?.name || 'บริการ';
  const bookingDate = new Date(booking.bookingDate).toLocaleDateString('th-TH');
  const bookingTime = booking.bookingStartTime && booking.bookingEndTime
    ? `${booking.bookingStartTime} - ${booking.bookingEndTime}`
    : '';
  const storeName = booking.store?.storeName || 'ร้าน';
  const employeeName = booking.employee?.nickname || booking.employee?.name || '-';
  const priceDisplay = booking.discountAtBooking && booking.discountAtBooking < booking.priceAtBooking
    ? `฿${booking.discountAtBooking}`
    : booking.priceAtBooking ? `฿${booking.priceAtBooking}` : '-';


  const templates: Record<NotificationType, { title: string; message: string }> = {
    'STORE_NEW_BOOKING': {
      title: '🆕 จองใหม่โดยร้านค้า',
      message: `${customerName} - ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_CANCELED_BY_CUSTOMER': {
      title: '❌ ยกเลิกโดยร้านค้า',
      message: `${employeeName} ยกเลิกจอง ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_BOOKING_CONFIRMED': {
      title: '✅ ยืนยันจองแล้ว',
      message: `${customerName} ยืนยัน ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_BOOKING_RESCHEDULED': {
      title: '📅 เลื่อนนัดโดยร้านค้า',
      message: `${employeeName} เลื่อนนัด ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'CUSTOMER_CANCELED': {
      title: '❌ ลูกค้ายกเลิก',
      message: `${customerName} ยกเลิก ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_AUTO_CANCELLED': {
      title: '❌ ยกเลิกอัตโนมัติโดยระบบ',
      message: `${customerName} ${serviceName} วันที่ ${bookingDate} ${bookingTime} ถูกยกเลิกอัตโนมัติ`,
    },
    'CUSTOMER_PENDING': {
      title: '⏳ มีการจองใหม่ รอยืนยัน',
      message: `${customerName} รอยืนยัน ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_BOOKING_NOSHOW': {
      title: '😞 ลูกค้าไม่มา',
      message: `${customerName} ไม่มาใช้บริการ ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_BOOKING_REMINDER': {
      title: '🔔 นัดหมาย',
      message: `${customerName} นัดหมาย ${serviceName} วันที่ ${bookingDate} ${bookingTime}`,
    },
    'STORE_BOOKING_COMPLETED': {
      title: '✅ เสร็จสิ้น',
      message: `${customerName} ใช้บริการ ${serviceName} วันที่ ${bookingDate} ${bookingTime} เสร็จสิ้น`,
    },
    'STORE_NEW_REGISTRATION': {
      title: '🏪 ร้านใหม่',
      message: `${storeName} ลงทะเบียน`,
    },
  };

  return templates[type] || { title: 'แจ้งเตือน', message: 'การจองใหม่' };
}

export async function notifyStoreBooking(
  bookingId?: string,
  booking: any = null,
  notificationType: NotificationType = 'STORE_NEW_BOOKING',
  // options: NotifyOptions = {},
  isStatusOnlyChange?: boolean
) {
  // const { sendLine = true, sendEmail = true } = options;

  try {
    if (!booking) {
      booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          store: {
            include: {
              user: {
                select: {
                  email: true
                }
              }
            }
          },
          customer: {
            select: {
              name: true,
              firstName: true,
              lastName: true,
              nickname: true,
              lineUserId: true,
              email: true,
            }
          },
          service: {
            select: {
              name: true,
              imageUrl: true
            }
          },
          employee: {
            select: {
              name: true,
              nickname: true,
              surname: true
            }
          },
        },
      });
    }

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    const customer = booking.customer as any;
    const wantsLine = booking?.customerType === CustomerType.LINE;
    const wantsEmail = booking?.sendEmail ?? false;

    // console.log(customer?.lineUserId, wantsLine)

    if (wantsLine && customer?.lineUserId) {
      await sendFlexMessageWithData(booking, notificationType)
    }

    // console.log( wantsEmail, booking.customerEmail)

    let sendtoStore = booking.status ? booking.status === BookingStatus.PENDING || booking.status === BookingStatus.CANCELLED : false;

    if (wantsEmail && booking.customerEmail) {
      await sendBookingStatusEmail(booking, booking.storeId, notificationType, true, sendtoStore);
      // console.log("sendBookingStatusEmail result: ", result)
    }

    console.log("notificationType : ", notificationType)

    // if (!sendLine && !sendEmail) {
    const { title, message } = getNotificationContent(notificationType, booking);

    console.log("title : ", title)
    console.log("message : ", message)

    await createAndSendNotification({
      storeId: booking.storeId,
      bookingId: booking.id,
      type: notificationType,
      method: SendMethod.WEBLOGIN,
      targetGroup: NotificationTarget.STORE,
      targetAddress: booking.storeId,
      title,
      message,
      isStatusOnlyChange,
    });
    // }

    return { success: true };
  } catch (error) {
    console.error('notifyStoreBooking Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

interface NotifyParams {
  storeId: string;
  bookingId: string;
  type: NotificationType;
  method: SendMethod;
  targetGroup: NotificationTarget;
  targetAddress: string;
  lineUserId?: string;
  title: string;
  message: string;
  metadata?: string;
}

/**
 * สร้างและส่งการแจ้งเตือน
 */
async function createAndSendNotification(params: NotifyParams & { isStatusOnlyChange?: boolean }) {
  const { storeId, bookingId, type, method, targetGroup, targetAddress, lineUserId, title, message, metadata, isStatusOnlyChange } = params;

  // console.log(bookingId, isStatusOnlyChange)

  try {
    // ถ้าเปลี่ยนแค่ status ให้อัปเดต notification เดิมแทนการสร้างใหม่
    // if (isStatusOnlyChange && bookingId) {
    //   const existingNotification = await prisma.notification.findFirst({
    //     where: {
    //       bookingId,
    //       storeId,
    //       targetGroup: NotificationTarget.STORE,
    //       method: SendMethod.WEBLOGIN,
    //     },
    //     orderBy: {
    //       createdAt: 'desc'
    //     },
    //     take: 1
    //   });

    //   console.log(existingNotification)

    //   if (existingNotification) {
    //     await prisma.notification.update({
    //       where: { id: existingNotification.id },
    //       data: {
    //         isRead: false,
    //         type,
    //         title,
    //         message,
    //         metadata,
    //       },
    //     });

    //     return { success: true, notification: existingNotification, isUpdate: true };
    //   }
    // }

    // 1. บันทึกข้อมูล Notification ลง Database
    const notification = await prisma.notification.create({
      data: {
        storeId,
        bookingId,
        type,
        method,
        targetGroup,
        targetAddress,
        lineUserId,
        title,
        message,
        metadata,
        isSent: false,
      },
    });

    // 2. ส่ง Notification ตาม Method ที่กำหนด
    let sendSuccess = false;
    let errorMessage: string | null = null;

    switch (method) {
      case 'WEBLOGIN':
        // Store notification in database for web login
        sendSuccess = true;
        break;

      default:
        errorMessage = `Unknown send method: ${method}`;
    }

    // 3. อัปเดตสถานะการส่ง
    await prisma.notification.update({
      where: { id: notification.id },
      data: {
        isSent: sendSuccess,
        sentAt: sendSuccess ? new Date() : null,
        errorMessage,
      },
    });

    return { success: sendSuccess, notification, error: errorMessage };
  } catch (error) {
    console.error('Notification Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}


/**
 * ฟังก์ชันหลักสำหรับส่ง Notification ตาม Booking Status
 * @deprecated Use notifyStoreBooking with notificationType instead
 */
export async function notifyBookingEvent(
  bookingId: string,
  newStatus: BookingStatus,
  previousStatus?: BookingStatus
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        store: true,
        customer: true,
        service: true,
      },
    });

    if (!booking) {
      console.error(`Booking not found: ${bookingId}`);
      return { success: false, error: 'Booking not found' };
    }

    let notificationType: NotificationType | null = null;

    if (newStatus === 'CONFIRMED' && previousStatus === 'PENDING') {
      notificationType = 'STORE_BOOKING_CONFIRMED';
    } else if (newStatus === 'RESCHEDULED') {
      notificationType = 'STORE_BOOKING_RESCHEDULED';
    } else if (newStatus === 'CANCELLED') {
      notificationType = 'CUSTOMER_CANCELED';
    } else if (newStatus === 'COMPLETED') {
      console.log(`Booking ${bookingId} completed`);
      return { success: true };
    } else if (newStatus === 'NOSHOW') {
      console.log(`Booking ${bookingId} marked as no show`);
      return { success: true };
    }

    if (!notificationType) {
      console.log(`No notification type for status change: ${previousStatus} -> ${newStatus}`);
      return { success: true };
    }

    const customer = booking.customer as any;
    const wantsLine = customer?.wantsLineNotification ?? true;
    const wantsEmail = customer?.wantsEmailNotification ?? false;

    if (customer?.lineUserId && wantsLine) {
      await notifyBookingFlexEvent(notificationType, bookingId);
    }

    if (booking.customerEmail && wantsEmail) {
      await sendBookingStatusEmail(booking, booking.storeId, notificationType);
    }

    return { success: true };
  } catch (error) {
    console.error('notifyBookingEvent Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * @deprecated Use notifyStoreBooking(bookingId, 'STORE_NEW_BOOKING') instead
 */
// export async function notifyNewBooking(bookingId: string) {
//   return notifyStoreBooking(bookingId, 'STORE_NEW_BOOKING');
// }

/**
 * ฟังก์ชันสำหรับส่ง Notification ตอนแก้ไข Booking
 * @deprecated Use notifyStoreBooking(bookingId, 'STORE_BOOKING_MODIFIED') instead
 */
// export async function notifyBookingModified(bookingId: string) {
//   return notifyStoreBooking(bookingId, 'STORE_BOOKING_MODIFIED');
// }
