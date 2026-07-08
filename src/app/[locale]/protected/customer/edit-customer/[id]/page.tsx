"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import CustomerForm, { CustomerFormData } from "@/components/forms/customer/CustomerForm";
import { Box, CircularProgress, Typography } from "@mui/material";

const EditCustomerPage = () => {
    const params = useParams();
    const contactorId = params.id as string;
    const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(`/api/customer/${contactorId}`);
                if (response.ok) {
                    const data = await response.json();

                    // Map data to form format
                    const formData: CustomerFormData = {
                        contactorId: data.contactorId,
                        contactorName: data.contactorName || "",
                        contactorTel: data.contactorTel || "",
                        contactorEmail: data.contactorEmail || "",
                        contactorAddress: data.contactorAddress || "",
                    };

                    setCustomerData(formData);
                } else {
                    setError("ไม่พบข้อมูลลูกค้า");
                }
            } catch (err) {
                console.error("Error fetching customer:", err);
                setError("เกิดข้อผิดพลาดในการโหลดข้อมูล");
            } finally {
                setLoading(false);
            }
        };

        if (contactorId) {
            fetchCustomer();
        }
    }, [contactorId]);

    if (loading) {
        return (
            <PageContainer>
                <DashboardCard title="แก้ไขข้อมูลลูกค้า">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                </DashboardCard>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <DashboardCard title="แก้ไขข้อมูลลูกค้า">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <Typography color="error">{error}</Typography>
                    </Box>
                </DashboardCard>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <DashboardCard title="แก้ไขข้อมูลลูกค้า">
                {customerData ? <CustomerForm initialData={customerData} isEdit={true} /> : undefined}
            </DashboardCard>
        </PageContainer>
    );
};

export default EditCustomerPage;
