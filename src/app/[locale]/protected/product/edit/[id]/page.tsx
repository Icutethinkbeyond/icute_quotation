"use client";

import { useState, useEffect } from "react";
import { Box, Button, TextField, Grid2 } from "@mui/material";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

const EditProductPage = ({ params }: { params: { id: string } }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        price: 0,
        unit: "ชิ้น",
    });

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/inventory/product/${params.id}`);
            const product = await response.json();

            setFormData({
                productName: product.productName || "",
                productDescription: product.productDescription || "",
                price: product.aboutProduct?.productPrice || 0,
                unit: product.aboutProduct?.unitName || "ชิ้น",
            });
        } catch (error) {
            console.error("Error fetching product:", error);
            router.push("/product");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "price" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/inventory/product/${params.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/product");
            } else {
                console.error("Failed to update product");
            }
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    if (loading) {
        return (
            <PageContainer>
                <DashboardCard title="แก้ไขสินค้า">
                    <Box sx={{ p: 3, textAlign: "center" }}>
                        กำลังโหลดข้อมูล...
                    </Box>
                </DashboardCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <DashboardCard title="แก้ไขสินค้า">
                <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
                    <Grid2 container spacing={3}>
                        <Grid2 size={12}>
                            <TextField
                                fullWidth
                                required
                                label="ชื่อสินค้า"
                                name="productName"
                                value={formData.productName}
                                onChange={handleChange}
                            />
                        </Grid2>

                        <Grid2 size={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="รายละเอียดสินค้า"
                                name="productDescription"
                                value={formData.productDescription}
                                onChange={handleChange}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                required
                                type="number"
                                label="ราคา (บาท)"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                slotProps={{
                                    input: {
                                        inputProps: { min: 0, step: 0.01 }
                                    }
                                }}
                            />
                        </Grid2>

                        <Grid2 size={6}>
                            <TextField
                                fullWidth
                                required
                                label="หน่วย"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                            />
                        </Grid2>

                        <Grid2 size={12}>
                            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                <Button type="submit" variant="contained" color="success">
                                    บันทึกการแก้ไข
                                </Button>
                            </Box>
                        </Grid2>
                    </Grid2>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default EditProductPage;
