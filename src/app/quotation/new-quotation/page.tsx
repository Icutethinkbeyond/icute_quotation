"use client";

import React, { useEffect, useState, SyntheticEvent, useCallback } from "react";
import {
  Grid2,
  Stack,
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import { Save, Undo, Redo, Print } from "@mui/icons-material";

// components
import CompanyInformation from "@/components/forms/quotation/CompanyInformations";
import ContactorInformation from "@/components/forms/quotation/ContactorInformations";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import PricingTable from "@/components/forms/pricing-table/PricingTable";
import PricingSummary from "@/components/forms/pricing-table/PricingSummary";
import DashboardCard from "@/components/shared/DashboardCard";
import { usePricingContext } from "@/contexts/PricingContext";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import {
  headerClean,
  useQuotationListContext,
} from "@/contexts/QuotationContext";

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

const NewQuotation = () => {
  const { setCategories, setDiscount, setVatIncluded, setWithholdingTaxRate } =
    usePricingContext();
  const { setHeadForm } = useQuotationListContext();
  const { setBreadcrumbs } = useBreadcrumbContext();

  const [value, setValue] = useState(0); // 0 for Contactor, 1 for Company
  const [isDirty, setIsDirty] = useState(false);
  const [autoId, setAutoId] = useState("");

  // Generate auto ID
  const generateAutoId = useCallback(() => {
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");
    const timestamp = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    const dateStr = today.replace(/-/g, "");
    return `QT-${dateStr}-${timestamp}`;
  }, []);

  useEffect(() => {
    const newId = generateAutoId();
    setAutoId(newId);

    setBreadcrumbs([
      { name: "หน้าแรก", href: `/` },
      { name: "ใบเสนอราคา", href: `/quotation` },
      { name: "เพิ่มใบเสนอราคาใหม่" },
    ]);

    // Reset pricing state
    setCategories([]);
    setDiscount(0);
    setVatIncluded(false);
    setWithholdingTaxRate(0);

    // Initialize Header
    const now = new Date();
    const today = now.toLocaleDateString("en-CA");

    setHeadForm({
      ...headerClean,
      dateCreate: today,
      quotationNumber: newId,
    });

    return () => {
      setBreadcrumbs([]);
    };
  }, [
    setCategories,
    setDiscount,
    setVatIncluded,
    setWithholdingTaxRate,
    setHeadForm,
    generateAutoId,
  ]);

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleUndo = () => {
    console.log("Undo action");
    setIsDirty(true);
  };

  const handleRedo = () => {
    console.log("Redo action");
    setIsDirty(true);
  };

  const handleSave = () => {
    console.log("Save action");
    setIsDirty(false);
  };

  const handlePrint = () => {
    console.log("Print action");
    window.print();
  };

  return (
    <PageContainer>
      <PageHeader title="เพิ่มใบเสนอราคาใหม่" />
      <Grid2 container spacing={3}>
        {/* Main Content Area */}
        <Grid2 size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {/* Section 1: Parties Information with Tabs */}
            <DashboardCard>
              <>
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
              </>
            </DashboardCard>

            {/* Section 2: Pricing Table Details */}
            <DashboardCard>
              <PricingTable />
            </DashboardCard>
          </Stack>
        </Grid2>

        {/* Right Sidebar */}
        <Grid2 size={{ xs: 12, lg: 4 }}>
          <Box sx={{ position: { lg: "sticky" }, top: { lg: 24 }, zIndex: 10 }}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                สรุปราคา
              </Typography>
              <Divider />
              <PricingSummary />
            </Paper>

            {/* Action Buttons */}
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                จัดการเอกสาร
              </Typography>
              <Divider />
              <Stack spacing={1} sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSave}
                  disabled={!isDirty}
                >
                  บันทึก
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Undo />}
                  onClick={handleUndo}
                >
                  ยกเลิก
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Redo />}
                  onClick={handleRedo}
                >
                  ทำซ้ำ
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Print />}
                  onClick={handlePrint}
                >
                  พิมพ์
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Grid2>
      </Grid2>
    </PageContainer>
  );
};

export default NewQuotation;
