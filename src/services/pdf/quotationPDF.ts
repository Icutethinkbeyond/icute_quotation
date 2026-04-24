import { jsPDF } from "jspdf";
import "@/../public/fonts/pdf/THSarabunNew-normal.js";

// Types matching the page component
export interface SubItem {
  id: string;
  name: string;
  description: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  remark: string;
}

export interface Category {
  id: string;
  name: string;
  items: SubItem[];
}

export interface QuotationData {
  _id: string;
  documentIdNo: string;
  documentCreateDate: string;
  companyName: string;
  companyLogo?: string;
  companyTel: string;
  companyAddress: string;
  companyTaxId: string;
  companyBranch: string;
  customerCompany: {
    companyName?: string;
    companyTel?: string;
    companyAddress?: string;
    taxId?: string;
    branch?: string;
  } | null;
  contactor: {
    contactorName?: string;
    contactorTel?: string;
    contactorEmail?: string;
    contactorAddress?: string;
  } | null;
  categories: Category[];
  globalDiscount: number;
  includeVat: boolean;
  withholdingTax: number;
  note: string;
}

interface PDFOptions {
  detailSpacing?: number;
}

// Helper: format number as Thai currency
const fmt = (num: number) =>
  num.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Calculate totals
const getSubtotal = (data: QuotationData): number => {
  return data.categories.reduce((sum, cat) => {
    return (
      sum +
      cat.items.reduce((s, item) => s + item.qty * item.pricePerUnit, 0)
    );
  }, 0);
};

const getTaxAmount = (data: QuotationData, subtotal: number): number => {
  return data.includeVat ? (subtotal - (data.globalDiscount || 0)) * 0.07 : 0;
};

const getWithholdingTaxAmount = (
  data: QuotationData,
  subtotal: number
): number => {
  return ((subtotal - (data.globalDiscount || 0)) *
    (data.withholdingTax || 0)) /
    100;
};

const getGrandTotal = (
  data: QuotationData,
  subtotal: number,
  taxAmount: number,
  withholdingTaxAmount: number
): number => {
  return subtotal - (data.globalDiscount || 0) + taxAmount - withholdingTaxAmount;
};

const getCategoryTotal = (cat: Category): number => {
  return cat.items.reduce(
    (sum, item) => sum + item.qty * item.pricePerUnit,
    0
  );
};

