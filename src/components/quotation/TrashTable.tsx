"use client";

import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { GenericTrashTable } from "@/components/shared/GenericTrashTable";

const QuotationTrashTable = () => {
    // กำหนดคอลัมน์สำหรับใบเสนอราคาในถังขยะ
    const columns: GridColDef[] = [
        {
            field: "quotationNumber",
            headerName: "เลขที่ใบเสนอราคา",
            flex: 1,
            minWidth: 150,
            type: "string",
        },
        {
            field: "customerCompanyName",
            headerName: "บริษัทลูกค้า",
            flex: 1.5,
            minWidth: 200,
            type: "string",
        },
        {
            field: "totalAmount",
            headerName: "ยอดรวม",
            flex: 1,
            minWidth: 120,
            type: "number",
            valueFormatter: (params) => params.value.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
        },
        {
            field: "deletedAt",
            headerName: "วันที่ถูกลบ",
            flex: 1,
            minWidth: 150,
            type: "string", // Assuming it's formatted as string
        },
    ];

    // ฟังก์ชันแปลงข้อมูลก่อนแสดง
    const mapQuotationData = (quotation: any) => ({
        id: quotation.quotationId,
        quotationNumber: quotation.quotationNumber,
        customerCompanyName: quotation.customerCompanyName,
        totalAmount: quotation.finalTotal,
        deletedAt: new Date(quotation.deletedAt).toLocaleDateString("th-TH"),
    });

    return (
        <GenericTrashTable
            fetchEndpoint="/api/income/quotation?trash=true"
            restoreEndpoint={(id) => `/api/income/quotation/${id}/restore`}
            deleteEndpoint={(id) => `/api/income/quotation/${id}?permanent=true`}
            title="ถังขยะ - ใบเสนอราคา"
            backUrl="/quotation"
            idField="quotationId"
            columns={columns}
            mapData={mapQuotationData}
        />
    );
};

export default QuotationTrashTable;
