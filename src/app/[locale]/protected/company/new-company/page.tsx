"use client";

import React from "react";
import { useRouter } from "next/navigation";
import CompanyForm from "@/components/forms/company/CompanyForm";

export default function NewCompanyPage() {
    const router = useRouter();

    return (
        <CompanyForm
            title="เพิ่มบริษัท"
            onSuccess={() => router.push('/company')}
        />
    );
}
