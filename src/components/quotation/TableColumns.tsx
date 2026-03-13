import { GridColDef } from "@mui/x-data-grid";

/**
 * Reusable column definition for document number
 */
export const documentIdColumn: GridColDef = {
    field: "keyId",
    headerName: "เลขที่เอกสาร",
    width: 200,
    valueGetter: (value, row) => row.documentIdNo,
};

/**
 * Reusable column definition for creation date
 */
export const creationDateColumn: GridColDef = {
    field: "createDate",
    headerName: "วันที่ออกเอกสาร",
    width: 150,
    valueGetter: (value, row) => {
        if (!row.createdAt) return "N/A";
        return new Date(row.createdAt).toLocaleDateString("th-TH");
    },
};

/**
 * Reusable column definition for deleted date
 */
export const deletedDateColumn: GridColDef = {
    field: "deletedAt",
    headerName: "วันที่ลบ",
    width: 150,
    valueGetter: (value, row) => {
        if (!row.deletedAt) return "N/A";
        return new Date(row.deletedAt).toLocaleDateString("th-TH");
    },
};

/**
 * Reusable column definition for customer name
 */
export const customerNameColumn: GridColDef = {
    field: "contactorName",
    headerName: "ชื่อลูกค้า",
    width: 250,
    valueGetter: (value, row) => row.contactor?.contactorName || "N/A",
};

/**
 * Reusable column definition for grand total
 * Now reads pre-calculated value from backend
 */
export const grandTotalColumn: GridColDef = {
    field: "grandTotal",
    headerName: "ยอดรวมสุทธิ",
    width: 180,
    valueGetter: (value, row) => {
        // Read pre-calculated value from backend
        const grandTotal = row.grandTotal || row.calculated?.grandTotal || 0;
        return grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 });
    },
};

/**
 * Reusable column definition for status (commented out by default)
 */
export const statusColumn: GridColDef = {
    field: "status",
    headerName: "สถานะ",
    width: 150,
    valueGetter: (value, row) => row.documentStatus,
};