// Professional Bottom Section Function
const generateProfessionalBottomSection = (
  doc: jsPDF,
  data: QuotationData,
  startY: number,
  pageWidth: number,
  pageHeight: number,
  margin: number,
  contentWidth: number,
  subtotal: number,
  taxAmount: number,
  withholdingTaxAmount: number,
  grandTotal: number
): number => {
  let y = startY + 5;

  if (y + 110 > pageHeight - margin) {
    doc.addPage();
    doc.setFillColor("#1976d2");
    doc.rect(0, 0, pageWidth, 5, "F");
    y = margin + 5;
  }

  const leftWidth = contentWidth * 0.45;
  const rightWidth = contentWidth * 0.5;
  const rightX = pageWidth - margin - rightWidth;

  // Left: Notes section
  doc.setFillColor("#1976d2");
  doc.rect(margin, y, 1.5, 6, "F");

  doc.setFontSize(12);
  doc.setFont("THSarabunNew", "normal");
  doc.setTextColor("#1976d2");
  doc.text("หมายเหตุ:", margin + 4, y + 4.5);

  y += 10;
  doc.setFontSize(10);
  doc.setTextColor("#333333");
  const noteLines = doc.splitTextToSize(data.note || "-", leftWidth - 10);
  doc.text(noteLines, margin + 5, y, { lineHeightFactor: 1.5 });
  const notesHeight = noteLines.length * 6;

  // Right: Financial Summary - draw border after calculating content height
  const summaryY = y - 10;
  const summaryStartY = summaryY;
  const summaryStartX = rightX;

  let tableY = summaryY + 8;

  const addSummaryRow = (
    label: string,
    value: string,
    currentY: number,
    isBold: boolean = false
  ) => {
    doc.setFontSize(isBold ? 10 : 9);
    doc.setTextColor(isBold ? "#000000" : "#555555");
    doc.text(label, rightX + 8, currentY);
    doc.text(value, rightX + rightWidth - 8, currentY, { align: "right" });
    return currentY + 8;
  };

  tableY = addSummaryRow(
    "ยอดรวมสินค้า:",
    fmt(subtotal) + " บาท",
    tableY
  );

  if (data.globalDiscount > 0) {
    tableY = addSummaryRow(
      "ส่วนลด:",
      "-" + fmt(data.globalDiscount) + " บาท",
      tableY
    );
  }

  const vatText = data.includeVat
    ? "ภาษีมูลค่าเพิ่ม (7%):"
    : "ภาษีมูลค่าเพิ่ม (0%):";
  tableY = addSummaryRow(vatText, fmt(taxAmount) + " บาท", tableY);

  if (data.withholdingTax > 0) {
    const wtText = `หัก ณ ที่จ่าย (${data.withholdingTax}%):`;
    tableY = addSummaryRow(
      wtText,
      "-" + fmt(withholdingTaxAmount) + " บาท",
      tableY
    );
  }

  // Divider - adjusted to fit content width
  doc.setDrawColor("#d0d0d0");
  doc.setLineWidth(0.3);
  doc.line(rightX + 10, tableY - 2, rightX + rightWidth - 10, tableY - 2);
  tableY += 4;

  // Grand Total
  doc.setFillColor("#1565c0");
  doc.roundedRect(rightX + 4, tableY - 5, rightWidth - 8, 8, 1, 1, "F");

  doc.setFontSize(11);
  doc.setTextColor("#ffffff");
  doc.text("รวมทั้งสิ้น:", rightX + 10, tableY);
  doc.text(
    fmt(grandTotal) + " บาท",
    rightX + rightWidth - 10,
    tableY,
    { align: "right" }
  );

  const summaryEndY = tableY + 5;
  const actualSummaryHeight = summaryEndY - summaryStartY;

  // Now draw the border background to fit the actual content
  doc.setFillColor("#f8f9fa");
  doc.roundedRect(summaryStartX, summaryStartY, rightWidth, actualSummaryHeight, 2, 2, "F");
  doc.setDrawColor("#e0e0e0");
  doc.setLineWidth(0.2);
  doc.roundedRect(summaryStartX, summaryStartY, rightWidth, actualSummaryHeight, 2, 2, "S");

  // Redraw text on top (since border was drawn after)
  tableY = summaryStartY + 8;
  tableY = addSummaryRow(
    "ยอดรวมสินค้า:",
    fmt(subtotal) + " บาท",
    tableY
  );

  if (data.globalDiscount > 0) {
    tableY = addSummaryRow(
      "ส่วนลด:",
      "-" + fmt(data.globalDiscount) + " บาท",
      tableY
    );
  }

  tableY = addSummaryRow(vatText, fmt(taxAmount) + " บาท", tableY);

  if (data.withholdingTax > 0) {
    const wtText = `หัก ณ ที่จ่าย (${data.withholdingTax}%):`;
    tableY = addSummaryRow(
      wtText,
      "-" + fmt(withholdingTaxAmount) + " บาท",
      tableY
    );
  }

  // Divider
  doc.setDrawColor("#d0d0d0");
  doc.setLineWidth(0.3);
  doc.line(rightX + 10, tableY - 2, rightX + rightWidth - 10, tableY - 2);
  tableY += 4;

  // Grand Total (redraw)
  doc.setFillColor("#1565c0");
  doc.roundedRect(rightX + 4, tableY - 5, rightWidth - 8, 8, 1, 1, "F");

  doc.setFontSize(11);
  doc.setTextColor("#ffffff");
  doc.text("รวมทั้งสิ้น:", rightX + 10, tableY);
  doc.text(
    fmt(grandTotal) + " บาท",
    rightX + rightWidth - 10,
    tableY,
    { align: "right" }
  );

  y = Math.max(y + notesHeight + 15, summaryEndY + 10);

  // Signature Section
  if (y + 55 > pageHeight - margin) {
    doc.addPage();
    doc.setFillColor("#1976d2");
    doc.rect(0, 0, pageWidth, 5, "F");
    y = margin + 15;
  } else {
    y += 5;
  }

  const sigY = y;
  const sigWidth = 55;
  const sigBoxHeight = 35;
  const sigSpacing = (contentWidth - sigWidth * 3) / 2;
  const labels = [
    "ผู้อนุมัติ / ผู้ว่าจ้าง",
    "ผู้เสนอราคา / ผู้รับจ้าง",
    "พยาน",
  ];

  [0, 1, 2].forEach((idx) => {
    const sx = margin + idx * (sigWidth + sigSpacing);

    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.2);
    doc.roundedRect(sx, sigY, sigWidth, sigBoxHeight, 2, 2, "S");

    doc.setFillColor("#f8f9fa");
    doc.roundedRect(sx + 0.2, sigY + 0.2, sigWidth - 0.4, 8, 2, 2, "F");

    doc.setFontSize(9);
    doc.setTextColor("#1976d2");
    doc.text(labels[idx], sx + sigWidth / 2, sigY + 5.5, { align: "center" });

    doc.setDrawColor("#333333");
    doc.setLineWidth(0.2);
    doc.line(sx + 10, sigY + 24, sx + sigWidth - 10, sigY + 24);

    doc.setFontSize(8);
    doc.setTextColor("#777777");
    doc.text("(ลงชื่อ)", sx + sigWidth / 2, sigY + 30, { align: "center" });
  });

  // Footer
  doc.setFillColor("#1976d2");
  doc.rect(0, pageHeight - 5, pageWidth, 5, "F");

  doc.setFontSize(8);
  doc.setTextColor("#999999");
  const now = new Date();
  const footerInfo = `พิมพ์เมื่อ: ${now.toLocaleDateString("th-TH")} ${now.toLocaleTimeString("th-TH")}`;
  doc.text(footerInfo, margin, pageHeight - 8);
  doc.text(
    "ขอบคุณที่ไว้วางใจใช้บริการ",
    pageWidth - margin,
    pageHeight - 8,
    { align: "right" }
  );

  return summaryEndY + sigBoxHeight;
};

