"use client";

import React, { useState, useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Add, EditCalendar, Delete, Visibility, DeleteSweep } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";

interface ProductRow {
    id: string;
    keyId: string;
    itemsName: string;
    description: string;
    price: number;
    unit: string;
}

const ProductsTable: React.FC = () => {
    const router = useRouter();
    const theme = useTheme();

    // Data mapping function
    const mapProductData = useCallback((product: any): ProductRow => ({
        id: product.itemsId,
        keyId: product.itemsId,
        itemsName: product.itemsName,
        description: product.itemsDescription || "",
        price: product.aboutItems?.itemsPrice || 0,
        unit: product.aboutItems?.unitName || "ชิ้น",
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
        searchFields: ["itemsName", "description"],
        debounceMs: 500,
    });

    const handleDelete = async (productId: string) => {
        if (!confirm("คุณต้องการย้ายสินค้านี้ไปถังขยะใช่หรือไม่?")) return;
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
        { field: "itemsName", headerName: "ชื่อสินค้า", flex: 3, type: "string", },
        { field: "description", headerName: "รายละเอียด", flex: 3, type: "string", },
        { field: "price", headerName: "ราคา", flex: 3, type: "number", valueFormatter: (params: any) => params.value},
        { field: "unit", headerName: "หน่วย", flex: 3, type: "string", },
        {
            field: "actions",
            headerName: "การจัดการ",
            headerAlign: "center",
            align: "center",
            disableColumnMenu: true,
            sortable: false,
            width: 150,
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
                            <EditCalendar fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูข้อมูล">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/product/view-product/${params.row.id}`)}
                            size="small"
                        >
                            <Visibility fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <Delete fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    const headerActions = (
        <>
            <Button
                variant="outlined"
                startIcon={<DeleteSweep />}
                onClick={() => router.push("/product/trash")}
                sx={{
                    color: theme.palette.error.main,
                    borderColor: theme.palette.error.main,
                    "&:hover": { 
                        backgroundColor: theme.palette.error.light,
                        borderColor: theme.palette.error.dark,
                    },
                    textTransform: "none",
                    px: 2,
                    mr: 1,
                    borderRadius: "8px",
                    fontWeight: 600,
                }}
            >
                ถังขยะ
            </Button>
            <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => router.push("/product/new")}
                sx={{
                    textTransform: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                        boxShadow: theme.shadows[2],
                    },
                }}
            >
                เพิ่มสินค้าใหม่
            </Button>
        </>
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
            getRowId={(row) => row.id} // Changed from row.keyId to row.id
            headerActions={headerActions}
        />
    );
};

export default ProductsTable;
