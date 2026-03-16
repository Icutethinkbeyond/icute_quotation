"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
  Stack,
  Paper,
  Divider,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InvoicePrintPage from "@/components/forms/preview/InvoicePreview";
import { usePricingContext } from "@/contexts/PricingContext";
import {
  headerClean,
  useQuotationListContext,
} from "@/contexts/QuotationContext";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter, useSearchParams } from "next/navigation";
import PageContainer from "@/components/shared/PageContainer";

export default function QuotationPreviewPage({
  params,
}: {
  params: { id: string };
}) {
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } =
    usePricingContext();
  const { headForm, setHeadForm } = useQuotationListContext();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPrintMode = searchParams.get("print") === "true";
  const [loading, setLoading] = useState(true);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `${headForm.quotationNumber || "document"}.pdf`,
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
      // pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF Generation Error:", error);
    }
  };

  useEffect(() => {
    if (!loading && isPrintMode) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, isPrintMode]);

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/` },
      { name: "ใบเสนอราคา", href: `/quotation` },
      { name: "ตัวอย่างเอกสาร" },
    ]);

    return () => {
      setBreadcrumbs([]);
      setCategories([]);
      setWithholdingTaxRate(0);
      setDiscount(0);
      setVatIncluded(false);
      setHeadForm(headerClean);
    };
  }, [
    setBreadcrumbs,
    setCategories,
    setWithholdingTaxRate,
    setDiscount,
    setVatIncluded,
    setHeadForm,
  ]);

  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/income/quotation/${params.id}`);

        if (!response.ok) throw new Error("Failed to fetch quotation");

        const quotation = await response.json();
        console.log("✅ Loaded data:", quotation);

        // Transform categories
        const transformedCategories =
          quotation.categories?.map((cat: any, catIndex: number) => ({
            id: `category-${catIndex + 1}`,
            name: cat.name,
            subItems:
              cat.items?.map((item: any, itemIndex: number) => ({
                id: `item-${catIndex + 1}-${itemIndex + 1}`,
                name: item.name || "",
                description: item.description,
                unit: item.unit || "ชิ้น",
                qty: item.qty,
                pricePerUnit: item.pricePerUnit,
                remark: item.remark || "",
              })) || [],
          })) || [];

        // Calculation mapping
        const subtotal = transformedCategories.reduce(
          (sum: number, cat: any) =>
            sum +
            cat.subItems.reduce(
              (s: number, item: any) => s + item.qty * item.pricePerUnit,
              0,
            ),
          0,
        );
        const totalAfterDiscount = subtotal - (quotation.globalDiscount || 0);
        const whtAmount = quotation.withholdingTax || 0;
        const whtRate =
          totalAfterDiscount > 0
            ? Math.round((whtAmount / totalAfterDiscount) * 100)
            : 0;

        setCategories(transformedCategories);
        setWithholdingTaxRate(whtRate);
        setDiscount(quotation.globalDiscount || 0);
        setVatIncluded(quotation.includeVat || false);

        setHeadForm({
          quotationNumber: quotation.documentIdNo || "",

          // Issuer (Our Company) - Loaded from Snapshot
          companyName: quotation.companyName || "",
          companyTel: quotation.companyTel || "",
          companyAddress: quotation.companyAddress || "",
          taxId: quotation.companyTaxId || "",
          branch: quotation.companyBranch || "",

          // Customer
          customerType: quotation.customerCompany?.taxId
            ? "Corporate"
            : "Individual",
          customerCompanyName: quotation.customerCompany?.companyName || "",
          customerCompanyTel: quotation.customerCompany?.companyTel || "",
          customerCompanyAddress:
            quotation.customerCompany?.companyAddress || "",
          customerTaxId: quotation.customerCompany?.taxId || "",
          customerBranch: quotation.customerCompany?.branch || "",

          // Contactor
          contactorName: quotation.contactor?.contactorName || "",
          contactorTel: quotation.contactor?.contactorTel || "",
          contactorEmail: quotation.contactor?.contactorEmail || "",
          contactorAddress: quotation.contactor?.contactorAddress || "",

          dateCreate: quotation.documentCreateDate
            ? new Date(quotation.documentCreateDate).toISOString().split("T")[0]
            : "",
          includeTax: quotation.includeVat || false,
          note: quotation.note || "",
        });
      } catch (error) {
        console.error("❌ Error loading quotation:", error);
        router.push(`/quotation`);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) fetchQuotationData();
  }, [
    params.id,
    router,
    setCategories,
    setDiscount,
    setVatIncluded,
    setWithholdingTaxRate,
    setHeadForm,
  ]);

  if (loading) {
    return (
      <PageContainer title="ดูตัวอย่างใบเสนอราคา">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          height="60vh"
          gap={2}
        >
          <CircularProgress size={40} thickness={4} />
          <Typography variant="body1" color="textSecondary">
            กำลังเตรียมตัวอย่างเอกสาร...
          </Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="กำลังโหลด...">
      <Box sx={{ bgcolor: "grey.100", minHeight: "100vh" }}>
        {/* Control Toolbar */}
        <Box
          className="no-print"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1000,
            bgcolor: "white",
            borderBottom: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
            py: 1.5,
          }}
        >
          <Container maxWidth="lg">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.push("/quotation")}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  ย้อนกลับ
                </Button>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{
                    display: { xs: "none", sm: "block" },
                    alignSelf: "center",
                  }}
                >
                  ตัวอย่าง: {headForm.quotationNumber}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<FileDownloadIcon />}
                  onClick={handleDownloadPDF}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  ดาวน์โหลด PDF
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PrintIcon />}
                  onClick={() => window.print()}
                  sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    px: 3,
                  }}
                >
                  พิมพ์เอกสาร
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Preview Area */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box
            id="invoice-print-area"
            className={isPrintMode ? "pdf-capture-mode" : ""}
            sx={{
              display: "flex",
              justifyContent: "center",
              "@media print": {
                p: 0,
                m: 0,
                display: "block",
              },
            }}
          >
            <InvoicePrintPage />
          </Box>
        </Container>

        {/* Global Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
            }
            .no-print {
              display: none !important;
            }
            #__next,
            main {
              margin: 0 !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </Box>
    </PageContainer>
  );
}
