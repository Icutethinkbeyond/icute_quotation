"use client";

import React from "react";
import CompanyView from "@/components/forms/company/CompanyView";

export default function ViewCompanyPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <CompanyView companyId={id} />;
}
