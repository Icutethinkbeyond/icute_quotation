"use client";

import React, { useState, useCallback } from "react";
import { GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Box,
    useTheme,
} from "@mui/material";
import { IconPlus, IconTrash, IconEdit } from "@tabler/icons-react";
import GenericDataTable from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { useNotifyContext } from "@/contexts/NotifyContext";

interface CategoryRow {
    id: string;
    categoryName: string;
    categoryDesc: string;
    createdAt: string;
}

const CategoryTable = () => {
    const { setNotify } = useNotifyContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDesc, setCategoryDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const theme = useTheme();

    const mapCategoryData = useCallback((item: any): CategoryRow => ({
        id: item.categoryId,
        categoryName: item.categoryName,
        categoryDesc: item.categoryDesc || "",
        createdAt: new Date(item.createdAt).toLocaleDateString("th-TH"),
    }), []);

    const {
        rows,
        loading,
        paginationModel,
        setPaginationModel,
        refresh,
    } = useDataTable<any, CategoryRow>({
        apiUrl: "/api/inventory/product/category",
        mapData: mapCategoryData,
    });

    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["categoryName", "categoryDesc"],
        debounceMs: 500,
    });

    const resetForm = () => {
        setEditingId(null);
        setCategoryName("");
        setCategoryDesc("");
    };

    const openAdd = () => {
        resetForm();
        setIsDialogOpen(true);
    };

    const openEdit = (row: CategoryRow) => {
        setEditingId(row.id);
        setCategoryName(row.categoryName);
        setCategoryDesc(row.categoryDesc);
        setIsDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!categoryName.trim()) return;

        setIsSubmitting(true);
        try {
            const isEdit = Boolean(editingId);
            const url = isEdit
                ? `/api/inventory/product/category/${editingId}`
                : "/api/inventory/product/category";
            const method = isEdit ? "PATCH" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryName: categoryName.trim(),
                    categoryDesc: categoryDesc.trim() || null,
                }),
            });

            if (response.ok) {
                setNotify({
                    open: true,
                    message: isEdit ? "แก้ไขหมวดหมู่สำเร็จ" : "เพิ่มหมวดหมู่สำเร็จ",
                    color: "success",
                    header: "สำเร็จ",
                });
                setIsDialogOpen(false);
                resetForm();
                refresh();
            } else {
                const error = await response.json();
                setNotify({
                    open: true,
                    message: error.error || "เกิดข้อผิดพลาด",
                    color: "error",
                    header: "ข้อผิดพลาด",
                });
            }
        } catch (error) {
            setNotify({
                open: true,
                message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                color: "error",
                header: "ข้อผิดพลาด",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?")) return;

        try {
            const response = await fetch(`/api/inventory/product/category/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setNotify({
                    open: true,
                    message: "ลบหมวดหมู่สำเร็จ",
                    color: "success",
                    header: "สำเร็จ",
                });
                refresh();
            } else {
                const error = await response.json();
                setNotify({
                    open: true,
                    message: error.error || "เกิดข้อผิดพลาดในการลบหมวดหมู่",
                    color: "error",
                    header: "ข้อผิดพลาด",
                });
            }
        } catch (error) {
            setNotify({
                open: true,
                message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                color: "error",
                header: "ข้อผิดพลาด",
            });
        }
    };

    const columns: GridColDef[] = [
        { field: "categoryName", headerName: "ชื่อหมวดหมู่", flex: 2 },
        { field: "categoryDesc", headerName: "รายละเอียด", flex: 3 },
        { field: "createdAt", headerName: "วันที่สร้าง", width: 150 },
        {
            field: "actions",
            type: "actions",
            headerName: "จัดการ",
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<IconEdit style={{ color: theme.palette.primary.main }} />}
                    label="Edit"
                    onClick={() => openEdit(params.row as CategoryRow)}
                    showInMenu
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<IconTrash style={{ color: theme.palette.error.main }} />}
                    label="Delete"
                    onClick={() => handleDelete(params.id as string)}
                    showInMenu
                />,
            ],
        },
    ];

    return (
        <Box>
            <GenericDataTable
                title="จัดการหมวดหมู่สินค้า"
                rows={filteredRows}
                columns={columns}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                paginationModel={paginationModel}
                onPaginationChange={setPaginationModel}
                getRowId={(row) => row.id}
                headerActions={
                    <Button
                        variant="contained"
                        startIcon={<IconPlus />}
                        onClick={openAdd}
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
                        เพิ่มหมวดหมู่ใหม่
                    </Button>
                }
            />

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    pb: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    px: 3, py: 2
                }}>
                    {editingId ? "แก้ไขหมวดหมู่สินค้า" : "เพิ่มหมวดหมู่สินค้าใหม่"}
                </DialogTitle>
                <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ชื่อหมวดหมู่"
                        fullWidth
                        variant="outlined"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                        sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                backgroundColor: theme.palette.grey[50],
                                "& fieldset": { borderColor: theme.palette.grey[200] },
                                "&:hover fieldset": { borderColor: theme.palette.grey[300] },
                                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "2px" },
                            },
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="รายละเอียด"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={categoryDesc}
                        onChange={(e) => setCategoryDesc(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "8px",
                                backgroundColor: theme.palette.grey[50],
                                "& fieldset": { borderColor: theme.palette.grey[200] },
                                "&:hover fieldset": { borderColor: theme.palette.grey[300] },
                                "&.Mui-focused fieldset": { borderColor: theme.palette.primary.main, borderWidth: "2px" },
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button
                        onClick={() => setIsDialogOpen(false)}
                        color="inherit"
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 2.5
                        }}
                    >
                        ยกเลิก
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={isSubmitting || !categoryName.trim()}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 2.5,
                            boxShadow: "none",
                            "&:hover": {
                                boxShadow: theme.shadows[2],
                            },
                        }}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CategoryTable;
