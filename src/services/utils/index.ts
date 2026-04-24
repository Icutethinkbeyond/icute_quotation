import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { Booking } from "@/interfaces/Booking";
import { BookingStatus, CustomerType, NotificationType } from "@prisma/client";
import { EmployeeWorkingTime } from "@/interfaces/Employee";

export const BOOKING_CHANNELS: { value: CustomerType; label: string; icon: string }[] = [
  { value: CustomerType.WALK_IN, label: "Walk-in", icon: "DirectionsWalk" },
  { value: CustomerType.PHONE, label: "โทรศัพท์", icon: "Phone" },
  { value: CustomerType.LINE, label: "LINE", icon: "Chat" },
  { value: CustomerType.FACEBOOK, label: "Facebook", icon: "Facebook" },
  { value: CustomerType.OTHER_CONTACT, label: "อื่นๆ", icon: "MoreHoriz" },
  { value: CustomerType.INSTAGRAM, label: "Instagram", icon: "Language" },
];


/**
 * Map BookingStatus to NotificationType for LINE Flex messages
 * Used for sending to CUSTOMER
 * @param status - The booking status
 * @param role - The role of the user making the change (optional). If provided and not ADMIN, affects CANCELLED notification type
 */
export function mapBookingStatusToNotificationType(status: BookingStatus, role?: string | null): NotificationType {
  // Check if role is valid (not null, not undefined, not ADMIN)
  const isStoreStaff = role !== null && role !== undefined && role !== "ADMIN";
  
  switch (status) {
    case 'PENDING':
      return NotificationType.CUSTOMER_PENDING;
    case 'CONFIRMED':
      return NotificationType.STORE_BOOKING_CONFIRMED; // Customer receives confirmation
    case 'CANCELLED':
      // If store staff (not ADMIN) cancelled, use STORE_CANCELED_BY_CUSTOMER
      return isStoreStaff ? NotificationType.STORE_CANCELED_BY_CUSTOMER : NotificationType.CUSTOMER_CANCELED;
    case 'RESCHEDULED':
      return NotificationType.STORE_BOOKING_RESCHEDULED;
    case 'NOSHOW':
      return NotificationType.STORE_BOOKING_NOSHOW;
    case 'REMINDED':
      return NotificationType.STORE_BOOKING_REMINDER;
    case 'COMPLETED':
      return NotificationType.STORE_BOOKING_COMPLETED;
    default:
      return NotificationType.CUSTOMER_PENDING;
  }
}

export const timeSlots = [
  "08:00",
  "08:15",
  "08:30",
  "08:45",
  "09:00",
  "09:15",
  "09:30",
  "09:45",
  "10:00",
  "10:15",
  "10:30",
  "10:45",
  "11:00",
  "11:15",
  "11:30",
  "11:45",
  "12:00",
  "12:15",
  "12:30",
  "12:45",
  "13:00",
  "13:15",
  "13:30",
  "13:45",
  "14:00",
  "14:15",
  "14:30",
  "14:45",
  "15:00",
  "15:15",
  "15:30",
  "15:45",
  "16:00",
  "16:15",
  "16:30",
  "16:45",
  "17:00",
  "17:15",
  "17:30",
  "17:45",
  "18:00",
  "18:15",
  "18:30",
  "18:45",
  "19:00",
  "19:15",
  "19:30",
  "19:45",
]

/**
 * Generate time slots that cover the full range of the given bookings.
 * Ensures bookings before the first slot or after the last slot are still visible.
 */
export function getTimeSlotsForBookings(bookings: { bookingStartTime: string; bookingEndTime: string }[]): string[] {
  if (bookings.length === 0) return timeSlots;

  let minMinutes = 8 * 60;   // 08:00 default floor
  let maxMinutes = 20 * 60;  // 20:00 default ceiling

  for (const b of bookings) {
    const startMin = timeToMinutes(b.bookingStartTime);
    const endMin = timeToMinutes(b.bookingEndTime);
    if (startMin < minMinutes) minMinutes = Math.floor(startMin / 15) * 15;
    if (endMin > maxMinutes) maxMinutes = Math.ceil(endMin / 15) * 15;
  }

  const slots: string[] = [];
  for (let m = minMinutes; m < maxMinutes; m += 15) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
  }
  return slots;
}

