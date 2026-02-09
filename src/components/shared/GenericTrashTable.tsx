"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { GridColDef } from "@mui/x-data-grid";
import GenericDataTable from "@/components/shared/GenericDataTable";
import { TrashActionButtons } from "./TrashActionButtons";
import useDataTable from "@/hooks/useDataTable";

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

    // useDataTable ต้องมี mapData function
    const identityMap = (item: any) => item;
    const { rows, loading, refresh, paginationModel, setPaginationModel } = useDataTable({
        apiUrl: fetchEndpoint,
        mapData: mapData || identityMap,
    });

    // Search state
    const [searchQuery, setSearchQuery] = React.useState("");

    // ฟังก์ชัน Restore
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

    // ฟังก์ชัน Permanent Delete
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

    // เพิ่มคอลัมน์ Actions
    const columnsWithActions: GridColDef[] = [
        ...columns,
        {
            field: "actions",
            headerName: "จัดการ",
            minWidth: 120,
            flex: 0.5,
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
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => router.push(backUrl)}
                    >
                        ย้อนกลับ
                    </Button>
                    <Typography variant="h5" component="h1" fontWeight="bold">
                        {title}
                    </Typography>
                </Box>
            }
        />
    );
};
