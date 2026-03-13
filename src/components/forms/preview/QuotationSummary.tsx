import React from "react";
import { Box, Typography, Grid2, Divider } from "@mui/material";

interface QuotationSummaryProps {
  displayNote?: string;
  subtotal: number;
  discount: number;
  vatIncluded: boolean;
  taxAmount: number;
  withholdingTaxRate?: number;
  withholdingTaxAmount: number;
  grandTotal: number;
}

const QuotationSummary: React.FC<QuotationSummaryProps> = ({
  displayNote,
  subtotal,
  discount,
  vatIncluded,
  taxAmount,
  withholdingTaxRate,
  withholdingTaxAmount,
  grandTotal,
}) => {
  // ฟังก์ชันช่วยจัดฟอร์แมตตัวเลข
  const formatCurrency = (amount: number) =>
    amount.toLocaleString("th-TH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Grid2 container spacing={3} sx={{ mb: 3 }}>
      {/* ฝั่งซ้าย: หมายเหตุ */}
      <Grid2 size={{ xs: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
          หมายเหตุ:
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: "pre-wrap" }}
        >
          {displayNote || "-"}
        </Typography>
      </Grid2>

      {/* ฝั่งขวา: สรุปยอดเงินและลายเซ็น */}
      <Grid2 size={{ xs: 7 }}>
        <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
          {/* ยอดรวมย่อย */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2">ยอดรวมย่อย:</Typography>
            <Typography variant="body2">
              {formatCurrency(subtotal)} บาท
            </Typography>
          </Box>

          {/* ส่วนลด */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2">ส่วนลด:</Typography>
            <Typography variant="body2">
              {formatCurrency(discount)} บาท
            </Typography>
          </Box>

          {/* ภาษีมูลค่าเพิ่ม */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2">
              {!vatIncluded && "ไม่มี"}ภาษีมูลค่าเพิ่ม {vatIncluded && "(7%)"}:
            </Typography>
            <Typography variant="body2">
              {formatCurrency(taxAmount)} บาท
            </Typography>
          </Box>

          {/* หัก ณ ที่จ่าย */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="body2">
              หัก ฯ ที่จ่าย{" "}
              {withholdingTaxRate ? `(${withholdingTaxRate}%)` : ""}:
            </Typography>
            <Typography variant="body2">
              {formatCurrency(withholdingTaxAmount)} บาท
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* ยอดรวมทั้งสิ้น (แถบสีน้ำเงิน) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              backgroundColor: "#1565c0",
              p: 2,
              borderRadius: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: "white", fontWeight: "bold" }}
            >
              รวมทั้งสิ้น:
            </Typography>
            <Typography
              sx={{ color: "white", fontSize: 18, letterSpacing: 0.5 }}
            >
              {formatCurrency(grandTotal)} บาท
            </Typography>
          </Box>
        </Box>

        {/* ส่วนลงลายมือชื่อ */}
        <Box sx={{ mt: 3, textAlign: "right" }}>
          <Box
            sx={{
              borderBottom: "1px solid black",
              width: "200px",
              ml: "auto",
              mb: 1,
              mt: 5,
              height: "40px", // พื้นที่สำหรับลายเซ็น
            }}
          />
          <Typography variant="body2" sx={{ mr: 7 }}>
            ลงลายมือชื่อ
          </Typography>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default QuotationSummary;
