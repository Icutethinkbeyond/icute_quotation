"use client";

import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PageContainer from "@/components/shared/PageContainer";

const CustomerTrashPage = () => {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: `/protected/dashboard` },
            { name: "ลูกค้า", href: `/protected/customer` },
            { name: "ถังขยะ" },
        ]);
        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="ถังขยะ - ลูกค้า" description="จัดการลูกค้าที่ถูกลบ">
            <Box mt={3}>
                <Typography>
                    ข้อมูลลูกค้าไม่รองรับถังขยะ
                </Typography>
            </Box>
        </PageContainer>
    );
};

export default CustomerTrashPage;
