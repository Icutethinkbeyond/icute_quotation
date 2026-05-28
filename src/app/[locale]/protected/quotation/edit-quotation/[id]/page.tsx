"use client";

import React, { useEffect, useState, SyntheticEvent } from "react";
import { Grid2, Stack, Box, Tabs, Tab } from "@mui/material";

// components
import CompanyInformation from "@/components/forms/quotation/CompanyInformations";
import ContactorInformation from "@/components/forms/quotation/ContactorInformations";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import PricingTable from "@/components/forms/pricing-table/PricingTable";
import PricingSummary from "@/components/forms/pricing-table/PricingSummary";
import DashboardCard from "@/components/shared/DashboardCard";
import { usePricingContext } from "@/contexts/PricingContext";
import { useQuotationListContext } from "@/contexts/QuotationContext";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import { useRouter } from "next/navigation";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      style={{ display: value === index ? "block" : "none" }}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box sx={{ pt: 3 }}>{children}</Box>
    </div>
  );
}

const EditQuotation = ({ params }: { params: { id: string } }) => {
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } =
    usePricingContext();
  const { setHeadForm } = useQuotationListContext();
  const { setBreadcrumbs } = useBreadcrumbContext();
  const router = useRouter();

  const [value, setValue] = useState(0); // 0 for Contactor, 1 for Company
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/` },
      { name: "ใบเสนอราคา", href: `/quotation` },
      { name: "แก้ไขใบเสนอราคา" },
    ]);

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
        const subtotal = categories.reduce(
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

        // โหลดข้อมูลเข้า PricingContext
        setCategories(categories);
        setWithholdingTaxRate(whtRate);
        setDiscount(quotation.globalDiscount || 0);
        setVatIncluded(quotation.includeVat || false);

        // โหลดข้อมูลเข้า headForm
        setHeadForm({
          quotationNumber: quotation.documentIdNo || "",

          // Issuer Info (Our Company) - Loaded from Snapshot
          companyName: quotation.companyName || "",
          companyTel: quotation.companyTel || "",
          companyAddress: quotation.companyAddress || "",
          taxId: quotation.companyTaxId || "",
          branch: quotation.companyBranch || "",

          // Customer Company Info
          customerType: quotation.customer?.taxId
            ? "Corporate"
            : "Individual",
          customerCompanyName: quotation.customer?.name || "",
          customerCompanyTel: quotation.customer?.phone || "",
          customerCompanyAddress:
            quotation.customer?.address || "",
          customerTaxId: quotation.customer?.taxId || "",
          customerBranch: "", // Customer model doesn't have branch

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

    return () => {
      setBreadcrumbs([]);
    };
  }, [
    params.id,
    setCategories,
    setDiscount,
    setVatIncluded,
    setWithholdingTaxRate,
    setHeadForm,
    router,
    setBreadcrumbs,
  ]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  if (loading) {
    return (
      <PageContainer>
        <PageHeader title="แก้ไขใบเสนอราคา" />
        <DashboardCard>
          <Box sx={{ textAlign: "center", padding: "50px" }}>
            กำลังโหลดข้อมูล...
          </Box>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <>
      {/* // <PageContainer> */}
      <PageHeader title="แก้ไขใบเสนอราคา" />

      <Grid2 container spacing={3}>
        {/* Main Content: Document Information and Pricing Table */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Section 1: Parties Information with Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="ข้อมูลลูกค้า" />
                <Tab label="ข้อมูลบริษัท" />
              </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
              <ContactorInformation />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <CompanyInformation />
            </CustomTabPanel>

            {/* Section 2: Pricing Table Details */}
            <DashboardCard>
              <PricingTable />
            </DashboardCard>
          </Stack>
        </Grid2>

        {/* Sidebar: Summary and Action Buttons */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Box
            sx={{
              position: { lg: "sticky" },
              top: { lg: 24 },
              zIndex: 10,
            }}
          >
            <PricingSummary isEdit={true} quotationId={params.id} />
          </Box>
        </Grid2>
      </Grid2>
    </>
    // </PageContainer>
  );
};

export default EditQuotation;
