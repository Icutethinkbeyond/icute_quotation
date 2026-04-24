import React from "react";
import { IconButton, CircularProgress, Tooltip } from "@mui/material";
import {
    EditCalendar,
    Visibility,
    PictureAsPdf,
    Delete,
    Restore,
    DeleteForever,
    FileCopy,
} from "@mui/icons-material";

interface QuotationActionButtonsProps {
    documentId: string;
    onEdit: (id: string) => void;
    onPreview: (id: string) => void;
    onDownloadPDF: (id: string) => void;
    onDelete: (id: string) => void;
    onDuplicate?: (id: string) => void;
    isDownloading?: boolean;
}

export const QuotationActionButtons: React.FC<QuotationActionButtonsProps> = ({
    documentId,
    onEdit,
    onPreview,
    onDownloadPDF,
    onDelete,
    onDuplicate,
    isDownloading = false,
}) => {
    const handleDuplicate = async () => {
        if (!onDuplicate) return;
        try {
            await onDuplicate(documentId);
        } catch (error) {
            console.error("Error duplicating quotation:", error);
        }
    };

    return (
        <>
            <Tooltip title="คัดลอก">
                <IconButton
                    size="small"
                    color="success"
                    onClick={handleDuplicate}
                >
                    <FileCopy />
                </IconButton>
            </Tooltip>

            <Tooltip title="แก้ไข">
                <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => onEdit(documentId)}
                >
                    <EditCalendar />
                </IconButton>
            </Tooltip>

            <Tooltip title="ดูตัวอย่าง">
                <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onPreview(documentId)}
                >
                    <Visibility />
                </IconButton>
            </Tooltip>

            <Tooltip title="ดาวน์โหลด PDF">
                <IconButton
                    size="small"
                    color="info"
                    disabled={isDownloading}
                    onClick={() => onDownloadPDF(documentId)}
                >
                    {isDownloading ? (
                        <CircularProgress size={20} color="info" />
                    ) : (
                        <PictureAsPdf />
                    )}
                </IconButton>
            </Tooltip>

            <Tooltip title="ลบ">
                <IconButton
                    size="small"
                    sx={{ color: '#d33' }}
                    onClick={() => onDelete(documentId)}
                >
                    <Delete />
                </IconButton>
            </Tooltip>
        </>
    );
};

interface TrashActionButtonsProps {
    documentId: string;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}

export const TrashActionButtons: React.FC<TrashActionButtonsProps> = ({
    documentId,
    onRestore,
    onPermanentDelete,
}) => {
    return (
        <>
            <Tooltip title="กู้คืนรายการ">
                <IconButton
                    size="small"
                    color="success"
                    onClick={() => onRestore(documentId)}
                >
                    <Restore />
                </IconButton>
            </Tooltip>

            <Tooltip title="ลบถาวร">
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => onPermanentDelete(documentId)}
                >
                    <DeleteForever />
                </IconButton>
            </Tooltip>
        </>
    );
};
