"use client";

import React, { useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, IconButton, Tooltip, Chip, useTheme } from "@mui/material";
import { useRouter } from "next/navigation";
import { Add, EditCalendar, Delete, Visibility, DeleteSweep } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";

interface QuotationRow {
    id: string;
    quotationNumber: string;
    customerCompanyName: string;
    totalAmount: number;
    status: string;
    dateCreate: string;
}

const QuotationsTable: React.FC = () => {
    const router = useRouter();
    const theme = useTheme();

    const mapQuotationData = useCallback((quotation: any): QuotationRow => ({
        id: quotation.documentId,
        quotationNumber: quotation.documentIdNo,
        customerCompanyName: quotation.customerCompany?.companyName || quotation.contactor?.contactorName || "ทั่วไป",
        totalAmount: quotation.grandTotal || 0,
        status: quotation.documentStatus,
        dateCreate: quotation.documentCreateDate ? new Date(quotation.documentCreateDate).toLocaleDateString("th-TH") : "-",
    }), []);

    const {
        rows,
        loading,
        paginationModel,
        setPaginationModel,
        refresh,
    } = useDataTable<any, QuotationRow>({
        apiUrl: "/api/income/quotation",
        mapData: mapQuotationData,
    });

    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["quotationNumber", "customerCompanyName"],
        debounceMs: 500,
    });

    const handleDelete = async (quotationId: string) => {
        if (!confirm("คุณต้องการย้ายใบเสนอราคานี้ไปถังขยะใช่หรือไม่?")) return;
        try {
            const response = await fetch(`/api/income/quotation/${quotationId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to move quotation to trash");
            }
        } catch (error) {
            console.error("Error moving quotation to trash:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "quotationNumber", headerName: "เลขที่ใบเสนอราคา", flex: 1.5, minWidth: 150 },
        { field: "customerCompanyName", headerName: "บริษัทลูกค้า", flex: 2, minWidth: 200 },
        { 
            field: "totalAmount", 
            headerName: "ยอดรวม", 
            flex: 1, 
            minWidth: 120, 
            type: "number",
            valueFormatter: (params: any) => params.value.toLocaleString("th-TH", { minimumFractionDigits: 2 }),
        },
        { 
            field: "status", 
            headerName: "สถานะ", 
            flex: 1, 
            minWidth: 100,
            renderCell: (params: GridRenderCellParams) => {
                let color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' = 'default';
                let label = params.value;
                switch (params.value) {
                    case 'Draft': 
                        color = 'info'; 
                        label = 'ฉบับร่าง';
                        break;
                    case 'Waiting': 
                        color = 'warning'; 
                        label = 'รออนุมัติ';
                        break;
                    case 'Approve': 
                        color = 'success'; 
                        label = 'อนุมัติแล้ว';
                        break;
                    case 'Cancel': 
                        color = 'error'; 
                        label = 'ยกเลิก';
                        break;
                    default: 
                        color = 'default'; 
                        break;
                }
                return <Chip label={label} color={color} size="small" sx={{ fontWeight: 600 }} />;
            },
        },
        { field: "dateCreate", headerName: "วันที่สร้าง", flex: 1, minWidth: 120 },
        {
            field: "actions",
            headerName: "การจัดการ",
            headerAlign: "center",
            align: "center",
            disableColumnMenu: true,
            sortable: false,
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.5 }}>
                    <Tooltip title="แก้ไข">
                        <IconButton
                            size="small"
                            color="secondary"
                            onClick={() => router.push(`/quotation/edit-quotation/${params.row.id}`)}
                        >
                            <EditCalendar fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="ดูข้อมูล">
                        <IconButton
                            color="primary"
                            onClick={() => router.push(`/quotation/view-quotation/${params.row.id}`)}
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
                onClick={() => router.push("/quotation/trash")}
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
                onClick={() => router.push("/quotation/new-quotation")}
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
                สร้างใบเสนอราคาใหม่
            </Button>
        </>
    );

    return (
        <GenericDataTable
            title="ใบเสนอราคาทั้งหมด"
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

export default QuotationsTable;
