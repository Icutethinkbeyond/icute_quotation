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
import { CompanyProfile } from "@/interfaces/Company";

interface CompanyTableRow extends CompanyProfile {
    id: string;
}

const CompanyTrashTable: React.FC = () => {
    const router = useRouter();

    // Data mapping function
    const mapCompanyData = useCallback((item: CompanyProfile): CompanyTableRow => ({
        ...item,
        id: item.companyId,
    }), []);

    // Use data table hook
    const {
        rows,
        loading,
        paginationModel,
        setPaginationModel,
        refresh,
    } = useDataTable<CompanyProfile, CompanyTableRow>({
        apiUrl: "/api/companies?trash=true",
        mapData: mapCompanyData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["companyName", "companyTaxId", "companyPhoneNumber", "companyEmail"],
        debounceMs: 500,
    });

    const handleRestore = async (companyId: string) => {
        try {
            const response = await fetch(`/api/companies/${companyId}`, {
                method: "PUT",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to restore company");
            }
        } catch (error) {
            console.error("Error restoring company:", error);
        }
    };

    const handlePermanentDelete = async (companyId: string) => {
        try {
            const response = await fetch(`/api/companies/${companyId}?permanent=true`, {
                method: "DELETE",
            });

            if (response.ok) {
                refresh();
            } else {
                console.error("Failed to permanently delete company");
            }
        } catch (error) {
            console.error("Error permanently deleting company:", error);
        }
    };

    const columns: GridColDef[] = [
        { field: "companyName", headerName: "ชื่อบริษัท", flex: 3, type: "string", },
        { field: "companyTaxId", headerName: "เลขผู้เสียภาษี", flex: 3, type: "string", },
        { field: "companyPhoneNumber", headerName: "เบอร์โทรศัพท์", flex: 3, type: "string", },
        { field: "companyEmail", headerName: "อีเมล", flex: 3, type: "string", },
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
                        itemId={params.row.companyId}
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
                <Typography variant="h3">ถังขยะ (บริษัท)</Typography>
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

export default CompanyTrashTable;