export function isOverlapping(
  slots: EmployeeWorkingTime[],
  index: number
): boolean {
  const current = slots[index];
  if (!current) return false;

  const start = current.startTime;
  const end = current.endTime;

  return slots.some((slot, i) => {
    if (i === index) return false;
    return start < slot.endTime && end > slot.startTime;
  });
}

/**
 * ฟังก์ชันสำหรับแทนที่ตัวแปรในข้อความที่ดึงมาจาก DB
 */
export function formatTemplate(template: string, data: Record<string, string>) {
  let message = template;
  Object.keys(data).forEach((key) => {
    // แทนที่ {key} ด้วย data[key]
    message = message.replace(new RegExp(`{${key}}`, 'g'), data[key]);
  });
  return message;
}

// --------------------------------------------------------------------------
// Helper Functions & Types
// --------------------------------------------------------------------------

// Helper function to convert "HH:MM" string to a valid Date object for Prisma
// Note: เราใช้ 2000-01-01T...Z เพื่อให้เป็น Time Object ที่อ้างอิง UTC Date

export function parseShopFromCallbackUrl(encodedUrl: string): string | null {
  try {
    // decode URL ก่อน
    const decoded = decodeURIComponent(encodedUrl);

    // แยก path
    const parts = decoded.split("/").filter(Boolean);

    // โครงสร้างที่คาดไว้: /protected/store/{shopId}/...
    const shopIndex = parts.indexOf("store");

    if (shopIndex === -1 || !parts[shopIndex + 1]) {
      return null;
    }

    return parts[shopIndex + 1];
  } catch (error) {
    return null;
  }
}


export function getShopIdFromUrl(encodedUrl: string): string | null {
  try {
    // decode URL ก่อน
    const decoded = decodeURIComponent(encodedUrl);

    // แยก path
    const parts = decoded.split("/").filter(Boolean);

    // โครงสร้างที่คาดไว้: /protected/store/{shopId}/...
    const shopIndex = parts.indexOf("customer");

    if (shopIndex === -1 || !parts[shopIndex + 1]) {
      return null;
    }

    return parts[shopIndex + 1];
  } catch (error) {
    return null;
  }
}


export function getTimeAsDateTime(timeString: string | null | undefined | Dayjs): null | string {
  if (!timeString) return null;

  // แปลงเป็น ISO String format: YYYY-MM-DDTZ เพื่อให้ Prisma จัดการได้
  // const safeDate = new Date(`2000-01-01T${timeString}:00Z`);
  let safeDate = dayjs(timeString).format()

  // if (isNaN(safeDate.getTime())) return null;

  return safeDate;
}

export function checkBooleanValue(value: string | boolean): boolean {
  if (typeof value === "undefined") {
    return false;
  }

  value = value === 'true' || value === true ? true : false

  return value;
}

export function checkShopLoginCallbackUrl(urlString: string | null): boolean {
  try {

    if (!urlString) {
      return false
    }

    // 4. ✅ ตรวจสอบค่าพารามิเตอร์: 
    // เรากำลังตรวจสอบว่าค่าที่ถูกถอดรหัส (Decoded Value) มี '/th/protected/shop/' อยู่หรือไม่
    // (ค่าที่ถูกส่งมาใน URL คือ %2Fth%2Fprotected%2Fshop%2F)
    const targetPathPatternLocal = `/customer`
    const targetPathPattern = '/shop';

    // เนื่องจาก URL Object จะถอดรหัสค่าพารามิเตอร์ให้เราแล้ว (เช่น %2F เป็น /)
    // เราจึงสามารถตรวจสอบกับสตริงที่ไม่ได้เข้ารหัสได้
    return urlString.includes(targetPathPattern || targetPathPatternLocal);

  } catch (error) {
    // จัดการข้อผิดพลาดหากสตริงที่ส่งมาไม่ใช่ URL ที่ถูกต้อง
    console.error("Invalid URL:", urlString);
    return false;
  }
}

