"use client";

import React, { useState, useEffect } from "react";
import { Customer, CustomerType } from "@/interfaces/Customer";
import GenericInfoView, { FieldConfig, ViewStatus } from "@/components/shared/GenericInfoView";
import { Box, Chip, Stack, Divider } from "@mui/material";
import { Business, Person } from "@mui/icons-material";

interface CustomerViewProps {
    customerId: string;
}

export default function CustomerView({ customerId }: CustomerViewProps) {
    const [status, setStatus] = useState<ViewStatus>('loading');
    const [data, setData] = useState<Customer | null>(null);

    useEffect(() => {
        if (customerId) {
            fetchCustomerData(customerId);
        }
    }, [customerId]);

    const fetchCustomerData = async (id: string) => {
        try {
            setStatus('loading');
            const res = await fetch(`/api/customer/${id}`);
            if (res.ok) {
                const result: Customer = await res.json();
                setData(result);
                setStatus('ready');
            } else {
                setStatus('notFound');
            }
        } catch (error) {
            console.error("Failed to fetch customer data", error);
            setStatus('error');
        }
    };

    const getCustomerTypeLabel = (type?: CustomerType) => {
        if (type === "INDIVIDUAL") return "บุคคลธรรมดา";
        return "นิติบุคคล";
    };

    const getCustomerTypeColor = (type?: CustomerType) => {
        if (type === "INDIVIDUAL") return "success";
        return "primary";
    };

    const fields: FieldConfig<Customer>[] = [
        { label: "ชื่อลูกค้า", key: "name" },
        { label: "เลขประจำตัวผู้เสียภาษี", key: "taxId" },
        { label: "เบอร์โทรศัพท์", key: "phone" },
        { label: "อีเมล", key: "email" },
        { label: "ที่อยู่", key: "address" },
    ];

    const renderHeader = () => {
        if (!data) return null;
        return (
            <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                    icon={data.customerType === "INDIVIDUAL" ? <Person fontSize="small" /> : <Business fontSize="small" />}
                    label={getCustomerTypeLabel(data.customerType)}
                    color={getCustomerTypeColor(data.customerType) as "primary" | "success"}
                    variant="filled"
                />
            </Stack>
        );
    };

    return (
        <GenericInfoView
            title="รายละเอียดลูกค้า"
            backPath="/protected/customer"
            data={data}
            fields={fields}
            status={status}
            notFoundMessage="ไม่พบข้อมูลลูกค้า"
            errorMessage="เกิดข้อผิดพลาดในการโหลดข้อมูล"
            headerActions={renderHeader()}
            renderExtraSection={() => {
                if (!data || data.customerType === "CORPORATION") return null;
                return (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box>
                            {data.firstName && <><strong>ชื่อ:</strong> {data.firstName}<br /></>}
                            {data.lastName && <><strong>นามสกุล:</strong> {data.lastName}<br /></>}
                            {data.nationalId && <><strong>เลขบัตรประชาชน:</strong> {data.nationalId}<br /></>}
                            {data.dateOfBirth && <><strong>วันเกิด:</strong> {new Date(data.dateOfBirth).toLocaleDateString("th-TH")}<br /></>}
                            {data.occupation && <><strong>อาชีพ:</strong> {data.occupation}<br /></>}
                        </Box>
                    </>
                );
            }}
        />
    );
}
