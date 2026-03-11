"use client";

import React, { useEffect } from "react";
import { Grid2 } from "@mui/material";

// components
import CompanyInformation from "@/components/forms/quotation/CompanyInformations";
import ContactotInformation from "@/components/forms/quotation/ContactorInformations";
import PageContainer from "@/components/shared/PageContainer";
import PricingTable from "@/components/forms/pricing-table/PricingTable";
import PricingSummary from "@/components/forms/pricing-table/PricingSummary";
import DashboardCard from "@/components/shared/DashboardCard";
import { headerClean, useQuotationListContext } from "@/contexts/QuotationContext";
import { usePricingContext } from "@/contexts/PricingContext";

const NewQuotation = () => {
  const { setHeadForm } = useQuotationListContext();
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } = usePricingContext();

  // Reset ฟอร์มทั้งหมดเมื่อเข้าหน้า New Quotation
  useEffect(() => {
    const initNewQuotation = async () => {
      console.log("🔄 Resetting form data for new quotation...");

      // Start with clean header and set current date
      const today = new Date().toISOString().split('T')[0];
      let initialHead = { ...headerClean, dateCreate: today };

      // Try to fetch favorite company for auto-fill
      try {
        const response = await fetch('/api/companies');
        const data = await response.json();
        if (Array.isArray(data)) {
          const favorite = data.find((c: any) => c.isFavorite);
          if (favorite) {
            initialHead = {
              ...initialHead,
              companyName: favorite.companyName || "",
              companyTel: favorite.companyPhoneNumber || "",
              taxId: favorite.companyTaxId || "",
              companyAddress: favorite.companyAddress || "",
            };
            console.log("✅ Auto-filled favorite company:", favorite.companyName);
          }
        }
      } catch (error) {
        console.error("Error fetching favorite company:", error);
      }

      // Reset header form
      setHeadForm(initialHead);

      // Reset pricing data
      setCategories([]);
      setDiscount(0);
      setVatIncluded(false);
      setWithholdingTaxRate(0);

      console.log("✅ Form reset complete");
    };

    initNewQuotation();
  }, []); // Run only once when component mounts

  return (
    <PageContainer>
      <DashboardCard title="เพิ่มใบเสนอราคาใหม่">
        <Grid2 container spacing={3}>
          <Grid2 size={6}>
            {/* <CompanyInformation /> */}
          </Grid2>
          <Grid2 size={6}>
            <ContactotInformation />
          </Grid2>
          <Grid2 size={12}>
            <PricingTable />
          </Grid2>
          <Grid2 container size={12}>
            <Grid2 size={6}>{/* <DocumentFooter /> */}</Grid2>
            <Grid2 size={6}>
              <PricingSummary />
            </Grid2>
          </Grid2>
        </Grid2>
      </DashboardCard>
    </PageContainer>
  );
};

export default NewQuotation;
