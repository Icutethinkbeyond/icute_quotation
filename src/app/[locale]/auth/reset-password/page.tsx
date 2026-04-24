import ResetPasswordForm from "@/components/forms/auth/ResetPasswordForm";
import { Box, Card, Typography } from "@mui/material";

const ResetPassword = () => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        padding: 4,
      }}
    >
      <ResetPasswordForm />
    </Box>
  );
};

export default ResetPassword;
