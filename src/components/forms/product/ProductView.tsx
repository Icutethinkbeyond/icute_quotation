"use client";

import React, { useState, useEffect } from "react";
import { Items } from "@/interfaces/Product";
import GenericInfoView, { FieldConfig, ViewStatus } from "@/components/shared/GenericInfoView";

interface ProductViewProps {
    productId: string;
}

export default function ProductView({ productId }: ProductViewProps) {
    const [status, setStatus] = useState<ViewStatus>('loading');
    const [data, setData] = useState<Items | null>(null);

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
                const result: Items = await res.json();
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

    const fields: FieldConfig<Items>[] = [
        { label: "ชื่อสินค้า", key: "itemsName" },
        {
            label: "ราคา",
            key: "aboutItems",
            format: (val: any) => val?.itemsPrice ? `${val.itemsPrice.toLocaleString()} บาท` : "-"
        },
        {
            label: "หน่วย",
            key: "aboutItems",
            format: (val: any) => val?.unitName || "-"
        },
        { label: "รายละเอียด", key: "itemsDescription" },
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
