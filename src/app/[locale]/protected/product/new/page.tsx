"use client";

import React from "react";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import ProductForm from "@/components/forms/product/ProductForm";

const NewProductPage = () => {
    return (
        <PageContainer>
            <DashboardCard title="เพิ่มสินค้าใหม่">
                <ProductForm />
            </DashboardCard>
        </PageContainer>
    );
};

export default NewProductPage;
