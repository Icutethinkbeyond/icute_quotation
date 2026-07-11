"use client";

import { useState, useEffect } from "react";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import ProductForm from "@/components/forms/product/ProductForm";
import { Items } from "@/interfaces/Product";

const EditProductPage = ({ params }: { params: { id: string } }) => {
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<Items | null>(null);

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/inventory/product/${params.id}`);
            if (response.ok) {
                const data: Items = await response.json();
                setProduct(data);
            } else {
                setProduct(null);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            setProduct(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <DashboardCard title="แก้ไขสินค้า">
                    <div style={{ padding: 24, textAlign: "center" }}>
                        กำลังโหลดข้อมูล...
                    </div>
                </DashboardCard>
            </PageContainer>
        );
    }

    if (!product) {
        return (
            <PageContainer>
                <DashboardCard title="แก้ไขสินค้า">
                    <div style={{ padding: 24, textAlign: "center" }}>
                        ไม่พบข้อมูลสินค้า
                    </div>
                </DashboardCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <DashboardCard title="แก้ไขสินค้า">
                <ProductForm isEdit initialData={product} />
            </DashboardCard>
        </PageContainer>
    );
};

export default EditProductPage;
