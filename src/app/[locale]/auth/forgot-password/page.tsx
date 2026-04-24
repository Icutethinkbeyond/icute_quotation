import { Box, Card, Typography } from "@mui/material";
import ForgetPasswordForm from "@/components/forms/auth/ForgetPasswordForm";
import Image from "next/image";

const ForgetPassword = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <ForgetPasswordForm />
    </Box>
  );
};

export default ForgetPassword;
