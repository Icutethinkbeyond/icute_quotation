"use client";

import React from "react";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import CustomerForm from "@/components/forms/customer/CustomerForm";

const NewCustomerPage = () => {
    return (
        <PageContainer>
            <DashboardCard title="เพิ่มลูกค้าใหม่">
                <CustomerForm isEdit={false} />
            </DashboardCard>
        </PageContainer>
    );
};

export default NewCustomerPage;
