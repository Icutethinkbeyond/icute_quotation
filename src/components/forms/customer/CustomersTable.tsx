"use client";

import React, { useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip } from "@mui/material";
import { useRouter } from "next/navigation";
import { Add, EditCalendar, Delete, Visibility } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { Customer } from "@/interfaces/Customer";

interface CustomerTableRow extends Customer {
    id: string;
}

const CustomersTable: React.FC = () => {
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
        apiUrl: "/api/customer",
        mapData: mapCustomerData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["contactorName", "contactorTel", "contactorEmail"],
        debounceMs: 500,
    });

    const handleDelete = async (contactorId: string) => {
        try {
            const response = await fetch(`/api/customer/${contactorId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to delete customer");
            }
        } catch (error) {
            console.error("Error deleting customer:", error);
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
                    <Tooltip title="แก้ไข">
                        <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => router.push(`/customer/edit-customer/${params.row.contactorId}`)}
                        >
                            <EditCalendar />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูข้อมูล">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/customer/view-customer/${params.row.contactorId}`)}
                            size="small"
                        >
                            <Visibility />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ลบ">
                        <IconButton
                            size="small"
                            sx={{ color: "#d33" }}
                            onClick={() => handleDelete(params.row.contactorId)}
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
            onClick={() => router.push("/customer/new-customer")}
            sx={{
                backgroundColor: "#03c9d7",
                color: "#fff",
                "&:hover": { backgroundColor: "#05b2bd" },
                textTransform: "none",
            }}
        >
            เพิ่มลูกค้าใหม่
        </Button>
    );

    return (
        <GenericDataTable
            title="ข้อมูลลูกค้าทั้งหมด"
            rows={filteredRows}
            columns={columns}
            loading={loading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            paginationModel={paginationModel}
            onPaginationChange={setPaginationModel}
            getRowId={(row) => row.id}
            headerActions={headerActions}
        />
    );
};

export default CustomersTable;
