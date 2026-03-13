"use client";

import React, { useEffect } from "react";
import { Grid2, Box } from "@mui/material";
import CustomersTable from "@/components/forms/customer/CustomersTable";
import PageContainer from "@/components/shared/PageContainer";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const CustomerPage = () => {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: "/" },
            { name: "ข้อมูลลูกค้า" },
        ]);
        return () => setBreadcrumbs([]);
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="ข้อมูลลูกค้า" description="">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <CustomersTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default CustomerPage;
