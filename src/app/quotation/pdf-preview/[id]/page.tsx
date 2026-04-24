"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useRouter, useSearchParams } from "next/navigation";
import ".././../../../../public/fonts/pdf/THSarabunNew-normal";

// Types
interface SubItem {
  id: string;
  name: string;
  description: string;
  unit: string;
  qty: number;
  pricePerUnit: number;
  remark: string;
}

interface Category {
  id: string;
  name: string;
  items: SubItem[];
}

interface QuotationData {
  _id: string;
  documentIdNo: string;
  documentCreateDate: string;
  companyName: string;
  companyLogo?: string; // Company logo URL from Cloudinary
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

export default function DirectPDFPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Detail height controls
  const [detailSpacing, setDetailSpacing] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<QuotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  const pdfBlobRef = useRef<Blob | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/income/quotation/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch quotation");
        const json = await res.json();
        const quoteData = json.data || json;

        // Fetch company logo
        let companyLogo: string | undefined = undefined;
        if (quoteData.companyName) {
          try {
            const companiesRes = await fetch(`/api/companies`);
            if (companiesRes.ok) {
              const companies = await companiesRes.json();
              const company = companies.find(
                (c: any) => c.companyName === quoteData.companyName,
              );
              if (company?.companyImage) {
                companyLogo = company.companyImage;
              }
            }
          } catch (e) {}
        }

        setData({ ...quoteData, companyLogo });
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pdfBlobRef.current && pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Format number
  const fmt = (num: number) =>
    num.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calculate totals
  const getSubtotal = useCallback(() => {
    if (!data) return 0;
    return data.categories.reduce((sum, cat) => {
      return (
        sum + cat.items.reduce((s, item) => s + item.qty * item.pricePerUnit, 0)
      );
    }, 0);
  }, [data]);

  const getTaxAmount = useCallback(() => {
    if (!data) return 0;
    return data.includeVat
      ? (getSubtotal() - (data.globalDiscount || 0)) * 0.07
      : 0;
  }, [data, getSubtotal]);

  const getWithholdingTaxAmount = useCallback(() => {
    if (!data) return 0;
    return (
      ((getSubtotal() - (data.globalDiscount || 0)) *
        (data.withholdingTax || 0)) /
      100
    );
  }, [data, getSubtotal]);

  const getGrandTotal = useCallback(() => {
    return (
      getSubtotal() -
      (data?.globalDiscount || 0) +
      getTaxAmount() -
      getWithholdingTaxAmount()
    );
  }, [data, getSubtotal, getTaxAmount, getWithholdingTaxAmount]);

  const getCategoryTotal = useCallback((cat: Category) => {
    return cat.items.reduce(
      (sum, item) => sum + item.qty * item.pricePerUnit,
      0,
    );
  }, []);

