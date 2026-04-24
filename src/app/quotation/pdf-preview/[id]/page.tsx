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
import { generateQuotationPDF } from "@/services/pdf/quotationPDF";

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

  // Generate PDF using reusable service function
  const generatePDF = useCallback(async () => {
    if (!data) return;

    setGenerating(true);
    try {
      const blob = await generateQuotationPDF(data, { detailSpacing });

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
  }, [data, detailSpacing, pdfUrl]);

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
    if (pdfBlobRef.current && pdfUrl && data) {
      // Create a temporary link to download the blob
      const downloadLink = document.createElement("a");
      downloadLink.href = pdfUrl;
      downloadLink.download = `quotation-${data.documentIdNo}.pdf`;
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
