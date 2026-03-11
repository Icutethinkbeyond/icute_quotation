"use client";

import { Grid2, Box } from "@mui/material";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import PricingTable from "@/components/forms/pricing-table/PricingTable";
import PricingSummary from "@/components/forms/pricing-table/PricingSummary";
import { useEffect, useState } from "react";
import { usePricingContext } from "@/contexts/PricingContext";
import { useQuotationListContext } from "@/contexts/QuotationContext";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";
import CompanyInformations from "@/components/forms/quotation/CompanyInformations";
import ContactorInformations from "@/components/forms/quotation/ContactorInformations";

function EditQuotation({ params }: { params: { id: string } }) {
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } =
    usePricingContext();
  const { setHeadForm } = useQuotationListContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotationData = async () => {
      try {
        setLoading(true);

        // 🛡️ Reset ข้อมูลเก่าก่อน fetch เพื่อป้องกันข้อมูลปนกัน
        console.log("🔄 Resetting old data before loading...");
        setCategories([]);
        setDiscount(0);
        setVatIncluded(false);
        setWithholdingTaxRate(0);

        const response = await fetch(`/api/income/quotation/${params.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch quotation");
        }

        const quotation = await response.json();
        console.log("✅ Loaded quotation data for edit:", quotation);

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

        console.log("📦 Transformed categories:", categories);

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
        setDiscount(quotation.globalDiscount || 0);
        setVatIncluded(quotation.includeVat || false);

        // โหลดข้อมูลบริษัทและผู้ติดต่อ
        setHeadForm({
          quotationNumber: quotation.documentIdNo || "",
          companyName: quotation.customerCompany?.companyName || "",
          companyTel: quotation.customerCompany?.companyTel || "",
          contactorName: quotation.contactor?.contactorName || "",
          contactorTel: quotation.contactor?.contactorTel || "",
          companyAddress: quotation.customerCompany?.companyAddress || "",
          contactorAddress: quotation.contactor?.contactorAddress || "",
          contactorEmail: quotation.contactor?.contactorEmail || "",
          taxId: quotation.customerCompany?.taxId || "",
          branch: quotation.customerCompany?.branch || "",
          dateCreate: quotation.documentCreateDate
            ? new Date(quotation.documentCreateDate).toISOString().split("T")[0]
            : "",
          includeTax: quotation.includeVat || false,
          note: quotation.note || "",
        });

        console.log("✅ Data loaded successfully!");
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
  }, [params.id]);


  if (loading) {
    return (
      <PageContainer title="กำลังโหลด..." description="">
        <Box sx={{ textAlign: "center", padding: "50px" }}>
          กำลังโหลดข้อมูล...
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardCard title="แก้ไขใบเสนอราคา">
        <Grid2 container spacing={3}>

          {/* ข้อมูลบริษัท และ ข้อมูลผู้ติดต่อ - แสดงแบบซ้าย-ขวา */}
          <Grid2 size={6}>
            <CompanyInformations />
          </Grid2>
          <Grid2 size={6}>
            <ContactorInformations />
          </Grid2>

          {/* ตารางสินค้า */}
          <Grid2 size={12}>
            <PricingTable />
          </Grid2>

          {/* สรุปยอด */}
          <Grid2 container size={12}>
            <Grid2 size={6}></Grid2>
            <Grid2 size={6}>
              <PricingSummary isEdit={true} quotationId={params.id} />
            </Grid2>
          </Grid2>

        </Grid2>
      </DashboardCard>
    </PageContainer>
  );
}

export default EditQuotation;

