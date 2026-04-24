import { Box, Card, Typography } from "@mui/material";
import AuthRegisterForm from "@/components/forms/auth/AuthRegisterForm";
import Image from "next/image";

const AuthRegister = () => {
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
      <AuthRegisterForm />
    </Box>
  );
};

export default AuthRegister;
