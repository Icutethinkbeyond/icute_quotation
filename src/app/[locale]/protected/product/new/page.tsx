"use client";

import { useState } from "react";
import { Box, Button, TextField, Grid2 } from "@mui/material";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";

const NewProductPage = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        productName: "",
        productDescription: "",
        price: 0,
        unit: "ชิ้น",
    });

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
            const response = await fetch("/api/inventory/product", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                router.push("/product");
            } else {
                console.error("Failed to create product");
            }
        } catch (error) {
            console.error("Error creating product:", error);
        }
    };

    return (
        <PageContainer>
            <DashboardCard title="เพิ่มสินค้าใหม่">
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
                            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => router.back()}
                                >
                                    ยกเลิก
                                </Button>
                                <Button type="submit" variant="contained" color="primary">
                                    บันทึก
                                </Button>
                            </Box>
                        </Grid2>
                    </Grid2>
                </Box>
            </DashboardCard>
        </PageContainer>
    );
};

export default NewProductPage;