export function isShopLoginURL(pathname: string) {
  const locales = ["th", "en"];

  // ตัวอย่าง URL:
  // /th/auth/sign-in?callbackUrl=%2Fth%2Fprotected%2Fshop%2Ficute-salon-shop
  // เราต้อง decode callbackUrl ก่อน
  const url = decodeURIComponent(pathname);

  const regex = new RegExp(
    `^/(${locales.join("|")})/store/([^/]+)(/.*)?$`,
    "i"
  );

  return regex.test(url);
}
// ฟังก์ชันแปลง Request Body เป็นโครงสร้างที่ Flatten สำหรับ Prisma
// export function mapRequestToPrismaData(requestData: DefaultOperatingHour) {
//   // 1. กำหนดชื่อวันในสัปดาห์
//   const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

//   // 2. ใช้ reduce เพื่อสร้าง Object dataToUpdate
//   const dataToUpdate = days.reduce((acc, day) => {

//     // 🔍 ใช้ Bracket Notation ([]) เพื่อสร้างชื่อคุณสมบัติแบบ Dynamic

//     // คุณสมบัติ: [DAY]_isOpen (แปลงเป็น Boolean)
//     const isOpenKey = `${day}_isOpen`;
//     if (requestData[isOpenKey] !== undefined) {
//       acc[isOpenKey] = Boolean(requestData[isOpenKey]);
//     }

//     // คุณสมบัติ: [DAY]_openTime (แปลงเป็น DateTime)
//     const openTimeKey = `${day}_openTime`;
//     if (requestData[openTimeKey] !== undefined) {
//       acc[openTimeKey] = getTimeAsDateTime(requestData[openTimeKey]);
//     }

//     // คุณสมบัติ: [DAY]_closeTime (แปลงเป็น DateTime)
//     const closeTimeKey = `${day}_closeTime`;
//     if (requestData[closeTimeKey] !== undefined) {
//       acc[closeTimeKey] = getTimeAsDateTime(requestData[closeTimeKey]);
//     }

//     return acc;
//   }, {} as any); // ใช้ as any ชั่วคราวเพื่อให้ TypeScript ยอมรับ Dynamic Keys
// }


export function getBaseUrl(): string | null {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return null;
}

export function parseDateToMongo(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // ตรวจสอบว่าเป็น ISO 8601 หรือไม่
  const isoDateRegex =
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(Z|[\+\-]\d{2}:\d{2})?)?$/;

  if (isoDateRegex.test(dateStr)) {
    const isoDate = new Date(dateStr);
    return isNaN(isoDate.getTime()) ? null : isoDate;
  }

  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // yyyy-mm-dd
    /^\d{2}\/\d{2}\/\d{4}$/, // dd/mm/yyyy
    /^\d{2}-\d{2}-\d{4}$/ // dd-mm-yyyy
  ];

  for (const format of formats) {
    if (format.test(dateStr)) {
      try {
        let [year, month, day] = [0, 0, 0];

        if (dateStr.includes('/')) {
          [day, month, year] = dateStr.split('/').map(Number);
        } else if (dateStr.includes('-')) {
          const parts = dateStr.split('-').map(Number);
          if (dateStr.indexOf('-') === 4) {
            // yyyy-mm-dd
            [year, month, day] = parts;
          } else {
            // dd-mm-yyyy
            [day, month, year] = parts;
          }
        }

        const date = new Date(Date.UTC(year, month - 1, day));
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }
  }

  return null; // รูปแบบไม่ถูกต้อง
}
export function isEqualIgnoreCaseAndWhitespace(text1: string, text2: string): boolean {
  const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, '');
  return normalize(text1) === normalize(text2);
}

