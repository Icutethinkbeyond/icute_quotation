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
    <Grid2 container spacing={3} sx={{ mb: 3 }}>

      <Grid2 container flexDirection="row">
        <Grid2 size={{ xs: 4 }}>
          {/* ส่วนลงลายมือชื่อ */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px solid black",
                width: "200px",
                ml: "auto",
                mb: 1,
                height: "20px", // พื้นที่สำหรับลายเซ็น
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
          {/* ส่วนลงลายมือชื่อ */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px solid black",
                width: "200px",
                mb: 1,
                height: "20px", // พื้นที่สำหรับลายเซ็น
              }}
            />
            <Typography variant="caption">ผู้เสนอราคา / ผู้รับจ้าง</Typography>
            <Typography variant="body2">{headForm?.companyName}</Typography>
          </Box>
        </Grid2>
        <Grid2 size={{ xs: 4 }} justifyContent="center">
          {/* ส่วนลงลายมือชื่อ */}
          <Box sx={{ textAlign: "center" }}>
            <Box
              sx={{
                borderBottom: "1px solid black",
                width: "200px",
                ml: "auto",
                mb: 1,
                height: "20px", // พื้นที่สำหรับลายเซ็น
              }}
            />
            <Typography variant="caption">พยาน</Typography>
            <Box
              sx={{
                borderBottom: "1px dashed black",
                width: "200px",
                mb: 1,
                height: "18px", // พื้นที่สำหรับลายเซ็น
              }}
            />
          </Box>
        </Grid2>
      </Grid2>
    </Grid2>
  );
};

export default Signature;
