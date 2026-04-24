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
          alignItems: "flex-start"
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
