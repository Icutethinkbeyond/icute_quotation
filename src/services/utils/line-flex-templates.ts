// lib/line-flex-templates.ts

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

const DEFAULT_LIFF_URL = "https://liff.line.me/2004547264";

/**
 * สร้างโครงสร้าง JSON สำหรับ Flex Message ของการจอง
 */
export function buildBookingFlexPayload(title: string, color: string, data: FlexData) {
  const priceValue = !data.discountPrice || data.discountPrice === 0 || data.discountPrice === undefined ? data.price : data.discountPrice;
  const priceText = priceValue ? `฿${priceValue.toLocaleString()}` : '-';
  const liffUrl = data.liffUrl || DEFAULT_LIFF_URL;

  const contents: any[] = [];

  if (data.serviceImageUrl) {
    contents.push({
      type: "image",
      url: data.serviceImageUrl,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
      margin: "none"
    });
  }

  const infoRows: any[] = [
    { type: "box", layout: "horizontal", contents: [
      { type: "text", text: "บริการ", size: "sm", color: "#555555", flex: 1 },
      { type: "text", text: data.serviceName || '-', size: "sm", color: "#111111", flex: 4, align: "end", wrap: true }
    ]}
  ];

  if ((data.discountPrice && data.price) && (data.discountPrice < data.price) && data.price > 0) {
    infoRows.push(
      { type: "box", layout: "horizontal", contents: [
        { type: "text", text: "ราคา", size: "sm", color: "#555555", flex: 1 },
        { type: "text", text: `฿${data.price.toLocaleString()}`, size: "sm", color: "#9ca3af", flex: 4, align: "end", decoration: "line-through" }
      ]},
      { type: "box", layout: "horizontal", contents: [
        { type: "text", text: "ส่วนลด", size: "sm", color: "#555555", flex: 1 },
        { type: "text", text: priceText, size: "sm", color: "#10b981", flex: 4, align: "end", weight: "bold" }
      ]}
    );
  } else {
    infoRows.push({ type: "box", layout: "horizontal", contents: [
      { type: "text", text: "ราคา", size: "sm", color: "#555555", flex: 1 },
      { type: "text", text: priceText, size: "sm", color: "#10b981", flex: 4, align: "end", weight: "bold" }
    ]});
  }

  infoRows.push(
    { type: "box", layout: "horizontal", contents: [
      { type: "text", text: "พนักงาน", size: "sm", color: "#555555", flex: 1 },
      { type: "text", text: data.employeeName || '-', size: "sm", color: "#111111", flex: 4, align: "end" }
    ]},
    { type: "box", layout: "horizontal", contents: [
      { type: "text", text: "วันที่", size: "sm", color: "#555555", flex: 1 },
      { type: "text", text: data.date, size: "sm", color: "#111111", flex: 4, align: "end" }
    ]},
    { type: "box", layout: "horizontal", contents: [
      { type: "text", text: "เวลา", size: "sm", color: "#555555", flex: 1 },
      { type: "text", text: data.time, size: "sm", color: "#111111", flex: 4, align: "end" }
    ]}
  );

  contents.push({
    type: "box",
    layout: "vertical",
    margin: data.serviceImageUrl ? "md" : "none",
    spacing: "sm",
    contents: infoRows
  });

  if (data.note) {
    contents.push({
      type: "box",
      layout: "vertical",
      margin: "md",
      paddingAll: "sm",
      backgroundColor: "#fef3c7",
      cornerRadius: "sm",
      contents: [
        { type: "text", text: "📝 หมายเหตุ", size: "xs", color: "#92400e", weight: "bold" },
        { type: "text", text: data.note, size: "sm", color: "#78350f", wrap: true }
      ]
    });
  }

  const bubbleContents: any = {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: contents
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
            uri: `${liffUrl}/booking/${data.id}`
          }
        }
      ]
    }
  };

  if (data.serviceImageUrl) {
    bubbleContents.header = {
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
          type: "text",
          text: title,
          weight: "bold",
          size: "lg",
          color: color,
          margin: "xs"
        }
      ]
    };
  } else {
    bubbleContents.header = {
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
          type: "text",
          text: title,
          weight: "bold",
          size: "xl",
          color: color,
          margin: "xs"
        },
        {
          type: "text",
          text: `#${data.id.slice(-8).toUpperCase()}`,
          size: "xs",
          color: "#6b7280"
        }
      ]
    };
  }

  if (!data.serviceImageUrl) {
    bubbleContents.header.contents.push({
      type: "text",
      text: `#${data.id.slice(-8).toUpperCase()}`,
      size: "xs",
      color: "#6b7280",
      margin: "xs"
    });
  }

  return {
    type: "flex",
    altText: title,
    contents: bubbleContents
  };
}

/**
 * สร้างโครงสร้าง JSON สำหรับ Flex Message ของการจอง (version สั้น)
 */
export function buildBookingFlexPayloadCompact(title: string, color: string, data: FlexData) {
  const priceValue = data.discountPrice ?? data.price ?? 0;
  const priceText = priceValue > 0 ? `฿${priceValue.toLocaleString()}` : '-';
  const liffUrl = data.liffUrl || DEFAULT_LIFF_URL;

  return {
    type: "flex",
    altText: title,
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
            size: "lg",
            color: color
          },
          {
            type: "text",
            text: data.storeName,
            size: "sm",
            color: "#1DB446",
            margin: "xs"
          },
          {
            type: "text",
            text: `#${data.id.slice(-8).toUpperCase()}`,
            size: "xs",
            color: "#6b7280",
            margin: "xs"
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        margin: "md",
        spacing: "sm",
        contents: [
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "บริการ", size: "sm", color: "#555555", flex: 1 },
            { type: "text", text: data.serviceName || '-', size: "sm", color: "#111111", flex: 3, align: "end" }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "ราคา", size: "sm", color: "#555555", flex: 1 },
            { type: "text", text: priceText, size: "sm", color: "#10b981", flex: 3, align: "end", weight: "bold" }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "พนักงาน", size: "sm", color: "#555555", flex: 1 },
            { type: "text", text: data.employeeName || '-', size: "sm", color: "#111111", flex: 3, align: "end" }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "วันที่", size: "sm", color: "#555555", flex: 1 },
            { type: "text", text: data.date, size: "sm", color: "#111111", flex: 3, align: "end" }
          ]},
          { type: "box", layout: "horizontal", contents: [
            { type: "text", text: "เวลา", size: "sm", color: "#555555", flex: 1 },
            { type: "text", text: data.time, size: "sm", color: "#111111", flex: 3, align: "end" }
          ]}
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
              label: "ดูรายละเอียด",
              uri: `${liffUrl}/booking/${data.id}`
            }
          }
        ]
      }
    }
  };
}