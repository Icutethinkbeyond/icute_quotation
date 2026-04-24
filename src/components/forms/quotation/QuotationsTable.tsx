"use client";

import React, { useState, useCallback } from "react";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Box, Button, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import { Add, DeleteSweep } from "@mui/icons-material";
import { GenericDataTable } from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { QuotationActionButtons } from "@/components/quotation/ActionButtons";
import {
  documentIdColumn,
  creationDateColumn,
  customerNameColumn,
  grandTotalColumn,
  statusColumn,
} from "@/components/quotation/TableColumns";
import {
  IQuotation,
  IQuotationTableRow,
  QuotationsTableProps,
} from "@/contexts/QuotationContext";
import { min } from "lodash";
import { downloadQuotationPDF } from "@/services/pdf/quotationPDF";

const QuotationsTable: React.FC<QuotationsTableProps> = () => {
  const router = useRouter();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Data mapping function
  const mapQuotationData = useCallback(
    (item: IQuotation): IQuotationTableRow => ({
      ...item,
      keyId: item.documentIdNo,
      id: item.documentIdNo,
    }),
    [],
  );

  // Use data table hook
  const { rows, loading, paginationModel, setPaginationModel, refresh } =
    useDataTable<IQuotation, IQuotationTableRow>({
      apiUrl: "/api/income/quotation",
      mapData: mapQuotationData,
    });

  // Use debounce search hook
  const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
    rows,
    searchFields: [
      "documentIdNo",
      "contactor.contactorName",
      "customerCompany.companyName",
      "grandTotal",
    ],
    debounceMs: 1000,
  });

  const handleDelete = async (documentId: string) => {
    try {
      const response = await fetch(`/api/income/quotation/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        refresh();
      } else {
        console.error("Failed to delete quotation");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
    }
  };

  const handlePDFDownload = async (documentId: string) => {
    try {
      setDownloadingId(documentId);

      // Fetch the quotation data
      const response = await fetch(`/api/income/quotation/${documentId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch quotation data");
      }

      const result = await response.json();
      const quotationData = result.data || result;

      // Generate and download PDF
      await downloadQuotationPDF(quotationData);
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDuplicate = async (documentId: string) => {
    try {
      const response = await fetch(`/api/income/quotation/${documentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          duplicateType: "full",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Quotation duplicated:", result);
        refresh();
      } else {
        const error = await response.json();
        console.error("Failed to duplicate quotation:", error);
      }
    } catch (error) {
      console.error("Error duplicating quotation:", error);
    }
  };

  const columns: GridColDef[] = [
    documentIdColumn,
    creationDateColumn,
    customerNameColumn,
    grandTotalColumn,
    {
      field: "status",
      headerName: "สถานะ",
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.documentStatus}
          size="small"
          color={
            params.row.documentStatus === "Approve"
              ? "success"
              : params.row.documentStatus === "Draft"
                ? "default"
                : params.row.documentStatus === "Waiting"
                  ? "warning"
                  : "error"
          }
          sx={{ fontWeight: 600 }}
        />
      ),
    },
    {
      field: "Actions",
      headerName: "การจัดการ",
      headerAlign: "center",
      align: "center",
      disableColumnMenu: true,
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <QuotationActionButtons
            documentId={params.row.documentId}
            onEdit={(id) => router.push(`/quotation/edit-quotation/${id}`)}
            onPreview={(id) =>
              window.open(`/quotation/pdf-preview/${id}`, "_blank")
            }
            onDownloadPDF={handlePDFDownload}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            isDownloading={downloadingId === params.row.documentId}
          />
        </Box>
      ),
    },
  ];

  const headerActions = (
    <>
      <Button
        startIcon={<DeleteSweep />}
        onClick={() => router.push("/quotation/trash")}
        sx={{
          backgroundColor: "#ffe2e6",
          color: "#d32f2f",
          "&:hover": { backgroundColor: "#f9c2c8" },
          textTransform: "none",
          px: 2,
          mr: 1,
        }}
      >
        ถังขยะ
      </Button>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => router.push("/quotation/new-quotation")}
        sx={{
          backgroundColor: "#03c9d7",
          color: "#fff",
          "&:hover": { backgroundColor: "#05b2bd" },
          textTransform: "none",
        }}
      >
        สร้างใบเสนอราคา
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
      getRowId={(row) => row.keyId}
      headerActions={headerActions}
    />
  );
};

export default QuotationsTable;
