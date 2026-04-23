"use client";

import { useEffect, useState, useRef } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Grid,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function NewQuotationPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const id = searchParams.get("id") || "1";
  const isPrintMode = searchParams.get("print") === "true";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<QuotationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const printAreaRef = useRef<HTMLDivElement>(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/income/quotation/${params.id}`);
        if (!res.ok) throw new Error("Failed to fetch");
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

  // Auto-download PDF
  useEffect(() => {
    if (!loading && isPrintMode && data) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, isPrintMode, data]);

  // Format number
  const fmt = (num: number) => num.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Calculate totals
  const getSubtotal = () => {
    if (!data) return 0;
    return data.categories.reduce((sum, cat) => {
      const catTotal = cat.items.reduce((s, item) => s + item.qty * item.pricePerUnit, 0);
      return sum + catTotal;
    }, 0);
  };

  const getTaxAmount = () => {
    if (!data) return 0;
    return data.includeVat ? (getSubtotal() - (data.globalDiscount || 0)) * 0.07 : 0;
  };

  const getWithholdingTaxAmount = () => {
    if (!data) return 0;
    return ((getSubtotal() - (data.globalDiscount || 0)) * (data.withholdingTax || 0)) / 100;
  };

  const getGrandTotal = () => {
    return getSubtotal() - (data?.globalDiscount || 0) + getTaxAmount() - getWithholdingTaxAmount();
  };

  const getCategoryTotal = (cat: Category) => {
    return cat.items.reduce((sum, item) => sum + item.qty * item.pricePerUnit, 0);
  };

  // PDF export using html2pdf
  const handleDownloadPDF = async () => {
    const element = printAreaRef.current;
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `${data?.documentIdNo || "quotation"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        scrollY: 0,
        scrollX: 0,
      },
      jsPDF: {
        unit: "mm" as const,
        format: "a4" as const,
        orientation: "portrait" as const,
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Error:", error);
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
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mt: 2 }}>
          ย้อนกลับ
        </Button>
      </Box>
    );
  }

  return (
    <>
      {/* Print-only styles */}
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
          .print-page {
            page-break-after: always;
            break-after: page;
          }
          .print-page:last-child {
            page-break-after: auto;
          }
          .avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      {/* Toolbar */}
      <Box className="no-print" sx={{ bgcolor: "grey.100", py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} variant="outlined">
              ย้อนกลับ
            </Button>
            <Box display="flex" gap={2}>
              <Button startIcon={<FileDownloadIcon />} onClick={handleDownloadPDF} variant="outlined">
                ดาวน์โหลด PDF
              </Button>
              <Button startIcon={<PrintIcon />} onClick={() => window.print()} variant="contained">
                พิมพ์เอกสาร
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Print Content Area */}
      <Box ref={printAreaRef} id="print-area">
        {/* Page 1: Items Table */}
        <Box
          className="print-page"
          sx={{
            width: "210mm",
            minHeight: "297mm",
            bgcolor: "white",
            p: "15mm",
            boxSizing: "border-box",
            mx: "auto",
            mb: 2,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            "@media print": {
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm",
              margin: 0,
              boxShadow: "none",
              border: "none",
              mb: 0,
            },
          }}
        >
          {/* Items Table */}
          <Box flex={1} minHeight={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.200" }}>
                    <TableCell sx={{ fontWeight: "bold", width: "50px" }}>NO.</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>สินค้า / รายละเอียด</TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "80px" }} align="center">
                      จำนวน
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "80px" }} align="center">
                      หน่วย
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "120px" }} align="right">
                      ราคา/หน่วย
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "140px" }} align="right">
                      จำนวนเงิน (บาท)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.categories.map((cat, catIdx) => {
                    const catTotal = getCategoryTotal(cat);
                    return (
                      <>
                        {/* Category Header */}
                        <TableRow key={`cat-${catIdx}`}>
                          <TableCell
                            colSpan={6}
                            sx={{
                              bgcolor: "#1976d2",
                              color: "white",
                              fontWeight: "bold",
                              py: 1,
                            }}
                          >
                            {catIdx + 1}. {cat.name}
                          </TableCell>
                        </TableRow>
                        {/* Items */}
                        {cat.items.map((item, itemIdx) => {
                          const itemTotal = item.qty * item.pricePerUnit;
                          return (
                            <TableRow key={`item-${catIdx}-${itemIdx}`}>
                              <TableCell align="center">{catIdx + 1}.{itemIdx + 1}</TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight="medium">
                                  {item.name}
                                </Typography>
                                {item.description && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    sx={{ mt: 0.5 }}
                                  >
                                    รายละเอียด: {item.description}
                                  </Typography>
                                )}
                                {item.remark && (
                                  <Typography variant="caption" color="error" display="block" sx={{ mt: 0.5 }}>
                                    หมายเหตุ: {item.remark}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="center">{item.qty}</TableCell>
                              <TableCell align="center">{item.unit}</TableCell>
                              <TableCell align="right">{fmt(item.pricePerUnit)}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                {fmt(itemTotal)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {/* Category Subtotal */}
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            align="right"
                            sx={{ bgcolor: "#e0e0e0", fontWeight: "bold" }}
                          >
                            รวม {cat.name}:
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ bgcolor: "#e0e0e0", fontWeight: "bold", color: "#1565c0" }}
                          >
                            {fmt(catTotal)}
                          </TableCell>
                        </TableRow>
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Footer */}
          <Box mt="auto" pt={2}>
            <Box
              sx={{
                height: "15px",
                bgcolor: "#1976d2",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "150px",
                  height: "100%",
                  bgcolor: "#115293",
                  clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
                },
              }}
            />
          </Box>
        </Box>

        {/* Page 2: Header and Customer Info */}
        <Box
          className="print-page"
          sx={{
            width: "210mm",
            minHeight: "297mm",
            bgcolor: "white",
            p: "15mm",
            boxSizing: "border-box",
            mx: "auto",
            mb: 2,
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            "@media print": {
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm",
              margin: 0,
              boxShadow: "none",
              border: "none",
              mb: 0,
            },
          }}
        >
          {/* Header */}
          <Box mb={2}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box>
                  <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                    {data.companyName}
                  </Typography>
                  <Typography variant="body2">{data.companyAddress}</Typography>
                  <Typography variant="body2">โทร: {data.companyTel}</Typography>
                  {data.companyTaxId && (
                    <Typography variant="body2">Tax ID: {data.companyTaxId}</Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="right">
                  <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                    ใบเสนอราคา
                  </Typography>
                  <Typography variant="body2">เลขที่: {data.documentIdNo}</Typography>
                  <Typography variant="body2">
                    วันที่: {new Date(data.documentCreateDate).toLocaleDateString("th-TH")}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Customer Info */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              ลูกค้า / ผู้ว่าจ้าง
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                {data.customerCompany?.taxId ? (
                  <>
                    <Typography variant="body1" fontWeight="bold">
                      {data.customerCompany.companyName}
                    </Typography>
                    {data.customerCompany.taxId && (
                      <Typography variant="body2">
                        Tax ID: {data.customerCompany.taxId}
                        {data.customerCompany.branch && ` (สาขา: ${data.customerCompany.branch})`}
                      </Typography>
                    )}
                    <Typography variant="body2">{data.customerCompany.companyAddress}</Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" fontWeight="bold">
                      คุณ {data.contactor?.contactorName}
                    </Typography>
                    <Typography variant="body2">{data.contactor?.contactorAddress}</Typography>
                    <Typography variant="body2">โทร: {data.contactor?.contactorTel}</Typography>
                  </>
                )}
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box mt="auto" pt={2}>
            <Box
              sx={{
                height: "15px",
                bgcolor: "#1976d2",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "150px",
                  height: "100%",
                  bgcolor: "#115293",
                  clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
                },
              }}
            />
          </Box>
        </Box>

        {/* Page 3: Summary and Signature */}
        <Box
          className="print-page"
          sx={{
            width: "210mm",
            minHeight: "297mm",
            bgcolor: "white",
            p: "15mm",
            boxSizing: "border-box",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e0e0e0",
            "@media print": {
              width: "210mm",
              minHeight: "297mm",
              padding: "15mm",
              margin: 0,
              boxShadow: "none",
              border: "none",
            },
          }}
        >
          {/* Summary Section */}
          <Box mt={2} className="avoid-break">
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  หมายเหตุ:
                </Typography>
                <Typography variant="body2" color="text.secondary" whiteSpace="pre-wrap">
                  {data.note || "-"}
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Paper sx={{ p: 2, bgcolor: "#f5f5f5" }}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">ยอดรวมย่อย:</Typography>
                    <Typography variant="body2">{fmt(getSubtotal())} บาท</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">ส่วนลด:</Typography>
                    <Typography variant="body2">{fmt(data.globalDiscount)} บาท</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">
                      ภาษีมูลค่าเพิ่ม {data.includeVat && "(7%)"}:
                    </Typography>
                    <Typography variant="body2">{fmt(getTaxAmount())} บาท</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2">
                      หัก ณ ที่จ่าย {data.withholdingTax && `(${data.withholdingTax}%)`}:
                    </Typography>
                    <Typography variant="body2">{fmt(getWithholdingTaxAmount())} บาท</Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">
                      รวมทั้งสิ้น:
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      {fmt(getGrandTotal())} บาท
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          {/* Signature */}
          <Box mt={3} className="avoid-break">
            <Grid container spacing={4}>
              <Grid item xs={4} textAlign="center">
                <Box borderBottom="1px solid black" width="200px" mx="auto" mb={1} height="40px" />
                <Typography variant="caption">ผู้อนุมัติ / ผู้ว่าจ้าง</Typography>
                <Typography variant="body2">
                  คุณ{" "}
                  {data.customerCompany?.taxId ? data.customerCompany.companyName : data.contactor?.contactorName}
                </Typography>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Box borderBottom="1px solid black" width="200px" mx="auto" mb={1} height="40px" />
                <Typography variant="caption">ผู้เสนอราคา / ผู้รับจ้าง</Typography>
                <Typography variant="body2">{data.companyName}</Typography>
              </Grid>
              <Grid item xs={4} textAlign="center">
                <Box borderBottom="1px dashed black" width="200px" mx="auto" mb={1} height="40px" />
                <Typography variant="caption">พยาน</Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Footer */}
          <Box mt="auto" pt={2}>
            <Box
              sx={{
                height: "15px",
                bgcolor: "#1976d2",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  width: "150px",
                  height: "100%",
                  bgcolor: "#115293",
                  clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}
