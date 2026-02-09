"use client";

import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box } from "@mui/material";
import { CustomNoRowsOverlay } from "@/components/shared/NoData";
import { CustomToolbar } from "@/components/shared/CustomToolbar";
import SearchBox from "@/components/shared/SearchBox";
import PageHeader from "@/components/shared/PageHeader";

export interface GenericDataTableProps<T> {
    /** Page title displayed in header */
    title: string;
    /** Data rows to display */
    rows: T[];
    /** Column definitions for DataGrid */
    columns: GridColDef[];
    /** Loading state */
    loading: boolean;
    /** Current search query value */
    searchQuery: string;
    /** Callback when search query changes */
    onSearchChange: (value: string) => void;
    /** Current pagination model */
    paginationModel: GridPaginationModel;
    /** Callback when pagination changes */
    onPaginationChange: (model: GridPaginationModel) => void;
    /** Function to get unique row ID */
    getRowId?: (row: T) => string;
    /** Action buttons displayed in header */
    headerActions?: React.ReactNode;
    /** Enable checkbox selection (default: true) */
    checkboxSelection?: boolean;
    /** Available page size options (default: [5, 10, 20, 50, 100]) */
    pageSizeOptions?: number[];
    /** Custom header component instead of PageHeader */
    customHeader?: React.ReactNode;
    /** Search box placeholder text */
    searchPlaceholder?: string;
}

/**
 * Generic reusable DataTable component with search, pagination, and customizable actions
 */
export function GenericDataTable<T>({
    title,
    rows,
    columns,
    loading,
    searchQuery,
    onSearchChange,
    paginationModel,
    onPaginationChange,
    getRowId,
    headerActions,
    checkboxSelection = true,
    pageSizeOptions = [5, 10, 20, 50, 100],
    customHeader,
    searchPlaceholder,
}: GenericDataTableProps<T>) {
    return (
        <Box>
            {customHeader || (
                <PageHeader
                    title={title}
                    actions={headerActions}
                />
            )}

            <Box mb={2}>
                <SearchBox
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder}
                />
            </Box>

            <Box
                sx={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    mb: 2,
                    mt: 2,
                }}
            >
                <DataGrid
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={pageSizeOptions}
                    checkboxSelection={checkboxSelection}
                    disableRowSelectionOnClick
                    rows={rows}
                    columns={columns}
                    loading={loading}
                    onPaginationModelChange={onPaginationChange}
                    getRowId={getRowId}
                    slots={{
                        noRowsOverlay: CustomNoRowsOverlay,
                        toolbar: CustomToolbar,
                    }}
                    sx={{
                        minHeight: '70vh',
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#e5fafb',
                            borderBottom: '2px solid #03c9d7',
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 600,
                                color: '#2A3547',
                                fontSize: '0.875rem',
                            },
                        },
                        '& .MuiDataGrid-row': {
                            '&:nth-of-type(even)': {
                                backgroundColor: '#fafbfb',
                            },
                            '&:hover': {
                                backgroundColor: '#e5fafb',
                            },
                            '&.Mui-selected': {
                                backgroundColor: '#cef4f6',
                                '&:hover': {
                                    backgroundColor: '#b8eef1',
                                },
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid #e5eaef',
                            fontSize: '0.875rem',
                            color: '#5A6A85',
                            '&:focus': {
                                outline: 'none',
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid #e5eaef',
                            backgroundColor: '#fff',
                        },
                        '& .MuiCheckbox-root': {
                            color: '#03c9d7',
                            '&.Mui-checked': {
                                color: '#05b2bd',
                            },
                        },
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: '12px 16px',
                            borderBottom: '1px solid #e5eaef',
                            '& .MuiButton-root': {
                                color: '#05b2bd',
                            },
                        },
                    }}
                />
            </Box>
        </Box>
    );
}

export default GenericDataTable;
