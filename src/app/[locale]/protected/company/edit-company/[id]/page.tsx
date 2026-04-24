"use client";

import React from "react";
import CompanyForm from "@/components/forms/company/CompanyForm";

export default function EditCompanyPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <CompanyForm title="แก้ไขข้อมูลบริษัท" companyId={id} />;
}
