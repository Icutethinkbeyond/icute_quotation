"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import {
  ExternalLink,
  Globe,
  Copy,
} from "lucide-react";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { storeService } from "@/services/ApiServices/StoreAPI";
import { useSession } from "next-auth/react";

const StoreLinkButton = () => {
  const { setNotify } = useNotifyContext();
  const [storeURL, setStoreURL] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { data: session } = useSession();

  const getStoreURL = async () => {
    const result = await storeService.getShopSettings();
    if (result.success && result.data?.storeUsername) {
      const baseURL = process.env.NEXT_PUBLIC_CUSTOMER_ENDPOINT || "http://localhost:3000";
      setStoreURL(
        `${baseURL}/th/customer/${result.data.storeUsername}/booking`,
      );
    }
  };

  useEffect(() => {
    getStoreURL();
  }, []);

  return (
    <>
      <Tooltip title="ลิงก์สำหรับลูกค้า">
        <Button
          variant="outlined"
          size="small"
          startIcon={<Globe size={16} />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            whiteSpace: "nowrap",
          }}
        >
          ลิงก์ร้าน
        </Button>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => {
            if (storeURL) window.open(storeURL, "_blank");
            setAnchorEl(null);
          }}
        >
          <ExternalLink size={16} style={{ marginRight: "8px" }} /> เปิดดูหน้าร้าน
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (storeURL) {
              navigator.clipboard.writeText(storeURL);
              setNotify({
                open: true,
                message: "คัดลอกลิงก์แล้ว",
                color: "success",
              });
            }
            setAnchorEl(null);
          }}
        >
          <Copy size={16} style={{ marginRight: "8px" }} /> คัดลอกลิงก์
        </MenuItem>
      </Menu>
    </>
  );
};

export default StoreLinkButton;
