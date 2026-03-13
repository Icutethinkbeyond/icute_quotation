"use client";

import { Grid2, Box } from "@mui/material";
import QuotationsTable from "@/components/forms/quotation/QuotationsTable";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PageContainer from "@/components/shared/PageContainer";

const Dashboard = () => {
  const router = useRouter();

    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
    setBreadcrumbs([
      { name: "หน้าแรก", href: `/` },
      { name: "ใบเสนอราคา", href: `/quotation` },
    ]);
    return () => {
      setBreadcrumbs([]);
    };
  }, []);

  return (
    <PageContainer title="Quotation" description="">
      <Box mt={3}>
        <Grid2 container spacing={3}>
          <Grid2 size={12}>
            <QuotationsTable />
          </Grid2>
        </Grid2>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
