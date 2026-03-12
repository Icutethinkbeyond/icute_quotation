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
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const NewQuotation = () => {
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } =
    usePricingContext();

  const [value, setValue] = useState(0); // 0 for Contactor, 1 for Company

  useEffect(() => {
    // Reset pricing state when entering new quotation page
    setCategories([]);
    setDiscount(0);
    setVatIncluded(false);
    setWithholdingTaxRate(0);
  }, [setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <PageContainer>
      <PageHeader title="เพิ่มใบเสนอราคาใหม่" />
      
      <Grid2 container spacing={3}>
        {/* Main Content: Document Information and Pricing Table */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Section 1: Parties Information with Tabs */}
            {/* <DashboardCard> */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
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
            {/* </DashboardCard> */}

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
              zIndex: 10
            }}
          >
            <PricingSummary />
          </Box>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default NewQuotation;
