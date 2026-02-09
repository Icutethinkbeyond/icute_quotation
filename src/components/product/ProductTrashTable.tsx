"use client";

import React, { useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, IconButton, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { TrashActionButtons } from "@/components/shared/TrashActionButtons";

interface ProductRow {
    id: string;
    keyId: string;
    productName: string;
    description: string;
    price: number;
    unit: string;
}

const ProductTrashTable: React.FC = () => {
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
        apiUrl: "/api/inventory/product?trash=true",
        mapData: mapProductData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["productName", "description"],
        debounceMs: 500,
    });

    const handleRestore = async (productId: string) => {
        try {
            const response = await fetch(`/api/inventory/product/${productId}`, {
                method: "PUT",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to restore product");
            }
        } catch (error) {
            console.error("Error restoring product:", error);
        }
    };

    const handlePermanentDelete = async (productId: string) => {
        try {
            const response = await fetch(`/api/inventory/product/${productId}?permanent=true`, {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to permanently delete product");
            }
        } catch (error) {
            console.error("Error permanently deleting product:", error);
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
                    <TrashActionButtons
                        itemId={params.row.id}
                        onRestore={handleRestore}
                        onPermanentDelete={handlePermanentDelete}
                    />
                </Box>
            ),
        },
    ];

    const customHeader = (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box display="flex" alignItems="center" gap={2}>
                <IconButton onClick={() => router.back()}>
                    <ArrowBack />
                </IconButton>
                <Typography variant="h3">ถังขยะ (สินค้า)</Typography>
            </Box>
        </Box>
    );

    return (
        <GenericDataTable
            title=""
            rows={filteredRows}
            columns={columns}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            paginationModel={paginationModel}
            onPaginationChange={setPaginationModel}
            getRowId={(row) => row.keyId}
            customHeader={customHeader}
        />
    );
};

export default ProductTrashTable;
