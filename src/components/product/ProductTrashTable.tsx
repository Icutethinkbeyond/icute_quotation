"use client";

import React from "react";
import { GridColDef } from "@mui/x-data-grid";
import { GenericTrashTable } from "@/components/shared/GenericTrashTable";

const ProductTrashTable = () => {
    // กำหนดคอลัมน์สำหรับสินค้า
    const columns: GridColDef[] = [
        {
            field: "productName",
            headerName: "ชื่อสินค้า",
            flex: 1,
            minWidth: 200,
            type: "string",
        },
        {
            field: "productSKU",
            headerName: "รหัสสินค้า",
            flex: 0.8,
            minWidth: 150,
            type: "string",
        },
        {
            field: "productDescription",
            headerName: "รายละเอียด",
            flex: 1.2,
            minWidth: 250,
            type: "string",
        },
        {
            field: "price",
            headerName: "ราคา",
            flex: 0.6,
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
        price: product.aboutProduct?.productPrice || 0,
        unit: product.aboutProduct?.unitName || "-",
    });

    return (
        <GenericTrashTable
            fetchEndpoint="/api/inventory/product?trash=true"
            restoreEndpoint={(id) => `/api/inventory/product/${id}`}
            deleteEndpoint={(id) => `/api/inventory/product/${id}?permanent=true`}
            title="ถังขยะ - สินค้า"
            backUrl="/product"
            idField="productId"
            columns={columns}
            mapData={mapProductData}
        />
    );
};

export default ProductTrashTable;