/**
 * Generate PDF from quotation data
 * @param data Quotation data
 * @param options PDF generation options
 * @returns Promise<Blob> PDF blob
 */
export const generateQuotationPDF = async (
  data: QuotationData,
  options: PDFOptions = {}
): Promise<Blob> => {
  const { detailSpacing = 1 } = options;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  doc.setFont("THSarabunNew", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const subtotal = getSubtotal(data);
  const taxAmount = getTaxAmount(data, subtotal);
  const withholdingTaxAmount = getWithholdingTaxAmount(data, subtotal);
  const grandTotal = getGrandTotal(
    data,
    subtotal,
    taxAmount,
    withholdingTaxAmount
  );

  // Helper for wrapped text
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10,
    bold: boolean = false,
    color: string = "#000000",
    lineHeight: number = 4
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("THSarabunNew", "normal");
    doc.setTextColor(color);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight + 2;
  };

  // Header Row 1: Logo and Quotation Info
  const brandingY = y;

  if (data.companyLogo) {
    try {
      const maxLogoWidth = 40;
      const maxLogoHeight = 12;
      const logoWidth = Math.min(maxLogoWidth, 30);
      const logoHeight = Math.min(maxLogoHeight, logoWidth / 2.0);

      doc.addImage(
        data.companyLogo,
        "JPEG",
        margin,
        brandingY + 1,
        logoWidth,
        logoHeight,
        undefined,
        "FAST"
      );
      doc.setFontSize(10);
      doc.setTextColor("#1976d2");
    } catch (e) {
      doc.setFontSize(16);
      doc.setTextColor("#1976d2");
      doc.text(data.companyName, margin + 4, brandingY + 8);
    }
  } else {
    doc.setFillColor("#1976d2");
    doc.rect(0, 0, pageWidth, 5, "F");
    doc.rect(margin, brandingY, 1.5, 13, "F");
    doc.setFontSize(16);
    doc.setTextColor("#1976d2");
    doc.text(data.companyName, margin + 4, brandingY + 8);
  }

  // Quotation Info Box
  const infoBoxWidth = 75;
  const infoBoxX = pageWidth - margin - infoBoxWidth;
  doc.setFillColor("#f0f7ff");
  doc.roundedRect(infoBoxX, brandingY - 2, infoBoxWidth, 24, 2, 2, "F");
  doc.setDrawColor("#d0e3ff");
  doc.setLineWidth(0.1);
  doc.roundedRect(infoBoxX, brandingY - 2, infoBoxWidth, 24, 2, 2, "S");

  doc.setFontSize(18);
  doc.setTextColor("#1976d2");
  doc.text("ใบเสนอราคา", pageWidth - margin - 5, brandingY + 6, {
    align: "right",
  });

  doc.setFontSize(10);
  doc.setTextColor("#333333");
  doc.text(
    `เลขที่: ${data.documentIdNo}`,
    pageWidth - margin - 5,
    brandingY + 13,
    { align: "right" }
  );
  doc.text(
    `วันที่: ${new Date(data.documentCreateDate).toLocaleDateString("th-TH")}`,
    pageWidth - margin - 5,
    brandingY + 19,
    { align: "right" }
  );

  // Separator Line
  y = brandingY + 28;
  doc.setDrawColor("#e0e0e0");
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);

  // Header Row 2: Customer and Company Details
  y += 8;
  const row2Y = y;

  // Customer (Left)
  doc.setFontSize(12);
  doc.setTextColor("#1976d2");
  doc.text("ลูกค้า / ผู้ว่าจ้าง:", margin, row2Y);

  let customerY = row2Y + 6;
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  if (data.customerCompany?.taxId) {
    customerY += addWrappedText(
      data.customerCompany.companyName || "",
      margin,
      customerY,
      contentWidth * 0.45,
      11,
      true,
      "#000000"
    );
    if (data.customerCompany.taxId) {
      customerY += addWrappedText(
        `Tax ID: ${data.customerCompany.taxId}${
          data.customerCompany.branch
            ? ` (สาขา: ${data.customerCompany.branch})`
            : ""
        }`,
        margin,
        customerY,
        contentWidth * 0.45,
        9
      );
    }
    customerY += addWrappedText(
      data.customerCompany.companyAddress || "",
      margin,
      customerY,
      contentWidth * 0.45,
      9
    );
  } else {
    customerY += addWrappedText(
      `คุณ ${data.contactor?.contactorName || ""}`,
      margin,
      customerY,
      contentWidth * 0.45,
      11,
      true,
      "#000000",
      5
    );
    customerY += addWrappedText(
      data.contactor?.contactorAddress || "",
      margin,
      customerY,
      contentWidth * 0.45,
      9
    );
    customerY += addWrappedText(
      `โทร: ${data.contactor?.contactorTel || ""}`,
      margin,
      customerY,
      contentWidth * 0.45,
      9
    );
  }

  // Company Details (Right)
  const companyX = margin + contentWidth * 0.55;
  doc.setFontSize(12);
  doc.setTextColor("#1976d2");
  doc.text("ผู้เสนอราคา / ผู้รับจ้าง:", companyX, row2Y);

  let companyDetailY = row2Y + 6;
  doc.setFontSize(10);
  doc.setTextColor("#000000");
  companyDetailY += addWrappedText(
    data.companyName,
    companyX,
    companyDetailY,
    contentWidth * 0.45,
    10,
    true,
    "#000000",
    5
  );
  companyDetailY += addWrappedText(
    data.companyAddress,
    companyX,
    companyDetailY,
    contentWidth * 0.45,
    9,
    false,
    "#000000",
    4
  );
  companyDetailY += addWrappedText(
    `โทร: ${data.companyTel}`,
    companyX,
    companyDetailY,
    contentWidth * 0.45,
    9,
    false,
    "#000000",
    4
  );
  if (data.companyTaxId) {
    companyDetailY += addWrappedText(
      `Tax ID: ${data.companyTaxId}`,
      companyX,
      companyDetailY,
      contentWidth * 0.45,
      9,
      false,
      "#000000",
      4
    );
  }

  y = Math.max(customerY, companyDetailY) + 5;

  // Table
  const tableTop = y;

  const colX = [
    margin,
    margin + 10,
    margin + 90,
    margin + 100,
    margin + 115,
    margin + 140,
  ];
  const colWidths = [10, 80, 10, 15, 25, 40];

  // Table Header
  doc.setFillColor(234, 234, 234);
  doc.setFontSize(8);
  doc.setFont("THSarabunNew", "normal");
  doc.setTextColor(152, 152, 152);
  const headers = [
    "NO.",
    "สินค้า / รายละเอียด",
    "จำนวน",
    "หน่วย",
    "ราคา/หน่วย",
    "จำนวนเงิน (บาท)",
  ];
  headers.forEach((h, i) => {
    // Align right for number/price columns, left for text columns
    if ( i === 2 || i === 3 || i === 4 || i === 5) {
      // Right align for NO., จำนวน, หน่วย, ราคา/หน่วย, จำนวนเงิน
      doc.text(h, colX[i] + colWidths[i] - 2, y + 5.5, { align: "right" });
    } else {
      // Left align for description column
      doc.text(h, colX[i] + 2, y + 5.5);
    }
  });
  doc.setFillColor(255, 255, 255);
  y += 8;

  // Table Body
  data.categories.forEach((cat, catIdx) => {
    if (y + 10 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }

    // Category Header
    doc.setFillColor(25, 118, 210);
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setFontSize(10);
    doc.setFont("THSarabunNew", "normal");
    doc.setTextColor(255, 255, 255);
    doc.text(`${catIdx + 1}. ${cat.name}`, margin + 2, y + 4.5);
    y += 11;

    // Category Items
    cat.items.forEach((item, itemIdx) => {
      if (y + 15 > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFontSize(9);
      doc.setFont("THSarabunNew", "normal");
      doc.setTextColor(0, 0, 0);

      const itemTotal = item.qty * item.pricePerUnit;

      // No.
      doc.text(`${catIdx + 1}.${itemIdx + 1}`, colX[0] + 2, y + 0.5);

      // Details
      const detailParts = [item.name];
      if (item.description)
        detailParts.push(`รายละเอียด: ${item.description}`);
      if (item.remark) detailParts.push(`หมายเหตุ: ${item.remark}`);
      const detailText = detailParts.join(" ");
      const detailLines = doc.splitTextToSize(
        detailText,
        colWidths[1] - 2
      );

      const itemLineHeight = 4 + detailSpacing;
      doc.text(detailLines, colX[1] + 2, y, {
        lineHeightFactor: 1.2 + detailSpacing * 0.05,
        charSpace: 0,
      });
      const detailHeight = detailLines.length * itemLineHeight;

      // Qty
      doc.text(
        String(item.qty),
        colX[2] + colWidths[2] / 2,
        y,
        { align: "center" }
      );

      // Unit
      doc.text(
        item.unit,
        colX[3] + colWidths[3] - 2,
        y,
        { align: "right" }
      );

      // Price
      doc.text(
        fmt(item.pricePerUnit),
        colX[4] + colWidths[4] - 2,
        y,
        { align: "right" }
      );

      // Total
      doc.text(
        fmt(itemTotal),
        colX[5] + colWidths[5] - 2,
        y,
        { align: "right" }
      );

      y += Math.max(12, detailHeight + 2);
    });

    // Category Subtotal
    if (y + 8 > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.setFillColor(224, 224, 224);
    doc.rect(margin, y, contentWidth, 6, "F");
    doc.setFontSize(9);
    doc.setFont("THSarabunNew", "normal");
    doc.setTextColor(21, 101, 192);
    doc.text(
      `รวม ${cat.name}:`,
      colX[4],
      y + 4,
      { align: "right" }
    );
    doc.text(
      fmt(getCategoryTotal(cat)),
      colX[5] + colWidths[5] - 2,
      y + 4,
      { align: "right" }
    );
    y += 6;
  });

  // Professional Bottom Section
  const finalY = generateProfessionalBottomSection(
    doc,
    data,
    y,
    pageWidth,
    pageHeight,
    margin,
    contentWidth,
    subtotal,
    taxAmount,
    withholdingTaxAmount,
    grandTotal
  );

  // Generate PDF blob
  const blob = await doc.output("blob");
  return blob;
};

/**
 * Generate and download PDF file
 * @param data Quotation data
 * @param filename Optional custom filename
 * @param options PDF generation options
 */
export const downloadQuotationPDF = async (
  data: QuotationData,
  filename?: string,
  options?: PDFOptions
) => {
  try {
    const blob = await generateQuotationPDF(data, options);
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download =
      filename ||
      `quotation-${data.documentIdNo || "document"}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("PDF generation error:", error);
    throw error;
  }
};
