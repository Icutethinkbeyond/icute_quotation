"use client";

import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { GenericTrashTable } from "@/components/shared/GenericTrashTable";

const CustomerTrashTable = () => {
    // กำหนดคอลัมน์สำหรับลูกค้า
    const columns: GridColDef[] = [
        {
            field: "contactorName",
            headerName: "ชื่อลูกค้า",
            flex: 1,
            minWidth: 200,
            type: "string",
        },
        {
            field: "contactorEmail",
            headerName: "อีเมล",
            flex: 1,
            minWidth: 200,
            type: "string",
        },
        {
            field: "contactorTel",
            headerName: "เบอร์โทร",
            flex: 0.8,
            minWidth: 150,
            type: "string",
        },
        {
            field: "contactorAddress",
            headerName: "ที่อยู่",
            flex: 1.2,
            minWidth: 250,
            type: "string",
        },
    ];

    return (
        <GenericTrashTable
            fetchEndpoint="/api/customer?trash=true"
            restoreEndpoint={(id) => `/api/customer/${id}`}
            deleteEndpoint={(id) => `/api/customer/${id}?permanent=true`}
            title="ถังขยะ - ลูกค้า"
            backUrl="/customer"
            idField="contactorId"
            columns={columns}
        />
    );
};

export default CustomerTrashTable;
