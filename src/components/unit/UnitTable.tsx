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
    Box
} from "@mui/material";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import GenericDataTable from "@/components/shared/GenericDataTable";
import { useDataTable } from "@/hooks/useDataTable";
import { useDebounceSearch } from "@/hooks/useDebounceSearch";
import { useNotifyContext } from "@/contexts/NotifyContext";

interface UnitRow {
    id: string;
    unitName: string;
    createdAt: string;
}

const UnitTable = () => {
    const { setNotify } = useNotifyContext();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newUnitName, setNewUnitName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data mapping function
    const mapUnitData = useCallback((item: any): UnitRow => ({
        id: item.unitId,
        unitName: item.unitName,
        createdAt: new Date(item.createdAt).toLocaleDateString("th-TH"),
    }), []);

    // Use data table hook
    const { 
        rows, 
        loading, 
        paginationModel, 
        setPaginationModel, 
        refresh 
    } = useDataTable<any, UnitRow>({
        apiUrl: "/api/units",
        mapData: mapUnitData,
    });

    // Use debounce search hook
    const { searchQuery, setSearchQuery, filteredRows } = useDebounceSearch({
        rows,
        searchFields: ["unitName"],
        debounceMs: 500,
    });

    const handleAddUnit = async () => {
        if (!newUnitName.trim()) return;
        
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/units", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ unitName: newUnitName }),
            });

            if (response.ok) {
                setNotify({
                    open: true,
                    message: "เพิ่มหน่วยสำเร็จ",
                    color: "success",
                    header: "สำเร็จ"
                });
                setIsDialogOpen(false);
                setNewUnitName("");
                refresh();
            } else {
                const error = await response.json();
                setNotify({
                    open: true,
                    message: error.error || "เกิดข้อผิดพลาดในการเพิ่มหน่วย",
                    color: "error",
                    header: "ข้อผิดพลาด"
                });
            }
        } catch (error) {
            setNotify({
                open: true,
                message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                color: "error",
                header: "ข้อผิดพลาด"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUnit = async (id: string) => {
        if (!confirm("คุณต้องการลบหน่วยนี้ใช่หรือไม่?")) return;

        try {
            const response = await fetch(`/api/units/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setNotify({
                    open: true,
                    message: "ลบหน่วยสำเร็จ",
                    color: "success",
                    header: "สำเร็จ"
                });
                refresh();
            } else {
                setNotify({
                    open: true,
                    message: "เกิดข้อผิดพลาดในการลบหน่วย",
                    color: "error",
                    header: "ข้อผิดพลาด"
                });
            }
        } catch (error) {
            setNotify({
                open: true,
                message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
                color: "error",
                header: "ข้อผิดพลาด"
            });
        }
    };

    const columns: GridColDef[] = [
        { field: "unitName", headerName: "ชื่อหน่วย", flex: 1 },
        { field: "createdAt", headerName: "วันที่สร้าง", width: 150 },
        {
            field: "actions",
            type: "actions",
            headerName: "จัดการ",
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="delete"
                    icon={<IconTrash style={{ color: "red" }} />}
                    label="Delete"
                    onClick={() => handleDeleteUnit(params.id as string)}
                />,
            ],
        },
    ];

    return (
        <Box>
            <GenericDataTable
                title="จัดการหน่วยสินค้า"
                rows={filteredRows}
                columns={columns}
                loading={loading}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                paginationModel={paginationModel}
                onPaginationChange={setPaginationModel}
                headerActions={
                    <Button
                        variant="contained"
                        startIcon={<IconPlus />}
                        onClick={() => setIsDialogOpen(true)}
                        sx={{ bgcolor: "#03c9d7", "&:hover": { bgcolor: "#05b2bd" } }}
                    >
                        เพิ่มหน่วยใหม่
                    </Button>
                }
            />

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>เพิ่มหน่วยสินค้าใหม่</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="ชื่อหน่วย"
                        fullWidth
                        variant="outlined"
                        value={newUnitName}
                        onChange={(e) => setNewUnitName(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddUnit()}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setIsDialogOpen(false)} color="inherit">
                        ยกเลิก
                    </Button>
                    <Button 
                        onClick={handleAddUnit} 
                        variant="contained" 
                        disabled={isSubmitting || !newUnitName.trim()}
                        sx={{ bgcolor: "#03c9d7", "&:hover": { bgcolor: "#05b2bd" } }}
                    >
                        บันทึก
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UnitTable;
