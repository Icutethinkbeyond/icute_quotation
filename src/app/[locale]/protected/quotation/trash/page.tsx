"use client";

import { Grid2, Box } from "@mui/material";
import TrashTable from "@/components/forms/quotation/TrashTable";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PageContainer from "@/components/shared/PageContainer";

const TrashPage = () => {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: `/protected/dashboard` },
            { name: "ใบเสนอราคา", href: `/quotation` },
            { name: "ถังขยะ" },
        ]);
        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="ถังขยะ - ใบเสนอราคา" description="จัดการใบเสนอราคาที่ถูกลบ">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <TrashTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default TrashPage;
