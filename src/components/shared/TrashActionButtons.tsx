import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Restore, DeleteForever } from "@mui/icons-material";

interface TrashActionButtonsProps {
    itemId: string;
    onRestore: (id: string) => void;
    onPermanentDelete: (id: string) => void;
}

export const TrashActionButtons: React.FC<TrashActionButtonsProps> = ({
    itemId,
    onRestore,
    onPermanentDelete,
}) => {
    return (
        <>
            <Tooltip title="กู้คืนรายการ">
                <IconButton
                    size="small"
                    color="success"
                    onClick={() => onRestore(itemId)}
                >
                    <Restore />
                </IconButton>
            </Tooltip>

            <Tooltip title="ลบถาวร">
                <IconButton
                    size="small"
                    color="error"
                    onClick={() => onPermanentDelete(itemId)}
                >
                    <DeleteForever />
                </IconButton>
            </Tooltip>
        </>
    );
};
