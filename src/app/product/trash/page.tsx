"use client";

import { Grid2, Box } from "@mui/material";
import ProductTrashTable from "@/components/product/ProductTrashTable";
import { useEffect } from "react";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";
import PageContainer from "@/components/shared/PageContainer";

const ProductTrashPage = () => {
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: `/protected/dashboard` },
            { name: "สินค้า", href: `/product` },
            { name: "ถังขยะ" },
        ]);
        return () => {
            setBreadcrumbs([]);
        };
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="ถังขยะ - สินค้า" description="จัดการสินค้าที่ถูกลบ">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <ProductTrashTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default ProductTrashPage;
