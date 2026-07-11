"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import CustomerForm, { CustomerFormData } from "@/components/forms/customer/CustomerForm";
import { Box, CircularProgress, Typography } from "@mui/material";

const EditCustomerPage = () => {
  const params = useParams();
  const customerId = params.id as string;
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customer/${customerId}`);
        if (response.ok) {
          const data = await response.json();

          const formData: CustomerFormData = {
            id: data.id,
            companyId: data.companyId,
            customerType: data.customerType,
            name: data.name || "",
            taxId: data.taxId || "",
            phone: data.phone || "",
            email: data.email || "",
            address: data.address || "",
            website: data.website || "",
            note: data.note || "",
            branch: data.branch || "",
            registrationDate: data.registrationDate || "",
            businessType: data.businessType || "",
            capital: data.capital || 0,
            directorName: data.directorName || "",
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            nationalId: data.nationalId || "",
            dateOfBirth: data.dateOfBirth || "",
            occupation: data.occupation || "",
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

    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

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
