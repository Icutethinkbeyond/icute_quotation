"use client";

import React from "react";
import ProductView from "@/components/forms/product/ProductView";

export default function ViewProductPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <ProductView productId={id} />;
}