  // Professional Bottom Section Function
  const generateProfessionalBottomSection = (
    doc: any,
    data: any,
    startY: number,
    pageWidth: number,
    pageHeight: number,
    margin: number,
    contentWidth: number,
    fmt: any,
    getSubtotal: any,
    getTaxAmount: any,
    getWithholdingTaxAmount: any,
    getGrandTotal: any,
  ) => {
    let y = startY + 5;

    if (y + 110 > pageHeight - margin) {
      doc.addPage();
      // Re-draw top accent on new page
      doc.setFillColor("#1976d2");
      doc.rect(0, 0, pageWidth, 5, "F");
      y = margin + 5;
    }

    // 2-column layout: Notes (left) and Summary (right)
    const leftWidth = contentWidth * 0.45;
    const rightWidth = contentWidth * 0.5;
    const rightX = pageWidth - margin - rightWidth;

    // Left: Notes section with graphic accent
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

    // Right: Financial Summary with professional styling
    const summaryY = y - 10;

    // Summary Box Background
    doc.setFillColor("#f8f9fa");
    doc.roundedRect(rightX, summaryY, rightWidth, 65, 2, 2, "F");
    doc.setDrawColor("#e0e0e0");
    doc.setLineWidth(0.2);
    doc.roundedRect(rightX, summaryY, rightWidth, 65, 2, 2, "S");

    let tableY = summaryY + 8;

    // Helper for summary rows
    const addSummaryRow = (
      label: string,
      value: string,
      currentY: number,
      isBold: boolean = false,
    ) => {
      doc.setFontSize(isBold ? 10 : 9);
      doc.setTextColor(isBold ? "#000000" : "#555555");
      doc.text(label, rightX + 8, currentY);
      doc.text(value, rightX + rightWidth - 8, currentY, { align: "right" });
      return currentY + 8;
    };

    tableY = addSummaryRow(
      "ยอดรวมสินค้า:",
      fmt(getSubtotal()) + " บาท",
      tableY,
    );

    if (data.globalDiscount > 0) {
      tableY = addSummaryRow(
        "ส่วนลด:",
        "-" + fmt(data.globalDiscount) + " บาท",
        tableY,
      );
    }

    const vatText = data.includeVat
      ? "ภาษีมูลค่าเพิ่ม (7%):"
      : "ภาษีมูลค่าเพิ่ม (0%):";
    tableY = addSummaryRow(vatText, fmt(getTaxAmount()) + " บาท", tableY);

    if (data.withholdingTax > 0) {
      const wtText = `หัก ณ ที่จ่าย (${data.withholdingTax}%):`;
      tableY = addSummaryRow(
        wtText,
        "-" + fmt(getWithholdingTaxAmount()) + " บาท",
        tableY,
      );
    }

    // Divider line before Total
    doc.setDrawColor("#d0d0d0");
    doc.setLineWidth(0.3);
    doc.line(rightX + 8, tableY - 2, rightX + rightWidth - 8, tableY - 2);
    tableY += 4;

    // Grand Total with solid graphic background
    doc.setFillColor("#1976d2");
    doc.roundedRect(rightX + 4, tableY - 5, rightWidth - 8, 12, 1, 1, "F");

    doc.setFontSize(11);
    doc.setTextColor("#ffffff");
    doc.text("รวมทั้งสิ้น:", rightX + 10, tableY + 3);
    doc.text(
      fmt(getGrandTotal()) + " บาท",
      rightX + rightWidth - 10,
      tableY + 3,
      { align: "right" },
    );

    y = Math.max(y + notesHeight + 15, summaryY + 75);

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

      // Signature Box
      doc.setDrawColor("#e0e0e0");
      doc.setLineWidth(0.2);
      doc.roundedRect(sx, sigY, sigWidth, sigBoxHeight, 2, 2, "S");

      // Header of sig box
      doc.setFillColor("#f8f9fa");
      doc.roundedRect(sx + 0.2, sigY + 0.2, sigWidth - 0.4, 8, 2, 2, "F");

      doc.setFontSize(9);
      doc.setTextColor("#1976d2");
      doc.text(labels[idx], sx + sigWidth / 2, sigY + 5.5, { align: "center" });

      // Signature Line
      doc.setDrawColor("#333333");
      doc.setLineWidth(0.2);
      doc.line(sx + 10, sigY + 24, sx + sigWidth - 10, sigY + 24);

      doc.setFontSize(8);
      doc.setTextColor("#777777");
      doc.text("(ลงชื่อ)", sx + sigWidth / 2, sigY + 30, { align: "center" });
    });

    // Footer Accent & Copyright
    doc.setFillColor("#1976d2");
    doc.rect(0, pageHeight - 5, pageWidth, 5, "F");

    doc.setFontSize(8);
    doc.setTextColor("#999999");
    const now = new Date();
    const footerInfo = `พิมพ์เมื่อ: ${now.toLocaleDateString("th-TH")} ${now.toLocaleTimeString("th-TH")}`;
    doc.text(footerInfo, margin, pageHeight - 8);
    doc.text("ขอบคุณที่ไว้วางใจใช้บริการ", pageWidth - margin, pageHeight - 8, {
      align: "right",
    });

    return y + sigBoxHeight;
  };

  // Generate PDF directly using jsPDF (no HTML-to-PDF conversion)
  const generatePDF = useCallback(async () => {
    if (!data) return;

    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // doc.setFont("THSarabunNew", "normal");
      doc.setFont("THSarabunNew", "normal");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper for wrapped text
      const addWrappedText = (
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        fontSize: number = 10,
        bold: boolean = false,
        color: string = "#000000",
        lineHeight: number = 4,
      ) => {
        doc.setFontSize(fontSize);
        doc.setFont("THSarabunNew", "normal");
        doc.setTextColor(color);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * lineHeight + lineHeight * 0.5;
      };

      // Header Row 1: Logo/Company Branding (Left) and Quotation Info (Right)
      const brandingY = y;

      // Graphic Accent: Top Page Bar

      // Company Logo
      if (data.companyLogo) {
        try {
          // Auto-scale logo to fit
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
            "FAST",
          );
          doc.setFontSize(10);
          doc.setFont("THSarabunNew", "normal");
          doc.setTextColor("#1976d2");
          // doc.text(data.companyName, margin + 28, brandingY + 8);
        } catch (e) {
          doc.setFontSize(16);
          doc.setFont("THSarabunNew", "normal");
          doc.setTextColor("#1976d2");
          doc.text(data.companyName, margin + 4, brandingY + 8);
        }
      } else {
        doc.setFillColor("#1976d2");
        doc.rect(0, 0, pageWidth, 5, "F");

        // Graphic Accent: Vertical branding bar
        doc.rect(margin, brandingY, 1.5, 13, "F");
        doc.setFontSize(16);
        doc.setFont("THSarabunNew", "normal");
        doc.setTextColor("#1976d2");
        doc.text(data.companyName, margin + 4, brandingY + 8);
      }

      // Graphic Accent: Rounded Box for Quotation Info
      const infoBoxWidth = 75;
      const infoBoxX = pageWidth - margin - infoBoxWidth;
      doc.setFillColor("#f0f7ff");
      doc.roundedRect(infoBoxX, brandingY - 2, infoBoxWidth, 24, 2, 2, "F");
      doc.setDrawColor("#d0e3ff");
      doc.setLineWidth(0.1);
      doc.roundedRect(infoBoxX, brandingY - 2, infoBoxWidth, 24, 2, 2, "S");

      // Quotation title
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
        {
          align: "right",
        },
      );
      doc.text(
        `วันที่: ${new Date(data.documentCreateDate).toLocaleDateString("th-TH")}`,
        pageWidth - margin - 5,
        brandingY + 19,
        { align: "right" },
      );

      // Decorative Separator Line
      y = brandingY + 28;
      doc.setDrawColor("#e0e0e0");
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);

      // Header Row 2: Customer (Left) and Company Details (Right)
      y += 8;
      const row2Y = y;

      // Customer (Left Section)
      doc.setFontSize(12);
      doc.setFont("THSarabunNew", "normal");
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
          "#000000",
          5,
        );
        if (data.customerCompany.taxId) {
          customerY += addWrappedText(
            `Tax ID: ${data.customerCompany.taxId}${data.customerCompany.branch ? ` (สาขา: ${data.customerCompany.branch})` : ""}`,
            margin,
            customerY,
            contentWidth * 0.45,
            9,
          );
        }
        customerY += addWrappedText(
          data.customerCompany.companyAddress || "",
          margin,
          customerY,
          contentWidth * 0.45,
          9,
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
          5,
        );
        customerY += addWrappedText(
          data.contactor?.contactorAddress || "",
          margin,
          customerY,
          contentWidth * 0.45,
          9,
        );
        customerY += addWrappedText(
          `โทร: ${data.contactor?.contactorTel || ""}`,
          margin,
          customerY,
          contentWidth * 0.45,
          9,
        );
      }

      // Company Details (Right Section)
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
        5,
      );
      companyDetailY += addWrappedText(
        data.companyAddress,
        companyX,
        companyDetailY,
        contentWidth * 0.45,
        9,
        false,
        "#000000",
        4,
      );
      companyDetailY += addWrappedText(
        `โทร: ${data.companyTel}`,
        companyX,
        companyDetailY,
        contentWidth * 0.45,
        9,
        false,
        "#000000",
        4,
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
          4,
        );
      }

      y = Math.max(customerY, companyDetailY) + 5;

      // Table setup
      const tableTop = y;

      // Column definitions - properly spaced for A4 page with 15mm margins
      const colX = [
        margin,
        margin + 10,
        margin + 90,
        margin + 100,
        margin + 115,
        margin + 140,
      ];
      const colWidths = [10, 80, 10, 15, 25, 40];

      // Table header
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
        doc.text(h, colX[i] + 2, y + 5.5);
      });
      doc.setFillColor(255, 255, 255);
      y += 8;

      // Table body
      data.categories.forEach((cat, catIdx) => {
        // Category header
        if (y + 10 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        doc.setFillColor(25, 118, 210);
        doc.rect(margin, y, contentWidth, 6, "F");
        doc.setFontSize(10);
        doc.setFont("THSarabunNew", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text(`${catIdx + 1}. ${cat.name}`, margin + 2, y + 4.5);
        y += 11; // Move down after category header

        // Category items
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

          // Details (name, description, remark)
          const detailParts = [item.name];
          if (item.description)
            detailParts.push(`รายละเอียด: ${item.description}`);
          if (item.remark) detailParts.push(`หมายเหตุ: ${item.remark}`);
          const detailText = detailParts.join(" ");
          const detailLines = doc.splitTextToSize(detailText, colWidths[1] - 2);

          // Use dynamic detailSpacing
          doc.text(detailLines, colX[1] + 2, y, {
            lineHeightFactor: 1.2 + detailSpacing * 0.05,
            charSpace: 0,
          });
          const detailHeight = detailLines.length * (4 + detailSpacing);

          // Qty
          doc.text(String(item.qty), colX[2] + colWidths[2] / 2, y, {
            align: "center",
          });

          // Unit
          doc.text(item.unit, colX[3] + colWidths[3] / 2, y, {
            align: "center",
          });

          // Price
          doc.text(fmt(item.pricePerUnit), colX[4] + colWidths[4] - 2, y, {
            align: "right",
          });

          // Total
          doc.text(fmt(itemTotal), colX[5] + colWidths[5] - 2, y, {
            align: "right",
          });

          y += Math.max(12, detailHeight + 2);
        });

        // Category subtotal
        if (y + 8 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(224, 224, 224);
        doc.rect(margin, y, contentWidth, 6, "F");
        doc.setFontSize(9);
        doc.setFont("THSarabunNew", "normal");
        doc.setTextColor(21, 101, 192);
        doc.text(`รวม ${cat.name}:`, colX[4], y + 4, { align: "right" });
        doc.text(
          fmt(getCategoryTotal(cat)),
          colX[5] + colWidths[5] - 2,
          y + 4,
          { align: "right" },
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
        fmt,
        getSubtotal,
        getTaxAmount,
        getWithholdingTaxAmount,
        getGrandTotal,
      );

      // Generate PDF blob
      const blob = await doc.output("blob");

      // Cleanup old URL
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      pdfBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setNotification({
        open: true,
        message: "สร้าง PDF สำเร็จ",
        severity: "success",
      });
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setNotification({
        open: true,
        message: `PDF Error: ${err.message}`,
        severity: "error",
      });
    } finally {
      setGenerating(false);
    }
  }, [
    data,
    detailSpacing,
    fmt,
    getCategoryTotal,
    getGrandTotal,
    getSubtotal,
    getTaxAmount,
    getWithholdingTaxAmount,
    pdfUrl,
  ]);

  // Auto-generate when data or settings change
  useEffect(() => {
    if (data && !generating) {
      generatePDF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, detailSpacing]);

  // Close and cleanup
  const handleClose = () => {
    if (pdfBlobRef.current && pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      pdfBlobRef.current = null;
    }
    router.back();
  };

  // Handle PDF download
  const handleDownload = () => {
    if (pdfBlobRef.current && pdfUrl) {
      // Create a temporary link to download the blob
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = `quotation-${data?.documentIdNo || "document"}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setNotification({
        open: true,
        message: "ดาวน์โหลด PDF สำเร็จ",
        severity: "success",
      });
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} thickness={4} />
        <Typography>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={4}>
        <Typography color="error">เกิดข้อผิดพลาด: {error}</Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mt: 2 }}
        >
          ย้อนกลับ
        </Button>
      </Box>
    );
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Toolbar */}
      <Box
        className="no-print"
        sx={{
          bgcolor: "white",
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          boxShadow: 1,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={handleClose}
              variant="outlined"
              size="small"
            >
              ย้อนกลับ
            </Button>

            <Box display="flex" gap={1} alignItems="center">
              <Typography variant="body2" sx={{ mr: 1, fontWeight: "bold" }}>
                ระยะห่างรายละเอียด:
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() =>
                  setDetailSpacing((prev) => Math.max(0, prev - 0.5))
                }
              >
                ลด
              </Button>
              <Typography
                variant="body2"
                sx={{ minWidth: 20, textAlign: "center" }}
              >
                {detailSpacing}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setDetailSpacing((prev) => prev + 0.5)}
              >
                เพิ่ม
              </Button>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
              {generating && <CircularProgress size={20} />}
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={handleDownload}
                variant="contained"
                disabled={!pdfUrl}
                size="small"
              >
                ดาวน์โหลด PDF
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* PDF Preview */}
      <Box
        sx={{
          bgcolor: "#f0f0f0",
          minHeight: "calc(100vh - 73px)",
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {pdfUrl ? (
          <Paper
            elevation={3}
            sx={{
              width: "210mm",
              minHeight: "297mm",
              bgcolor: "white",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              title="PDF Preview"
              style={{
                width: "100%",
                height: "calc(100vh - 120px)",
                border: "none",
              }}
            />
          </Paper>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={2}
          >
            <CircularProgress size={60} thickness={4} />
            <Typography variant="h6" color="text.secondary">
              กำลังสร้าง PDF...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รอสักครู่ กำลังจัดร่างใบเสนอราคา
            </Typography>
          </Box>
        )}
      </Box>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={notification.severity}
          onClose={() => setNotification({ ...notification, open: false })}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
