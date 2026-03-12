"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import GenericDataTable from "@/components/shared/GenericDataTable";
import { TrashActionButtons } from "./TrashActionButtons";
import useDataTable from "@/hooks/useDataTable";
import PageHeader from "@/components/shared/PageHeader";

interface GenericTrashTableProps {
    // API Configuration
    fetchEndpoint: string; // เช่น "/api/customer?trash=true"
    restoreEndpoint: (id: string) => string; // เช่น (id) => `/api/customer/${id}`
    deleteEndpoint: (id: string) => string; // เช่น (id) => `/api/customer/${id}?permanent=true`

    // UI Configuration
    title: string; // เช่น "ถังขยะ - ลูกค้า"
    backUrl: string; // เช่น "/customer"

    // Data Configuration
    idField: string; // เช่น "contactorId", "companyId", "productId"
    columns: GridColDef[]; // คอลัมน์ที่จะแสดงในตาราง (ไม่รวม actions)

    // Data Mapping (optional)
    mapData?: (data: any) => any; // สำหรับแปลงข้อมูลก่อนแสดง
}

export const GenericTrashTable: React.FC<GenericTrashTableProps> = ({
    fetchEndpoint,
    restoreEndpoint,
    deleteEndpoint,
    title,
    backUrl,
    idField,
    columns,
    mapData,
}) => {
    const router = useRouter();
    const theme = useTheme();

    const identityMap = (item: any) => item;
    const { rows, loading, refresh, paginationModel, setPaginationModel } = useDataTable({
        apiUrl: fetchEndpoint,
        mapData: mapData || identityMap,
    });

    const [searchQuery, setSearchQuery] = React.useState("");

    const handleRestore = async (itemId: string) => {
        try {
            const response = await fetch(restoreEndpoint(itemId), {
                method: "PUT",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to restore item");
            }
        } catch (error) {
            console.error("Error restoring item:", error);
        }
    };

    const handlePermanentDelete = async (itemId: string) => {
        try {
            const response = await fetch(deleteEndpoint(itemId), {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to permanently delete item");
            }
        } catch (error) {
            console.error("Error permanently deleting item:", error);
        }
    };

    const columnsWithActions: GridColDef[] = [
        ...columns,
        {
            field: "actions",
            headerName: "จัดการ",
            minWidth: 150,
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <TrashActionButtons
                    itemId={params.row[idField]}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                />
            ),
        },
    ];

    return (
        <GenericDataTable
            title={title}
            rows={rows}
            columns={columnsWithActions}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            paginationModel={paginationModel}
            onPaginationChange={setPaginationModel}
            getRowId={(row) => row[idField]}
            checkboxSelection={false}
            customHeader={
                <PageHeader
                    title={title}
                    actions={
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBack />}
                            onClick={() => router.push(backUrl)}
                            sx={{
                                borderRadius: "8px",
                                textTransform: "none",
                                fontWeight: 600,
                                px: 2,
                            }}
                        >
                            ย้อนกลับ
                        </Button>
                    }
                />
            }
        />
    );
};