export const getMonthAbbreviation = (month: number): string => {
  const monthAbbrs = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
  ];
  return monthAbbrs[month];
};

// export function validateExcelColumns(fileBuffer: ArrayBuffer): { valid: boolean; missingColumns?: string[] } {
//   // อ่านไฟล์ Excel
//   const workbook = XLSX.read(fileBuffer, { type: "array" });

//   // เลือก Sheet แรก
//   const sheetName = workbook.SheetNames[0];
//   const sheet = workbook.Sheets[sheetName];

//   // อ่านข้อมูลแถวแรก (Header)
//   const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];

//   // ตรวจสอบว่าคอลัมน์ที่ต้องมีทั้งหมดอยู่ในไฟล์ไหม
//   const missingColumns = REQUIRED_COLUMNS.filter(col => !headers.includes(col));

//   if (missingColumns.length > 0) {
//     return { valid: false, missingColumns };
//   }

//   return { valid: true };
// }

// export const REQUIRED_COLUMN: (keyof EquipmentRow)[] = [
//   'equipmentName',
//   'serialNo',
//   'brand',
//   'description',
//   'equipmentPrice',
//   'categoryName',
//   'rentalPriceCurrent',
//   'purchaseDate',
//   'unitName'
// ];

export const REQUIRED_COLUMNS: string[] = [
  "equipmentName",
  "serialNo",
  "brand",
  "description",
  "equipmentPrice",
  "categoryName",
  "rentalPriceCurrent",
  "purchaseDate",
  "unitName",
];

export function formatDateForFilename(date: Date = new Date()): string {
  return date
    .toISOString()
    .replace(/[-:T]/g, "")
    .split(".")[0]; // เอาเฉพาะ YYYYMMDDHHmmss
}


export function formatDateMonthDay(inputDate: string | Date | null | Dayjs): string {

  if (!inputDate || inputDate == undefined) {
    return ""
  }

  console.log(inputDate)

  const date = new Date(inputDate.toString());

  console.log(date)
  if (isNaN(date.getTime())) {
    throw new Error("Invalid date format");
  }

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit" }).format(date).replace(" ", "/");
}

export function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export const fetchData = async <T>(
  endpoint: string,
  setData: React.Dispatch<React.SetStateAction<T>>,
  setRowCount?: React.Dispatch<React.SetStateAction<number>>,
  setLoading?: React.Dispatch<React.SetStateAction<boolean>>,
  signal?: AbortSignal // เพิ่ม signal เพื่อให้สามารถยกเลิกคำขอได้
) => {
  try {
    if (setLoading) setLoading(true);

    const { data } = await axios.get(endpoint, { signal });

    console.log(data)

    setData(data.data);
    if (setRowCount && data.pagination) {
      setRowCount(data.pagination.totalItems);
    }
  } catch (error: any) {
    console.error("Fetch error:", error.message);
    throw error; // คุณสามารถส่ง error นี้ไปจัดการในหน้าที่เรียก
  } finally {
    if (setLoading) setLoading(false);
  }
};

