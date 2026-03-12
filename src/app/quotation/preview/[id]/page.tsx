"use client";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  CircularProgress,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
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
  const isPrint = searchParams.get("print") === "true";
  const [loading, setLoading] = useState(true);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-print-area");
    if (!element) return;

    // Dynamic import to avoid SSR issues with html2pdf.js
    const html2pdf = (await import("html2pdf.js")).default;

    const opt = {
      margin: 0,
      filename: `Quotation-${headForm.quotationNumber || "document"}.pdf`,
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

    const doc = html2pdf().set(opt).from(element);

    if (isPrint) {
      // ถ้าเป็นโหมด auto-print ให้ดาวน์โหลด (iframe จะถูกจัดการโดยต้นทาง)
      await doc.save();
    } else {
      // ถ้ากดเองให้ดาวน์โหลดเฉยๆ
      doc.save();
    }
  };

  useEffect(() => {
    if (!loading && isPrint) {
      const timer = setTimeout(() => {
        handleDownloadPDF();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loading, isPrint]);

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/` },
      { name: "ใบเสนอ", href: `/quotation` },
      { name: "ตัวอย่างใบเสนอราคา" },
    ]);
    return () => {
      setBreadcrumbs([]);
      setBreadcrumbs([]);
      setCategories([]);
      setWithholdingTaxRate(0);
      setDiscount(0);
      setVatIncluded(false);
      // โหลดข้อมูลบริษัทและผู้ติดต่อ
      setHeadForm(headerClean);
    };
  }, []);

  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/income/quotation/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quotation");
        }

        const quotation = await response.json();
        console.log("✅ Loaded quotation data for preview:", quotation);

        // แปลงข้อมูล categories เป็น format ของ PricingContext
        const categories =
          quotation.categories?.map((cat: any, catIndex: number) => {
            return {
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
            };
          }) || [];

        // คำนวณยอดรวมเพื่อหาอัตราภาษีหัก ณ ที่จ่าย (เนื่องจากใน DB เก็บเป็นยอดเงิน)
        const subtotal = categories.reduce((sum: number, cat: any) =>
          sum + cat.subItems.reduce((s: number, item: any) => s + (item.qty * item.pricePerUnit), 0)
          , 0);
        const totalAfterDiscount = subtotal - (quotation.globalDiscount || 0);
        const whtAmount = quotation.withholdingTax || 0;
        const whtRate = totalAfterDiscount > 0 ? Math.round((whtAmount / totalAfterDiscount) * 100) : 0;

        // โหลดข้อมูลเข้า PricingContext
        setCategories(categories);
        setWithholdingTaxRate(whtRate);
        setDiscount(quotation.globalDiscount);
        setVatIncluded(quotation.includeVat);

        // โหลดข้อมูลเข้า headForm
        // NOTE: ใน Quotation model ของเราดูเหมือนจะไม่ได้เก็บ "Our Company" แยกไว้ในตาราง DocumentPaper 
        // แต่อาจจะใช้ข้อมูลจาก favorite CompanyProfile มาแทน หรือเก็บไว้ใน fields อื่น
        // สำหรับตอนนี้เราจะแมปตาม logic ที่ถูกต้องคือ customerCompany fields ไปลง customer fields ใน headForm
        setHeadForm({
          quotationNumber: quotation.documentIdNo || "",
          
          // Issuer Info (Our Company) - Ideally this should come from where it was saved, but let's leave it for now or use placeholders if unknown
          companyName: "", 
          companyTel: "",
          companyAddress: "",
          taxId: "",
          branch: "",

          // Customer Company Info
          customerCompanyName: quotation.customerCompany?.companyName || "",
          customerCompanyTel: quotation.customerCompany?.companyTel || "",
          customerCompanyAddress: quotation.customerCompany?.companyAddress || "",
          customerTaxId: quotation.customerCompany?.taxId || "",
          customerBranch: quotation.customerCompany?.branch || "",

          // Contactor Info
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
        alert("ไม่สามารถโหลดข้อมูลใบเสนอราคาได้");
        router.push(`/quotation`);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchQuotationData();
    }
  }, [params.id, router]); // Reduced dependencies to prevent infinite loop

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    router.push("/quotation");
  };

  if (loading) {
    return (
      <PageContainer title="กำลังโหลด..." description="">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50vh",
            gap: 2,
          }}
        >
          <CircularProgress />
          <Typography>กำลังโหลดข้อมูล...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <Box
      sx={{
        "@media print": {
          "& .no-print": {
            display: "none",
          },
        },
      }}
    >
      <Container
        maxWidth="md"
        className="no-print"
        sx={{ py: 3, display: "flex", justifyContent: "flex-start", gap: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: "none" }}
        >
          กลับ
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          onClick={handlePrint}
          sx={{ textTransform: "none" }}
        >
          พิมพ์ใบเสนอราคา
        </Button>
      </Container>
      <div id="invoice-print-area" className={isPrint ? "pdf-capture-mode" : ""}>
        <InvoicePrintPage />
      </div>
    </Box>
  );
}
