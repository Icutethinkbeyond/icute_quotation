"use client";
import { Box, Button, Container } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";

export default function InvoicePage() {

  const router = useRouter();

  const handleBack = () => {
    router.push("/quotation");
  };

  return (
    <Box
      sx={{
        "@media print": {
          "& .no-print": {
            display: "none",
          },
        },
      }}
    >
      <Container
        maxWidth="md"
        className="no-print"
        sx={{ py: 3, display: "flex", justifyContent: "flex-start", gap: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ textTransform: "none" }}
        >
          กลับ
        </Button>
      </Container>
      {/* <InvoicePrintPage /> */}
    </Box>
  );
}
