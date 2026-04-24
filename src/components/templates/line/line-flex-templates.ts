// lib/line-flex-templates.ts

/**
 * สร้างโครงสร้าง JSON สำหรับ Flex Message ของการจอง
 */
export function buildBookingFlexPayload(title: string, color: string, data: any) {
  return {
    type: "flex",
    altText: title, // ข้อความที่จะแสดงใน Notification บนมือถือ
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: title,
            weight: "bold",
            size: "xl",
            color: color // เช่น #00b900 (เขียว) หรือ #ff0000 (แดง)
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: data.storeName,
            weight: "bold",
            size: "sm",
            color: "#1DB446"
          },
          {
            type: "separator",
            margin: "md"
          },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              { type: "box", layout: "horizontal", contents: [
                { type: "text", text: "บริการ", size: "sm", color: "#555555", flex: 1 },
                { type: "text", text: data.serviceName, size: "sm", color: "#111111", flex: 4, align: "end", wrap: true }
              ]},
              { type: "box", layout: "horizontal", contents: [
                { type: "text", text: "วันที่", size: "sm", color: "#555555", flex: 1 },
                { type: "text", text: data.date, size: "sm", color: "#111111", flex: 4, align: "end" }
              ]},
              { type: "box", layout: "horizontal", contents: [
                { type: "text", text: "เวลา", size: "sm", color: "#555555", flex: 1 },
                { type: "text", text: data.time, size: "sm", color: "#111111", flex: 4, align: "end" }
              ]}
            ]
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "link",
            height: "sm",
            action: {
              type: "uri",
              label: "ดูรายละเอียดการจอง",
              uri: `https://liff.line.me/YOUR_LIFF_ID/booking/${data.id}`
            }
          }
        ]
      }
    }
  };
}