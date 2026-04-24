"use client";

import { Grid2, Box } from "@mui/material";
import ProductsTable from "@/components/forms/product/ProductsTable";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import PageContainer from "@/components/shared/PageContainer";
import { useBreadcrumbContext } from "@/contexts/BreadcrumbContext";

const ProductPage = () => {
    const router = useRouter();
    const { setBreadcrumbs } = useBreadcrumbContext();

    useEffect(() => {
        setBreadcrumbs([
            { name: "หน้าแรก", href: "/" },
            { name: "ข้อมูลสินค้า" },
        ]);
        return () => setBreadcrumbs([]);
    }, [setBreadcrumbs]);

    return (
        <PageContainer title="Product" description="">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <ProductsTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default ProductPage;
