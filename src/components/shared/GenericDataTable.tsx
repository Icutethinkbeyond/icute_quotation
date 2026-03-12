"use client";

import React from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Box, Paper, useTheme } from "@mui/material";
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
    const theme = useTheme();

    return (
        <Box>
            {customHeader || (
                <PageHeader
                    title={title}
                    actions={headerActions}
                />
            )}

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <SearchBox
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={searchPlaceholder || "ค้นหา..."}
                />
            </Box>

            <Paper
                variant="outlined"
                sx={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: theme.shadows[1], // Subtle shadow
                    border: '1px solid',
                    borderColor: theme.palette.divider,
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
                        minHeight: '60vh', // Adjust as needed
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: theme.palette.grey[50],
                            borderBottom: '1px solid',
                            borderColor: theme.palette.divider,
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 700,
                                color: theme.palette.text.secondary,
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                            },
                        },
                        '& .MuiDataGrid-row': {
                            '&:nth-of-type(odd)': {
                                backgroundColor: theme.palette.background.paper, // White for odd rows
                            },
                            '&:nth-of-type(even)': {
                                backgroundColor: theme.palette.grey[50], // Light gray for even rows
                            },
                            '&:hover': {
                                backgroundColor: theme.palette.action.hover, // Subtle hover effect
                            },
                            '&.Mui-selected': {
                                backgroundColor: theme.palette.primary.light + '!important', // Keep primary light for selection
                                '&:hover': {
                                    backgroundColor: theme.palette.primary.light,
                                },
                            },
                        },
                        '& .MuiDataGrid-cell': {
                            borderBottom: '1px solid',
                            borderColor: theme.palette.divider,
                            fontSize: '0.875rem',
                            color: theme.palette.text.primary,
                            '&:focus': {
                                outline: 'none',
                            },
                            '&.MuiDataGrid-cell--textLeft': {
                                pl: 2, // Adjust padding for text alignment
                            },
                        },
                        '& .MuiDataGrid-footerContainer': {
                            borderTop: '1px solid',
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.grey[50],
                        },
                        '& .MuiCheckbox-root': {
                            color: theme.palette.primary.main,
                            '&.Mui-checked': {
                                color: theme.palette.primary.dark,
                            },
                        },
                        // Custom toolbar styling
                        '& .MuiDataGrid-toolbarContainer': {
                            padding: theme.spacing(1, 2),
                            borderBottom: '1px solid',
                            borderColor: theme.palette.divider,
                            backgroundColor: theme.palette.background.paper,
                        },
                    }}
                />
            </Paper>
        </Box>
    );
}

export default GenericDataTable;
