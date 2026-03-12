import React from "react";
import { Box, Typography, Grid2 } from "@mui/material";
import { HeadForm } from "@/contexts/QuotationContext";
import { formatThaiDate } from "@/utils/utils";

interface QuotationHeaderProps {
  pageIndex: number;
  headForm: HeadForm;
}

const QuotationHeader: React.FC<QuotationHeaderProps> = ({
  pageIndex,
  headForm,
}) => {
  // --- หน้าแรก (Full Header) ---
  if (pageIndex === 0) {
    return (
      <Box sx={{ width: "100%", mb: 2 }}>
        {/* Header with blue diagonal design */}
        <Box
          sx={{
            position: "relative",
            backgroundColor: "#1565c0",
            height: "40px",
            width: "100%",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              width: "120px",
              height: "100%",
              backgroundColor: "#0d47a1",
              clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 100%)",
            },
          }}
        />

        {/* Company Info and Invoice Title using Grid2 */}
        <Grid2
          container
          justifyContent="space-between"
          sx={{ mt: 2, position: "relative", zIndex: 1 }}
        >
          {/* ข้อมูลลูกค้า (ฝั่งซ้าย) */}
          <Grid2 size={6}>
            {headForm.customerType === "Corporate" ? (
              <>
                <Typography variant="h6" sx={{ fontSize: 16, mb: 1, fontWeight: "bold" }}>
                  ลูกค้า: {headForm?.customerCompanyName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                  เบอร์โทรศัพท์: {headForm?.customerCompanyTel || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                  ที่อยู่: {headForm?.customerCompanyAddress}
                </Typography>
                {headForm?.customerTaxId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                    เลขประจำตัวผู้เสียภาษี: {headForm?.customerTaxId}
                    {headForm?.customerBranch ? ` (สาขา: ${headForm?.customerBranch})` : ""}
                  </Typography>
                )}
                {headForm?.contactorName && (
                  <Typography variant="body2" sx={{ mb: 0.5, fontSize: 13, fontWeight: 500 }}>
                    ชื่อผู้ติดต่อ: {headForm?.contactorName}
                  </Typography>
                )}
                {headForm?.contactorTel && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                    โทรศัพท์: {headForm?.contactorTel}
                  </Typography>
                )}
                {headForm?.contactorEmail && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                    อีเมล: {headForm?.contactorEmail}
                  </Typography>
                )}
              </>
            ) : (
              // Individual Customer
              <>
                <Typography variant="h6" sx={{ fontSize: 16, mb: 1, fontWeight: "bold" }}>
                  ลูกค้า: {headForm?.contactorName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                  เบอร์โทรศัพท์: {headForm?.contactorTel || "-"}
                </Typography>
                {headForm?.contactorEmail && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                    อีเมล: {headForm?.contactorEmail}
                  </Typography>
                )}
                {headForm?.contactorAddress && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, fontSize: 12 }}>
                    ที่อยู่: {headForm?.contactorAddress}
                  </Typography>
                )}
              </>
            )}
          </Grid2>

          {/* ข้อมูลบริษัทและเลขที่เอกสาร (ฝั่งขวา) */}
          <Grid2 size={6} sx={{ textAlign: "right" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: "bold", mb: 1, fontSize: 20 }}
            >
              ใบเสนอราคา
            </Typography>
            <Typography variant="body2" sx={{ fontSize: 12 }}>
              <strong>เลขที่:</strong> {headForm?.quotationNumber}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: 12 }}>
              <strong>ออกเมื่อวันที่:</strong>{" "}
              {formatThaiDate(headForm?.dateCreate)}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                lineHeight: 1.2,
                mt: 1.5,
                fontSize: 14,
              }}
            >
              {headForm?.companyName} {headForm?.branch ? `สาขา ${headForm?.branch}` : ""}
            </Typography>

            {headForm?.taxId && (
              <Typography
                variant="h6"
                sx={{ lineHeight: 1.2, mt: 0.5, fontSize: 11 }}
              >
                เลขประจำตัวผู้เสียภาษี {headForm?.taxId}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", lineHeight: 1.4, mt: 0.5, fontSize: 11 }}
            >
              {headForm?.companyAddress}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ lineHeight: 1, fontSize: 11 }}
            >
              โทร: {headForm?.companyTel}
            </Typography>
          </Grid2>
        </Grid2>
      </Box>
    );
  }

  // --- หน้าอื่นๆ (Simplified Header) ---
  return (
    <Box
      sx={{
        mb: 2,
        mt: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: "1px solid #eee",
        pb: 1,
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", fontSize: 16 }}>
          ใบเสนอราคา
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 12 }}>
          <strong>เลขที่:</strong> {headForm?.quotationNumber}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography variant="body2" sx={{ fontSize: 10, color: "text.secondary" }}>
          หน้าที่ {pageIndex + 1}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuotationHeader;
