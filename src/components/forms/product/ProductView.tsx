"use client";

import React, { useState, useEffect } from "react";
import { Product } from "@/interfaces/Product";
import GenericInfoView, { FieldConfig, ViewStatus } from "@/components/shared/GenericInfoView";

interface ProductViewProps {
    productId: string;
}

export default function ProductView({ productId }: ProductViewProps) {
    const [status, setStatus] = useState<ViewStatus>('loading');
    const [data, setData] = useState<Product | null>(null);

    useEffect(() => {
        if (productId) {
            fetchProductData(productId);
        }
    }, [productId]);

    const fetchProductData = async (id: string) => {
        try {
            setStatus('loading');
            const res = await fetch(`/api/inventory/product/${id}`);
            if (res.ok) {
                const result: Product = await res.json();
                setData(result);
                setStatus('ready');
            } else {
                setStatus('notFound');
            }
        } catch (error) {
            console.error("Failed to fetch product data", error);
            setStatus('error');
        }
    };

    const fields: FieldConfig<Product>[] = [
        { label: "ชื่อสินค้า", key: "productName" },
        {
            label: "ราคา",
            key: "aboutProduct",
            format: (val: any) => val?.productPrice ? `${val.productPrice.toLocaleString()} บาท` : "-"
        },
        {
            label: "หน่วย",
            key: "aboutProduct",
            format: (val: any) => val?.unitName || "-"
        },
        { label: "รายละเอียด", key: "productDescription" },
    ];

    return (
        <GenericInfoView
            title="รายละเอียดสินค้า"
            backPath="/product"
            data={data}
            fields={fields}
            status={status}
            notFoundMessage="ไม่พบข้อมูลสินค้า"
            errorMessage="เกิดข้อผิดพลาดในการโหลดข้อมูล"
        />
    );
}
