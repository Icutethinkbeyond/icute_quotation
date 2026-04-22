import React from "react";
import { Box, Typography, Grid2, Divider } from "@mui/material";
import { HeadForm } from "@/contexts/QuotationContext";

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
    <Grid2
      container
      spacing={2}
      sx={{ mb: 1 }}
      className="quotation-summary"
    >
      {/* ฝั่งซ้าย: หมายเหตุ */}
      <Grid2 size={{ xs: 5 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
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
        <Box sx={{ backgroundColor: "#f5f5f5", p: 1, borderRadius: 1 }}>
          {/* ยอดรวมย่อย */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12 }}>ยอดรวมย่อย:</Typography>
            <Typography sx={{ fontSize: 12 }}>
              {formatCurrency(subtotal)} บาท
            </Typography>
          </Box>

          {/* ส่วนลด */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12 }}>ส่วนลด:</Typography>
            <Typography sx={{ fontSize: 12 }}>
              {formatCurrency(discount)} บาท
            </Typography>
          </Box>

          {/* ภาษีมูลค่าเพิ่ม */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12 }}>
              {!vatIncluded && "ไม่มี"}ภาษีมูลค่าเพิ่ม {vatIncluded && "(7%)"}:
            </Typography>
            <Typography sx={{ fontSize: 12 }}>
              {formatCurrency(taxAmount)} บาท
            </Typography>
          </Box>

          {/* หัก ณ ที่จ่าย */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 12 }}>
              หัก ฯ ที่จ่าย{" "}
              {withholdingTaxRate ? `(${withholdingTaxRate}%)` : ""}:
            </Typography>
            <Typography sx={{ fontSize: 12 }}>
              {formatCurrency(withholdingTaxAmount)} บาท
            </Typography>
          </Box>

          <Divider sx={{ mb: 1 }} />

          {/* ยอดรวมทั้งสิ้น (แถบสีน้ำเงิน) */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#1565c0",
              p: 0.5,
              borderRadius: 1,
            }}
          >
            <Typography sx={{ color: "white", fontSize: 14 }}>
              รวมทั้งสิ้น:
            </Typography>
            <Typography
              sx={{ color: "white", fontSize: 16, letterSpacing: 0.5 }}
            >
              {formatCurrency(grandTotal)} บาท
            </Typography>
          </Box>
        </Box>
      </Grid2>

    </Grid2>
  );
};

export default QuotationSummary;
