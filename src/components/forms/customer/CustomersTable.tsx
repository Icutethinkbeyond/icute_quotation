"use client";

import React, { useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip, Chip } from "@mui/material";
import { Business, Person } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Add, EditCalendar, Delete, Visibility } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { Customer } from "@/interfaces/Customer";

interface CustomerTableRow extends Customer {
    id: string;
}

const customerTypeLabel: Record<string, { label: string; color: "primary" | "success" | "default"; icon: React.ReactElement }> = {
    CORPORATION: { label: "นิติบุคคล", color: "primary", icon: <Business fontSize="small" /> },
    INDIVIDUAL: { label: "บุคคลธรรมดา", color: "success", icon: <Person fontSize="small" /> },
};

const CustomersTable: React.FC = () => {
    const router = useRouter();

    const mapCustomerData = useCallback((item: Customer): CustomerTableRow => ({
        ...item,
        id: item.id,
    }), []);

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

    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["name", "phone", "email", "taxId", "nationalId"],
        debounceMs: 500,
    });

    const handleDelete = async (customerId: string) => {
        try {
            const response = await fetch(`/api/customer/${customerId}`, {
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
        {
            field: "customerType",
            headerName: "ประเภท",
            width: 130,
            sortable: true,
            renderCell: (params: GridRenderCellParams) => {
                const typeInfo = customerTypeLabel[params.value as string] || customerTypeLabel.CORPORATION;
                return (
                    <Chip
                        icon={typeInfo.icon}
                        label={typeInfo.label}
                        color={typeInfo.color}
                        size="small"
                        variant="outlined"
                    />
                );
            },
        },
        { field: "name", headerName: "ชื่อลูกค้า", flex: 3, type: "string" },
        { field: "taxId", headerName: "เลขประจำตัวผู้เสียภาษี", flex: 2, type: "string" },
        { field: "phone", headerName: "เบอร์โทร", flex: 2, type: "string" },
        { field: "email", headerName: "อีเมล์", flex: 2, type: "string" },
        { field: "address", headerName: "ที่อยู่", flex: 3, type: "string" },
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
                            onClick={() => router.push(`/protected/customer/edit-customer/${params.row.id}`)}
                        >
                            <EditCalendar />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูข้อมูล">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/protected/customer/view-customer/${params.row.id}`)}
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
            onClick={() => router.push("/protected/customer/new-customer")}
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
