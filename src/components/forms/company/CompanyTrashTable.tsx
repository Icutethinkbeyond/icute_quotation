"use client";

import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { GenericTrashTable } from "@/components/shared/GenericTrashTable";

const CompanyTrashTable = () => {
    // กำหนดคอลัมน์สำหรับบริษัท
    const columns: GridColDef[] = [
        {
            field: "companyName",
            headerName: "ชื่อบริษัท",
            flex: 1,
            minWidth: 200,
            type: "string",
        },
        {
            field: "companyTaxId",
            headerName: "เลขประจำตัวผู้เสียภาษี",
            flex: 1,
            minWidth: 180,
            type: "string",
        },
        {
            field: "companyPhoneNumber",
            headerName: "เบอร์โทร",
            flex: 0.8,
            minWidth: 150,
            type: "string",
        },
        {
            field: "companyEmail",
            headerName: "อีเมล",
            flex: 1,
            minWidth: 200,
            type: "string",
        },
        {
            field: "companyAddress",
            headerName: "ที่อยู่",
            flex: 1.2,
            minWidth: 250,
            type: "string",
        },
    ];

    return (
        <GenericTrashTable
            fetchEndpoint="/api/companies?trash=true"
            restoreEndpoint={(id) => `/api/companies/${id}`}
            deleteEndpoint={(id) => `/api/companies/${id}?permanent=true`}
            title="ถังขยะ - บริษัท"
            backUrl="/company"
            idField="companyId"
            columns={columns}
        />
    );
};

export default CompanyTrashTable;