export function makeId(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export const randomProperty = function (obj: any) {
  var keys = Object.keys(obj);
  return obj[keys[keys.length * Math.random() << 0]];
};



export function formatUtcDate(utcDateString?: string | null): string | null | undefined {

  if (!utcDateString) {
    return;
  }

  const utcDate = new Date(utcDateString);
  const formattedDate = utcDate.toLocaleDateString('th-TH',
    { day: '2-digit', month: 'long', year: 'numeric' });

  return formattedDate;
}

export function makeDateMonth(utcDateString?: string): string {

  if (!utcDateString) {
    return 'ไม่พบข้อมูล';
  }

  const utcDate = new Date(utcDateString);
  const month = String(utcDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so we add 1
  const year = String(utcDate.getFullYear()).slice(-2); // Get last two digits of the year

  return `${month}-${year}`;
}

export function formatNumber(number: number | null | undefined, needDecimal: boolean | null = true): string | null | undefined {
  if (number !== null && number !== undefined) {

    let fixedNumber: string | number;

    if (needDecimal) {
      fixedNumber = Number.isInteger(number) ? number.toFixed(2) : number.toString();
      return parseFloat(fixedNumber).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      return number.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
  }

  return null;
}

export const compareDates = (date1: Date | string, date2: Date | string): number => {
  const d1 = new Date(date1).getTime();
  const d2 = new Date(date2).getTime();

  if (d1 > d2) return 1;  // date1 มากกว่า date2
  if (d1 < d2) return -1; // date1 น้อยกว่า date2
  return 0;               // date1 เท่ากับ date2
};

export function formatThaiDateTimeRange(
  startISO: string,
  endISO: string
): string {
  const optionsDate: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  };

  const optionsTime: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  };

  const startDate = new Date(startISO);
  const endDate = new Date(endISO);

  const thaiDate = new Intl.DateTimeFormat("th-TH", optionsDate).format(
    startDate
  );

  const startTime = new Intl.DateTimeFormat("th-TH", optionsTime).format(
    startDate
  );

  const endTime = new Intl.DateTimeFormat("th-TH", optionsTime).format(endDate);

  return `${thaiDate} เวลา ${startTime} - ${endTime} น.`;
}

export function expandLeaveDatesUTC(startDate: string, endDate: string): string[] {
  const dates: string[] = []

  let current = new Date(startDate)
  const end = new Date(endDate)

  // normalize เวลาให้เที่ยงคืน (กัน timezone เพี้ยน)
  current.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

export function minutesToTimeString(minutes: number): string {

  // console.log("minutes:", minutes)
  // ป้องกันกรณีค่าติดลบ
  const totalMinutes = Math.abs(minutes);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// export function minutesToTimeString(minutes: number): string {
//   const h = Math.floor(minutes / 60);
//   const m = minutes % 60;
//   return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
// }

export const timeToMinutes = (time: string | number) => {
  if (typeof time === "number") return time * 60;

  const normalized = time.replace(".", ":"); // รองรับ 20.00
  const [hour, minute = "0"] = normalized.split(":");

  return parseInt(hour) * 60 + parseInt(minute);
};

export const timeToDecimal = (timeString: string): number => {
  if (!timeString) return 0;

  // รองรับทั้ง : และ .
  const [hours, minutes] = timeString.split(/[:.]/);

  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);

  // ถ้าไม่มีนาที ให้คืนค่าชั่วโมงไปเลย
  if (!m) return h;

  // นำชั่วโมงมาบวกกับนาทีที่แปลงเป็นทศนิยม (เช่น 30 นาที -> .3)
  return parseFloat(`${h}.${m}`);
};

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0 นาที";

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;

  // กรณีที่มีทั้ง ชั่วโมง และ นาที
  if (h > 0 && m > 0) {
    return `${h} ชม. ${m} นาที`;
  }

  // กรณีที่มีเฉพาะ ชั่วโมง
  if (h > 0) {
    return `${h} ชม.`;
  }

  // กรณีที่มีเฉพาะ นาที
  return `${m} นาที`;
}

export function isSlotAvailable(
  startMinutes: number,
  durationMinutes: number,
  bookings: Booking[],
  SHOP_CLOSE_HOUR: number,
  bufferTime: number = 0
): boolean {
  // const endMinutes = startMinutes + durationMinutes;
  const endMinutes = startMinutes + durationMinutes + bufferTime;

  // Check if it fits within operating hours
  if (endMinutes > SHOP_CLOSE_HOUR * 60) return false;

  // Check conflicts with existing bookings
  for (const booking of bookings) {
    if (startMinutes < timeToMinutes(booking.bookingEndTime) && endMinutes > timeToMinutes(booking.bookingStartTime)) {
      return false;
    }
  }
  return true;
}

export function getConflictingBooking(
  startMinutes: number,
  durationMinutes: number,
  bookings: Booking[]
): Booking | undefined {
  const endMinutes = startMinutes + durationMinutes;
  for (const booking of bookings) {
    if (startMinutes < timeToMinutes(booking.bookingEndTime) && endMinutes > timeToMinutes(booking.bookingStartTime)) {
      return booking;
    }
  }
  return undefined;
}


export function expandLeaveDatesBangkokZone(startDate: string, endDate: string): string[] {
  const dates: string[] = []

  // สร้าง Date Object จาก String ที่ได้รับมา
  let current = new Date(startDate)
  const end = new Date(endDate)

  // ตั้งค่าให้เป็นเวลาเริ่มต้นของวัน (00:00:00) ใน Local Time
  current.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)

  while (current <= end) {
    // ใช้เทคนิค Intl เพื่อดึงเฉพาะวันที่ใน Format YYYY-MM-DD ตาม Timezone เอเชีย/กรุงเทพ
    const formattedDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(current);

    dates.push(formattedDate);

    // ขยับไปวันถัดไป
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

export const getStatusColor = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return '#2563eb'
    case BookingStatus.PENDING:
      return '#f59e0b'
    case BookingStatus.CANCELLED:
      return '#ef4444'
    case BookingStatus.COMPLETED:
      return '#10b981'
    case BookingStatus.NOSHOW:
      return '#8b5cf6'
    case BookingStatus.RESCHEDULED:
      return '#06b6d4'
    default:
      return '#64748b'
  }
}

