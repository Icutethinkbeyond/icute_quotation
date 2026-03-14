import React from "react";
import { Box, Typography, Grid } from "@mui/material"; // Changed Grid2 to Grid
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
        {/* Top section: Logo and Quotation Number/Date */}
        <Grid
          container
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ mb: 2 }}
        >
          {/* Company Logo (Left-Top) */}
          <Grid item xs={6}>
            <Box sx={{ width: "150px", height: "auto" }}>
              <img
                src="/images/logos/logo-dark.svg" // Assuming dark logo for print
                alt="Company Logo"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </Box>
          </Grid>
          {/* Quotation Number and Date (Right-Top) */}
          <Grid item xs={6} sx={{ textAlign: "right" }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: "bold",
                mb: 1.5,
                fontSize: 24,
                color: "#1976d2",
              }} // Larger title
            >
              ใบเสนอราคา
            </Typography>

            <Typography variant="body2" sx={{ fontSize: 13 }}>
              <strong>เลขที่:</strong> {headForm?.quotationNumber}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5, fontSize: 13 }}>
              <strong>ออกเมื่อวันที่:</strong>{" "}
              {formatThaiDate(headForm?.dateCreate)}
            </Typography>
          </Grid>
        </Grid>

        {/* Header with blue diagonal design (Below top section) */}
        <Box
          sx={{
            position: "relative",
            backgroundColor: "#1976d2", // Primary blue
            height: "25px", // Slightly increased height
            width: "100%",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: 0,
              width: "150px", // Wider diagonal section
              height: "100%",
              backgroundColor: "#115293", // Darker accent blue
              clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)", // Adjusted clipPath
            },
          }}
        />

        {/* Company Info and Invoice Title using Grid */}
        <Grid
          container
          justifyContent="space-between"
          sx={{ mt: 3, position: "relative", zIndex: 1 }} // Adjusted top margin
        >
          {/* ข้อมูลลูกค้า (ฝั่งซ้าย) */}
          <Grid item xs={6}>
            {" "}
            <Typography
              variant="h6"
              sx={{
                fontSize: 15,
                mb: 1,
                // color: "#232424",
              }}
            >
              {" "}
              {/* Emphasized */}
              ลูกค้า / ผู้ว่าจ้าง
            </Typography>
            {/* Changed size to item xs */}
            {headForm.customerType === "Corporate" ? (
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    mb: 1,
                    fontWeight: "bold",
                    color: "#1976d2",
                  }}
                >
                  {" "}
                  {/* Emphasized */}
                  {headForm?.customerCompanyName}
                </Typography>
                {headForm?.customerTaxId && (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ mt: 0.5, fontSize: 12 }}
                  >
                    {" "}
                    {/* Adjusted font size and color */}
                    เลขประจำตัวผู้เสียภาษี: {headForm?.customerTaxId}
                    {headForm?.customerBranch
                      ? ` (สาขา: ${headForm?.customerBranch})`
                      : ""}
                  </Typography>
                )}
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mt: 0.5, fontSize: 12 }}
                >
                  {" "}
                  {/* Adjusted font size and color */}
                  ที่อยู่: {headForm?.customerCompanyAddress || "-"}
                </Typography>

                {headForm?.contactorName && (
                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, mt: 2, fontSize: 14, fontWeight: "bold" }}
                  >
                    {" "}
                    {/* Slightly larger */}
                    ผู้ติดต่อ: {headForm?.contactorName}
                  </Typography>
                )}
                {headForm?.contactorTel && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontSize: 12 }}
                  >
                    โทรศัพท์: {headForm?.contactorTel}
                  </Typography>
                )}
                {headForm?.contactorEmail && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontSize: 12 }}
                  >
                    อีเมล: {headForm?.contactorEmail}
                  </Typography>
                )}
              </>
            ) : (
              // Individual Customer
              <>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 18,
                    mb: 1,
                    fontWeight: "bold",
                    color: "#1976d2",
                  }}
                >
                  {" "}
                  {/* Emphasized */}
                  ลูกค้า: {headForm?.contactorName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mb: 0.5, fontSize: 13 }}
                >
                  ที่อยู่: {headForm?.contactorAddress || "-"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.primary"
                  sx={{ mb: 0.5, fontSize: 13 }}
                >
                  เบอร์โทรศัพท์: {headForm?.contactorTel || "-"}
                </Typography>
                {headForm?.contactorEmail && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 0.5, fontSize: 12 }}
                  >
                    อีเมล: {headForm?.contactorEmail}
                  </Typography>
                )}
              </>
            )}
          </Grid>

          {/* ข้อมูลบริษัทและเลขที่เอกสาร (ฝั่งขวา) */}
          <Grid item xs={6} sx={{ textAlign: "left" }}>
            <Typography
              variant="h6"
              sx={{
                fontSize: 15,
                mb: 1,
                // color: "#232424",
              }}
            >
              {" "}
              {/* Emphasized */}
              ผู้เสนอราคา
            </Typography>{" "}
            {/* Changed size to item xs */}
            <Typography
              variant="h6"
              sx={{
                fontSize: 18,
                mb: 1,
                fontWeight: "bold",
                color: "#1976d2",
              }}
            >
              {headForm?.companyName}{" "}
              {headForm?.branch ? `สาขา ${headForm?.branch}` : ""}
            </Typography>
            {headForm?.taxId && (
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ lineHeight: 1.2, mt: 0.5, fontSize: 12 }}
              >
                เลขประจำตัวผู้เสียภาษี {headForm?.taxId}
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ display: "block", mt: 0.5, fontSize: 12 }}
            >
              {headForm?.companyAddress}
            </Typography>
            <Typography
              variant="body2"
              color="text.primary"
              sx={{ mt: 0.5, fontSize: 12 }}
            >
              โทร: {headForm?.companyTel}
            </Typography>
          </Grid>
        </Grid>
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
        borderBottom: "1px solid #e0e0e0", // Lighter border
        pb: 1.5, // Increased padding bottom
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", fontSize: 18, color: "#1976d2" }}
        >
          {" "}
          {/* Emphasized */}
          ใบเสนอราคา
        </Typography>
        <Typography variant="body2" sx={{ fontSize: 13 }}>
          <strong>เลขที่:</strong> {headForm?.quotationNumber}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography
          variant="body2"
          sx={{ fontSize: 12, color: "text.secondary" }}
        >
          หน้าที่ {pageIndex + 1}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuotationHeader;
