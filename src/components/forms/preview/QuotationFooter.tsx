import React from "react";
import { Box } from "@mui/material";

const QuotationFooter: React.FC = () => {
  return (
    <Box sx={{ marginTop: "auto", pt: 1 }}>
      {/* Blue footer with diagonal design */}
      <Box
        sx={{
          position: "relative",
          backgroundColor: "#1976d2", // Primary blue, matching header
          height: "15px", // Adjusted height, slightly smaller than header
          width: "100%",
          overflow: "hidden", // กันส่วนเกินของ pseudo-element
          "&::after": {
            content: '""',
            position: "absolute",
            right: 0,
            bottom: 0,
            width: "150px", // Wider diagonal section, matching header
            height: "100%",
            backgroundColor: "#115293", // Darker accent blue, matching header
            clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0 100%)", // Adjusted clipPath to complement header
          },
        }}
      />
    </Box>
  );
};

export default QuotationFooter;