export const getStatusLabel = (status: BookingStatus) => {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'ยืนยันแล้ว'
    case BookingStatus.PENDING:
      return 'รอยืนยัน'
    case BookingStatus.CANCELLED:
      return 'ยกเลิก'
    case BookingStatus.COMPLETED:
      return 'เสร็จสิ้น'
    case BookingStatus.NOSHOW:
      return 'ไม่แสดงตัว'
    case BookingStatus.RESCHEDULED:
      return 'เลื่อนนัด'
    default:
      return status
  }
}

export const bookingStatusConfig = {
  PENDING: { label: 'รอยืนยัน', color: '#f59e0b', bgColor: '#fef9c3', borderColor: '#fde68a' },
  CONFIRMED: { label: 'ยืนยันแล้ว', color: '#2563eb', bgColor: '#dbeafe', borderColor: '#93c5fd' },
  COMPLETED: { label: 'เสร็จสิ้น', color: '#10b981', bgColor: '#d1fae5', borderColor: '#6ee7b7' },
  CANCELLED: { label: 'ยกเลิก', color: '#ef4444', bgColor: '#fee2e2', borderColor: '#fca5a5' },
  NOSHOW: { label: 'ไม่มา', color: '#8b5cf6', bgColor: '#ede9fe', borderColor: '#c4b5fd' },
  RESCHEDULED: { label: 'เลื่อนนัด', color: '#06b6d4', bgColor: '#cffafe', borderColor: '#67e8f9' },
  REMINDED: { label: 'แจ้งเตือน', color: '#8b5cf6', bgColor: '#ede9fe', borderColor: '#c4b5fd' },
}

// BookingStatus

export const bookingChannelConfig = {
  GUEST: { label: 'ออนไลน์', icon: 'Language' },
  WALK_IN: { label: 'Walk-in', icon: 'DirectionsWalk' },
  PHONE: { label: 'โทรศัพท์', icon: 'Phone' },
  LINE: { label: 'LINE', icon: 'Chat' },
  FACEBOOK: { label: 'LINE', icon: 'Facebook' },
  INSTAGRAM: { label: 'LINE', icon: 'Instagram' },
  OTHER_CONTACT: { label: 'LINE', icon: 'StickyNote2' },
}


