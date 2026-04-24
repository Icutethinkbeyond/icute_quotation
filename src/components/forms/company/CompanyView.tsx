"use client";

import React, { useState, useEffect } from "react";
import { CompanyProfile } from "@/interfaces/Company";
import GenericInfoView, { FieldConfig, ViewStatus } from "@/components/shared/GenericInfoView";
import { Avatar, Box, Typography } from "@mui/material";

interface CompanyViewProps {
    companyId: string;
}

export default function CompanyView({ companyId }: CompanyViewProps) {
    const [status, setStatus] = useState<ViewStatus>('loading');
    const [data, setData] = useState<CompanyProfile | null>(null);

    useEffect(() => {
        if (companyId) {
            fetchCompanyData(companyId);
        }
    }, [companyId]);

    const fetchCompanyData = async (id: string) => {
        try {
            setStatus('loading');
            const res = await fetch(`/api/companies/${id}`);
            if (res.ok) {
                const result: CompanyProfile = await res.json();
                setData(result);
                setStatus('ready');
            } else {
                setStatus('notFound');
            }
        } catch (error) {
            console.error("Failed to fetch company data", error);
            setStatus('error');
        }
    };

    const fields: FieldConfig<CompanyProfile>[] = [
        { label: "ชื่อบริษัท", key: "companyName" },
        { label: "เบอร์โทรศัพท์", key: "companyPhoneNumber" },
        { label: "เลขผู้เสียภาษี", key: "companyTaxId" },
        {
            label: "วันที่จดทะเบียน",
            key: "companyRegistrationDate",
            format: (val: any) => val ? new Date(val).toLocaleDateString("th-TH") : "-"
        },
        { label: "อีเมล", key: "companyEmail" },
        { label: "เว็บไซต์", key: "companyWebsite" },
        { label: "ประเภทธุรกิจ", key: "companyBusinessType" },
        { label: "ที่อยู่", key: "companyAddress" },
    ];

    return (
        <>
            {data?.companyImage && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box
                        component="img"
                        src={data.companyImage}
                        alt="Company Logo"
                        sx={{
                            maxWidth: '100%',
                            maxHeight: 200,
                            width: 'auto',
                            height: 'auto',
                            objectFit: 'contain',
                            borderRadius: '8px',
                            border: '1px solid',
                            borderColor: 'divider',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    />
                </Box>
            )}
            <GenericInfoView
                title="รายละเอียดบริษัท"
                backPath="/company"
                data={data}
                fields={fields}
                status={status}
                notFoundMessage="ไม่พบข้อมูลบริษัท"
                errorMessage="เกิดข้อผิดพลาดในการโหลดข้อมูล"
            />
        </>
    );
}

