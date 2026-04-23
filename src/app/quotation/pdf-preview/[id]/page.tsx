"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Paper,
  Divider,
  Grid,
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useRouter, useSearchParams } from "next/navigation";
import '.././../../../../public/fonts/pdf/Prompt-Regular-normal';

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

  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [data, setData] = useState<QuotationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "info",
  });

  const printAreaRef = useRef<HTMLDivElement>(null);
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
        setData(json.data || json);
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
  const fmt = (num: number) => num.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Calculate totals
  const getSubtotal = useCallback(() => {
    if (!data) return 0;
    return data.categories.reduce((sum, cat) => {
      return sum + cat.items.reduce((s, item) => s + item.qty * item.pricePerUnit, 0);
    }, 0);
  }, [data]);

  const getTaxAmount = useCallback(() => {
    if (!data) return 0;
    return data.includeVat ? (getSubtotal() - (data.globalDiscount || 0)) * 0.07 : 0;
  }, [data, getSubtotal]);

  const getWithholdingTaxAmount = useCallback(() => {
    if (!data) return 0;
    return ((getSubtotal() - (data.globalDiscount || 0)) * (data.withholdingTax || 0)) / 100;
  }, [data, getSubtotal]);

  const getGrandTotal = useCallback(() => {
    return getSubtotal() - (data?.globalDiscount || 0) + getTaxAmount() - getWithholdingTaxAmount();
  }, [data, getSubtotal, getTaxAmount, getWithholdingTaxAmount]);

   const getCategoryTotal = useCallback((cat: Category) => {
     return cat.items.reduce((sum, item) => sum + item.qty * item.pricePerUnit, 0);
   }, []);

   // Professional Bottom Section Function
   const generateProfessionalBottomSection = (doc: any, data: any, startY: number, pageWidth: number, pageHeight: number, margin: number, contentWidth: number, fmt: any, getSubtotal: any, getTaxAmount: any, getWithholdingTaxAmount: any, getGrandTotal: any) => {
     let y = startY + 3;

     if (y + 100 > pageHeight - margin) {
       doc.addPage();
       y = margin;
     }

     // 2-column layout: Notes (left) and Summary (right)
     const leftWidth = contentWidth * 0.45;
     const rightWidth = contentWidth * 0.5;
     const rightX = pageWidth - margin - rightWidth;

     // Left: Notes section
     doc.setFontSize(12);
     doc.setFont("Prompt-Regular", "normal");
     doc.setTextColor(0, 0, 0);
     doc.text("หมายเหตุ:", margin, y);
     y += 8;
     doc.setFontSize(10);
     const noteLines = doc.splitTextToSize(data.note || "-", leftWidth - 10);
     doc.text(noteLines, margin + 5, y);
     const notesHeight = noteLines.length * 5;

     // Right: Financial Summary with professional styling
     const summaryY = y - 8; // Align with notes title
     // Outer box with subtle border
     doc.setDrawColor(200, 200, 200);
     doc.setLineWidth(0.25);
     doc.roundedRect(rightX, summaryY, rightWidth, 60, 3, 3, "S");

     // Summary title
     doc.setFillColor(230, 240, 250);
     doc.roundedRect(rightX + 3, summaryY + 3, rightWidth - 6, 10, 2, 2, "F");
     doc.setFontSize(10);
     doc.setFont("Prompt-Regular", "normal");
     doc.setTextColor(0, 0, 0);
     doc.text("สรุปยอดเงิน", rightX + 8, summaryY + 10);

     let tableY = summaryY + 18;

     // Subtotal
     doc.setFontSize(9);
     doc.setTextColor(0, 0, 0);
     doc.text("ยอดรวมสินค้า:", rightX + 10, tableY + 4);
     doc.text(fmt(getSubtotal()) + " บาท", rightX + rightWidth - 10, tableY + 4, { align: "right" });
     tableY += 8;

     // Discount
     if (data.globalDiscount > 0) {
       doc.text("ส่วนลด:", rightX + 10, tableY + 4);
       doc.text("-" + fmt(data.globalDiscount) + " บาท", rightX + rightWidth - 10, tableY + 4, { align: "right" });
       tableY += 8;
     }

     // VAT
     const vatText = data.includeVat ? "ภาษีมูลค่าเพิ่ม (7%)" : "ภาษีมูลค่าเพิ่ม (0%)";
     doc.text(vatText, rightX + 10, tableY + 4);
     doc.text(fmt(getTaxAmount()) + " บาท", rightX + rightWidth - 10, tableY + 4, { align: "right" });
     tableY += 8;

     // Withholding Tax
     if (data.withholdingTax > 0) {
       const wtText = `หัก ณ ที่จ่าย (${data.withholdingTax}%)`;
       doc.text(wtText, rightX + 10, tableY + 4);
       doc.text("-" + fmt(getWithholdingTaxAmount()) + " บาท", rightX + rightWidth - 10, tableY + 4, { align: "right" });
       tableY += 8;
     }

     // Divider line
     doc.setDrawColor(180, 180, 180);
     doc.setLineWidth(0.5);
     doc.line(rightX + 10, tableY + 4, rightX + rightWidth - 10, tableY + 4);
     tableY += 10;

     // Total with highlight
     doc.setFillColor(25, 118, 210);
     doc.roundedRect(rightX + 5, tableY - 2, rightWidth - 10, 14, 2, 2, "F");
     doc.setFontSize(11);
     doc.setFont("Prompt-Regular", "normal");
     doc.setTextColor(255, 255, 255);
     doc.text("รวมทั้งสิ้น:", rightX + 15, tableY + 8);
     doc.text(fmt(getGrandTotal()) + " บาท", rightX + rightWidth - 15, tableY + 8, { align: "right" });

     y = Math.max(y + notesHeight + 15, summaryY + 75);

     // Signature Section with professional styling
     if (y + 50 > pageHeight - margin) {
       doc.addPage();
       y = margin;
     }

     y += 15;
     const sigY = y;
     doc.setFontSize(10);
     doc.setFont("Prompt-Regular", "normal");
     doc.setTextColor(0, 0, 0);

     // Three signature boxes with labels
     const sigWidth = 55;
     const sigSpacing = (pageWidth - margin * 2 - sigWidth * 3) / 4;
     const startX = margin + sigSpacing;
     const positions = [
       startX,
       startX + sigWidth + sigSpacing * 2,
       startX + (sigWidth + sigSpacing * 2) * 2
     ];

     positions.forEach((sx, idx) => {
       // Box
       doc.setDrawColor(0, 0, 0);
       doc.setLineWidth(0.5);
       doc.roundedRect(sx, sigY, sigWidth, 35, 2, 2, "S");

       // Signature line
       doc.setLineWidth(0.25);
       doc.line(sx + 8, sigY + 22, sx + sigWidth - 8, sigY + 22);

       // Labels
       const labels = ["ผู้อนุมัติ / ผู้ว่าจ้าง", "ผู้เสนอราคา / ผู้รับจ้าง", "พยาน"];
       doc.setFontSize(9);
       doc.text(labels[idx], sx + sigWidth / 2, sigY + 5, { align: "center" });
       
       // Line label
       doc.setFontSize(8);
       doc.text("(ลงชื่อ)", sx + sigWidth / 2, sigY + 28, { align: "center" });
     });

     y = sigY + 40;

     // Footer
     if (y + 20 > pageHeight - margin) {
       doc.addPage();
       y = margin;
     }

     doc.setFontSize(8);
     doc.setTextColor(100, 100, 100);
     const footerText = `เอกสารนี้สร้างขึ้นโดยอัตโนมัติ เมื่อวันที่ ${new Date().toLocaleDateString("th-TH")} เวลา ${new Date().toLocaleTimeString("th-TH")}`;
     doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: "center" });
     doc.text("ขอบคุณที่ให้ความไว้วางใจใช้บริการ", pageWidth / 2, pageHeight - 8, { align: "center" });

     return y;
   };

   // Generate PDF directly using jsPDF (no HTML-to-PDF conversion)
  const generatePDF = async () => {
    if (!data) return;

    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Load custom Prompt font for Thai/UTF-8 support
      // const script = document.createElement('script');
      // script.src = '/fonts/pdf/Prompt-Regular-normal.js';
      // document.head.appendChild(script);
      // await new Promise((resolve) => {
      //   script.onload = resolve;
      // });
      doc.setFont("Prompt-Regular", "normal");

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      // Helper for wrapped text
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, bold: boolean = false, color: string = "#000000", lineHeight: number = 4) => {
        doc.setFontSize(fontSize);
        doc.setFont("Prompt-Regular", "normal");
        doc.setTextColor(color);
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return lines.length * lineHeight + (lineHeight * 0.5);
      };

      // Page 1: Header
      y += addWrappedText(data.companyName, margin, y, contentWidth * 0.5, 14, true, "#1976d2", 6);
      y += addWrappedText(data.companyAddress, margin, y, contentWidth * 0.5, 9, false, "#000000", 4);
      y += addWrappedText(`โทร: ${data.companyTel}`, margin, y, contentWidth * 0.5, 9, false, "#000000", 4);
      if (data.companyTaxId) {
        y += addWrappedText(`Tax ID: ${data.companyTaxId}`, margin, y, contentWidth * 0.5, 9, false, "#000000", 4);
      }

      // Quotation title (right-aligned)
      doc.setFontSize(18);
      doc.setFont("Prompt-Regular", "normal");
      doc.setTextColor("#1976d2");
      doc.text("ใบเสนอราคา", pageWidth - margin, y - 10, { align: "right" });

      y += 5;
      doc.setFontSize(10);
      doc.setFont("Prompt-Regular", "normal");
      doc.setTextColor("#000000");
      doc.text(`เลขที่: ${data.documentIdNo}`, pageWidth - margin, y, { align: "right" });
      y += 5;
      doc.text(`วันที่: ${new Date(data.documentCreateDate).toLocaleDateString("th-TH")}`, pageWidth - margin, y, { align: "right" });

      // Customer
      y += 10;
      doc.setFontSize(12);
      doc.setFont("Prompt-Regular", "normal");
      doc.text("ลูกค้า / ผู้ว่าจ้าง:", margin, y);

      y += 6;
      doc.setFontSize(10);
      doc.setFont("Prompt-Regular", "normal");
      if (data.customerCompany?.taxId) {
        y += addWrappedText(data.customerCompany.companyName || "", margin, y, contentWidth, 11, true, "#000000", 5);
        if (data.customerCompany.taxId) {
          y += addWrappedText(
            `Tax ID: ${data.customerCompany.taxId}${data.customerCompany.branch ? ` (สาขา: ${data.customerCompany.branch})` : ""}`,
            margin,
            y,
            contentWidth,
            9
          );
        }
        y += addWrappedText(data.customerCompany.companyAddress || "", margin, y, contentWidth, 9);
      } else {
        y += addWrappedText(`คุณ ${data.contactor?.contactorName || ""}`, margin, y, contentWidth, 11, true, "#000000", 5);
        y += addWrappedText(data.contactor?.contactorAddress || "", margin, y, contentWidth, 9);
        y += addWrappedText(`โทร: ${data.contactor?.contactorTel || ""}`, margin, y, contentWidth, 9);
      }

      // Table setup
      y += 10;
      const tableTop = y;

        // Column definitions - properly spaced for A4 page with 15mm margins
        const colX = [margin, margin + 10, margin + 90, margin + 100, margin + 115, margin + 140];
        const colWidths = [10, 80, 10, 15, 25, 40];

      // Table header
      doc.setFillColor(234, 234, 234);
      doc.setFontSize(8);
      doc.setFont("Prompt-Regular", "normal");
      doc.setTextColor(152, 152, 152);
      const headers = ["NO.", "สินค้า / รายละเอียด", "จำนวน", "หน่วย", "ราคา/หน่วย", "จำนวนเงิน (บาท)"];
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
        doc.setFont("Prompt-Regular", "normal");
        doc.setTextColor(255, 255, 255);
        doc.text(`${catIdx + 1}. ${cat.name}`, margin + 2, y + 4.5);
        y += 6;

        // Category items
        cat.items.forEach((item, itemIdx) => {
          if (y + 12 > pageHeight - margin) {
            doc.addPage();
            y = margin;
          }

          doc.setFontSize(9);
          doc.setFont("Prompt-Regular", "normal");
          doc.setTextColor(0, 0, 0);

          const itemTotal = item.qty * item.pricePerUnit;

          // No.
          doc.text(`${catIdx + 1}.${itemIdx + 1}`, colX[0] + 2, y + 5);

          // Details (name, description, remark)
          const detailParts = [item.name];
          if (item.description) detailParts.push(`รายละเอียด: ${item.description}`);
          if (item.remark) detailParts.push(`หมายเหตุ: ${item.remark}`);
          const detailText = detailParts.join(" ");
          const detailLines = doc.splitTextToSize(detailText, colWidths[1] - 2);
          doc.text(detailLines, colX[1] + 2, y);
          const detailHeight = detailLines.length * 4;

          // Qty
          doc.text(String(item.qty), colX[2] + colWidths[2] / 2, y + 3.5, { align: "center" });

          // Unit
          doc.text(item.unit, colX[3] + colWidths[3] / 2, y + 3.5, { align: "center" });

          // Price
          doc.text(fmt(item.pricePerUnit), colX[4] + colWidths[4] - 2, y + 3.5, { align: "right" });

          // Total
          doc.text(fmt(itemTotal), colX[5] + colWidths[5] - 2, y + 3.5, { align: "right" });

          y += Math.max(8, detailHeight);
        });

        // Category subtotal
        if (y + 8 > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.setFillColor(224, 224, 224);
        doc.rect(margin, y, contentWidth, 6, "F");
        doc.setFontSize(9);
        doc.setFont("Prompt-Regular", "normal");
        doc.setTextColor(21, 101, 192);
        doc.text(`รวม ${cat.name}:`, colX[4], y + 4, { align: "right" });
        doc.text(fmt(getCategoryTotal(cat)), colX[5] + colWidths[5] - 2, y + 4, { align: "right" });
        y += 6;
       });

       // Professional Bottom Section
       const finalY = generateProfessionalBottomSection(doc, data, y, pageWidth, pageHeight, margin, contentWidth, fmt, getSubtotal, getTaxAmount, getWithholdingTaxAmount, getGrandTotal);

       // Generate PDF blob
      const blob = await doc.output("blob");
      pdfBlobRef.current = blob;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setNotification({ open: true, message: "PDF generated successfully", severity: "success" });
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setNotification({ open: true, message: `PDF Error: ${err.message}`, severity: "error" });
     } finally {
       setGenerating(false);
     }
   };

   // Auto-generate when data is ready
   useEffect(() => {
     if (data && !pdfUrl && !generating) {
       generatePDF();
     }
   }, [data, pdfUrl, generating, generatePDF]);

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
       const downloadLink = document.createElement('a');
       downloadLink.href = pdfUrl;
       downloadLink.download = `quotation-${data?.documentIdNo || 'document'}.pdf`;
       document.body.appendChild(downloadLink);
       downloadLink.click();
       document.body.removeChild(downloadLink);
       
       setNotification({ 
         open: true, 
         message: "PDF downloaded successfully", 
         severity: "success" 
       });
     }
   };

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh" gap={2}>
        <CircularProgress size={40} thickness={4} />
        <Typography>กำลังโหลดข้อมูล...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box p={4}>
        <Typography color="error">เกิดข้อผิดพลาด: {error}</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
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
      <Box className="no-print" sx={{ bgcolor: "grey.100", py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button startIcon={<ArrowBackIcon />} onClick={handleClose} variant="outlined">
              ย้อนกลับ
            </Button>
            <Box display="flex" gap={2} alignItems="center">
              {generating && <CircularProgress size={24} />}
              <Button startIcon={<FileDownloadIcon />} onClick={handleDownload} variant="outlined" disabled={!pdfUrl}>
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
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
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
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
}
