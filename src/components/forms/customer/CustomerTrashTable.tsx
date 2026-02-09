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
import { Customer } from "@/interfaces/Customer";

interface CustomerTableRow extends Customer {
    id: string;
}

const CustomerTrashTable: React.FC = () => {
    const router = useRouter();

    // Data mapping function
    const mapCustomerData = useCallback((item: Customer): CustomerTableRow => ({
        ...item,
        id: item.contactorId,
    }), []);

    // Use data table hook
    const {
        rows,
        loading,
        paginationModel,
        setPaginationModel,
        refresh,
    } = useDataTable<Customer, CustomerTableRow>({
        apiUrl: "/api/customer?trash=true",
        mapData: mapCustomerData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["contactorName", "contactorTel", "contactorEmail"],
        debounceMs: 500,
    });

    const handleRestore = async (contactorId: string) => {
        try {
            const response = await fetch(`/api/customer/${contactorId}`, {
                method: "PUT",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to restore customer");
            }
        } catch (error) {
            console.error("Error restoring customer:", error);
        }
    };

    const handlePermanentDelete = async (contactorId: string) => {
        try {
            const response = await fetch(`/api/customer/${contactorId}?permanent=true`, {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to permanently delete customer");
            }
        } catch (error) {
            console.error("Error permanently deleting customer:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "contactorName", headerName: "ชื่อผู้ติดต่อ", flex: 3, type: "string", },
        { field: "contactorTel", headerName: "เบอร์โทร", flex: 3, type: "string", },
        { field: "contactorEmail", headerName: "อีเมล์", flex: 3, type: "string", },
        { field: "contactorAddress", headerName: "ที่อยู่", flex: 3, type: "string", },
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
                        itemId={params.row.contactorId}
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
                <Typography variant="h3">ถังขยะ (ลูกค้า)</Typography>
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
            getRowId={(row) => row.id}
            customHeader={customHeader}
        />
    );
};

export default CustomerTrashTable;
