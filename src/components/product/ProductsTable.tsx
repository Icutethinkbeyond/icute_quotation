"use client";

import React, { useState, useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { Add, EditCalendar, Delete, Visibility } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";

interface ProductRow {
    id: string;
    keyId: string;
    productName: string;
    description: string;
    price: number;
    unit: string;
}

const ProductsTable: React.FC = () => {
    const router = useRouter();

    // Data mapping function
    const mapProductData = useCallback((product: any): ProductRow => ({
        id: product.productId,
        keyId: product.productId,
        productName: product.productName,
        description: product.productDescription || "",
        price: product.aboutProduct?.productPrice || 0,
        unit: product.aboutProduct?.unitName || "ชิ้น",
    }), []);

    // Use data table hook
    const {
        rows,
        loading,
        paginationModel,
        setPaginationModel,
        refresh,
    } = useDataTable<any, ProductRow>({
        apiUrl: "/api/inventory/product",
        mapData: mapProductData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["productName", "description"],
        debounceMs: 500,
    });

    const handleDelete = async (productId: string) => {
        try {
            const response = await fetch(`/api/inventory/product/${productId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to delete product");
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "productName", headerName: "ชื่อสินค้า", flex: 3, type: "string", },
        { field: "description", headerName: "รายละเอียด", flex: 3, type: "string", },
        { field: "price", headerName: "ราคา", flex: 3, type: "number", },
        { field: "unit", headerName: "หน่วย", flex: 3, type: "string", },
        {
            field: "Actions",
            headerName: "การจัดการ",
            headerAlign: "center",
            align: "center",
            disableColumnMenu: true,
            width: 150,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 0.5,
                    }}
                >
                    <Tooltip title="แก้ไข">
                        <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => router.push(`/product/edit/${params.row.id}`)}
                        >
                            <EditCalendar />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูข้อมูล">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/product/view-product/${params.row.id}`)}
                            size="small"
                        >
                            <Visibility />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <IconButton
                            size="small"
                            sx={{ color: "#d33" }}
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <Delete />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const headerActions = (
        <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => router.push("/product/new")}
            sx={{
                backgroundColor: "#03c9d7",
                color: "#fff",
                "&:hover": { backgroundColor: "#05b2bd" },
                textTransform: "none",
            }}
        >
            เพิ่มสินค้าใหม่
        </Button>
    );

    return (
        <GenericDataTable
            title="ข้อมูลสินค้าทั้งหมด"
            rows={filteredRows}
            columns={columns}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            paginationModel={paginationModel}
            onPaginationChange={setPaginationModel}
            getRowId={(row) => row.keyId}
            headerActions={headerActions}
        />
    );
};

export default ProductsTable;
