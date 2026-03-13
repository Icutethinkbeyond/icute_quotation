"use client";

import React, { useEffect } from "react";
import { Box } from "@mui/material";
import PageContainer from "@/components/shared/PageContainer";
import CompanyTable from "@/components/forms/company/CompanyTable";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

export default function CompanyListPage() {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: "/" },
            { name: "ข้อมูลบริษัท" },
        ]);
        return () => setBreadcrumbs([]);
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="Company Information" description="List of companies">
            <Box mt={3}>
                <CompanyTable />
            </Box>
        </PageContainer>
    );
}
