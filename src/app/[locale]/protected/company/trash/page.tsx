"use client";

import { Grid2, Box } from "@mui/material";
import CompanyTrashTable from "@/components/forms/company/CompanyTrashTable";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PageContainer from "@/components/shared/PageContainer";

const CompanyTrashPage = () => {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: `/protected/dashboard` },
            { name: "บริษัท", href: `/company` },
            { name: "ถังขยะ" },
        ]);
        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="ถังขยะ - บริษัท" description="จัดการบริษัทที่ถูกลบ">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <CompanyTrashTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default CompanyTrashPage;
