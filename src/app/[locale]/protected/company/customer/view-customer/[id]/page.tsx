"use client";

import React from "react";
import CustomerView from "@/components/forms/customer/CustomerView";

export default function ViewCustomerPage({ params }: { params: { id: string } }) {
    const { id } = params;
    return <CustomerView customerId={id} />;
}
