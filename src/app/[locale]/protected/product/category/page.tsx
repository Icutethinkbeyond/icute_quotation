"use client";

import { Grid2, Box } from "@mui/material";
import CategoryTable from "@/components/forms/product/CategoryTable";
import PageContainer from "@/components/shared/PageContainer";

const ProductCategoryPage = () => {
    return (
        <PageContainer title="จัดการหมวดหมู่สินค้า" description="">
            <Box mt={3}>
                <Grid2 container spacing={3}>
                    <Grid2 size={12}>
                        <CategoryTable />
                    </Grid2>
                </Grid2>
            </Box>
        </PageContainer>
    );
};

export default ProductCategoryPage;
