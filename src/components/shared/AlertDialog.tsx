"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Grow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import { useNotifyContext, NotifyState } from "@/contexts/NotifyContext";

export type AlertDisplayType = "error" | "warning" | "success" | "info";

function AlertDialog() {
  const { notify, setNotify } = useNotifyContext();
  const { open, message, color, header } = notify as NotifyState;

  const handleClose = function () {
    setNotify(function (prev) {
      return Object.assign({}, prev, { open: false });
    });
  };

  const getIcon = function () {
    switch (color) {
      case "success":
        return React.createElement(CheckCircleIcon, { sx: { fontSize: 40 } });
      case "error":
        return React.createElement(ErrorIcon, { sx: { fontSize: 40 } });
      case "warning":
        return React.createElement(WarningAmberIcon, { sx: { fontSize: 40 } });
      case "info":
      default:
        return React.createElement(InfoIcon, { sx: { fontSize: 40 } });
    }
  };

  const getColor = function () {
    switch (color) {
      case "success":
        return "#2e7d32";
      case "error":
        return "#d32f2f";
      case "warning":
        return "#ed6c02";
      case "info":
      default:
        return "#0288d1";
    }
  };

  const getDefaultHeader = function () {
    switch (color) {
      case "success":
        return "สำเร็จ";
      case "error":
        return "เกิดข้อผิดพลาด";
      case "warning":
        return "คำเตือน";
      case "info":
      default:
        return "ข้อมูล";
    }
  };

  const iconColor = getColor();

  const dialogTitle = React.createElement(
    "div",
    { style: { display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 8 } },
    React.createElement(
      "div",
      { style: { display: "flex", alignItems: "center", gap: 12 } },
      React.createElement("span", { style: { color: iconColor } }, getIcon()),
      React.createElement("span", { style: { fontWeight: 600, fontSize: "1.1rem" } }, header || getDefaultHeader())
    ),
    React.createElement(
      IconButton,
      { onClick: handleClose, size: "small" },
      React.createElement(CloseIcon, { fontSize: "small" })
    )
  );

  const dialogContent = React.createElement(
    "p",
    { style: { margin: 0, fontSize: "0.95rem", lineHeight: 1.6 } },
    message
  );

  const dialogActions = React.createElement(
    DialogActions,
    { sx: { px: 3, pb: 2, justifyContent: "flex-end" } },
    React.createElement(
      Button,
      {
        onClick: handleClose,
        variant: "contained",
        sx: {
          backgroundColor: iconColor,
          "&:hover": {
            backgroundColor: iconColor,
            filter: "brightness(0.9)",
          },
          minWidth: 100,
        },
      },
      "ตกลง"
    )
  );

  return React.createElement(
    Dialog,
    {
      open: open,
      onClose: handleClose,
      maxWidth: "sm",
      fullWidth: true,
      TransitionComponent: Grow,
      PaperProps: {
        sx: {
          borderRadius: 2,
          padding: 1,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      },
    },
    React.createElement(DialogTitle, null, dialogTitle),
    React.createElement(DialogContent, { sx: { pt: 1 } }, dialogContent),
    dialogActions
  );
}

export function useAlertDialog() {
  const { setNotify } = useNotifyContext();

  function showAlert(msg: string, type: AlertDisplayType = "info", hdr?: string) {
    setNotify({
      open: true,
      message: msg,
      color: type,
      header: hdr || null,
    });
  }

  return { showAlert };
}

export default AlertDialog;
