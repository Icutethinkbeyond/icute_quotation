"use client";

import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { GenericTrashTable } from "@/components/shared/GenericTrashTable";

const ProductTrashTable: React.FC = () => {
    const columns: GridColDef[] = [
        {
            field: "itemsName",
            headerName: "ชื่อสินค้า",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "itemsSKU",
            headerName: "SKU",
            flex: 0.5,
            minWidth: 100,
        },
        {
            field: "price",
            headerName: "ราคา",
            flex: 0.5,
            minWidth: 100,
            type: "number",
        },
        {
            field: "unit",
            headerName: "หน่วย",
            flex: 0.5,
            minWidth: 80,
            type: "string",
        },
    ];

    // ฟังก์ชันแปลงข้อมูลก่อนแสดง
    const mapProductData = (product: any) => ({
        ...product,
        price: product.aboutItems?.itemsPrice || 0,
        unit: product.aboutItems?.unitName || "-",
    });

    return (
        <GenericTrashTable
            fetchEndpoint="/api/inventory/product?trash=true"
            restoreEndpoint={(id) => `/api/inventory/product/${id}`}
            deleteEndpoint={(id) => `/api/inventory/product/${id}?permanent=true`}
            title="ถังขยะ - สินค้า"
            backUrl="/product"
            idField="itemsId"
            columns={columns}
            mapData={mapProductData}
        />
    );
};

export default ProductTrashTable;
