import React from "react";
import { Box, Typography, Grid2, Divider } from "@mui/material";
import { HeadForm } from "@/contexts/QuotationContext";

interface SignatureProps {
  headForm: HeadForm;
}

const Signature: React.FC<SignatureProps> = ({
  headForm,
}) => {
  // ฟังก์ชันช่วยจัดฟอร์แมตตัวเลข

  return (
    <Grid2
      container
      spacing={2}
      sx={{ mb: 0 }}
      className="signature-section"
    >
      <Grid2 container flexDirection="row">
        <Grid2 size={{ xs: 4 }}>
          {/* Section signature */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px solid black",
                width: "180px",
                ml: "auto",
                mb: 0.5,
                height: "20px",
              }}
            />
            <Typography variant="caption">ผู้อนุมัติ / ผู้ว่าจ้าง</Typography>
            <Typography variant="body2">
              คุณ{" "}
              {headForm.customerType === "Corporate"
                ? headForm?.customerCompanyName
                : headForm?.contactorName}
            </Typography>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 4 }}>
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px solid black",
                width: "180px",
                mb: 0.5,
                height: "20px",
              }}
            />
            <Typography variant="caption">ผู้เสนอราคา / ผู้รับจ้าง</Typography>
            <Typography variant="body2">{headForm?.companyName}</Typography>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 4 }} justifyContent="center">
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px dashed black",
                width: "180px",
                mb: 0.5,
                height: "18px",
              }}
            />
            <Typography variant="caption">พยาน</Typography>
          </Box>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default Signature;
