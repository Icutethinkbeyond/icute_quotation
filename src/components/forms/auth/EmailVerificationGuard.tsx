// components/auth/EmailVerificationGuard.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  AlertTitle,
  Avatar,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import {
  initialNotify,
  NotifyState,
  useNotifyContext,
} from "@/contexts/NotifyContext";
import React, { useEffect, useState } from "react";
import { Close } from "@mui/icons-material";
import { useLocale } from "next-intl";
import { authService } from "@/services/api-services/AuthAPI";

export default function EmailVerificationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notify, setNotify] = useState<NotifyState>(initialNotify);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(session?.user)
  }, [session])

  const pathname = usePathname(); // ดึง Path ปัจจุบัน
  const localActive = useLocale();

  // 1. กำหนดหน้าที่อนุญาตให้ผ่านได้ (White list)
  const isVerificationPage = pathname.startsWith(`/${localActive}/auth/verification-status`);

  // 2. ถ้าเป็นหน้า Verification ให้ปล่อยผ่านทันที 
  // (เพื่อให้ Logic การ Verify ในหน้านั้นทำงานได้)
  if (isVerificationPage) {
    return <>{children}</>;
  }

  const onClose = () => {
    setNotify({
      ...notify,
      open: false,
    });
  };

  if (status === "loading")
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress />
      </Box>
    );

  const handleFormSubmit = async () => {
    if (!session?.user?.email) return;
    setIsLoading(true);
    const result = await authService.resendVerifyEmail(session.user.email);

    setNotify({
      ...notify,
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    setIsLoading(false);
  };

  // 2. ถ้าล็อกอินแล้ว แต่ยังไม่ได้ยืนยันอีเมล
  if (status === "authenticated" && !session?.user?.isEmailVerified) {
    return (
      <Box
        sx={{
          minHeight: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              borderRadius: "24px",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: "primary.light",
                mx: "auto",
                mb: 3,
              }}
            >
              <MarkEmailReadIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Avatar>
            
            <Typography variant="h4" fontWeight="700" gutterBottom color="text.primary">
              ยืนยันอีเมลของคุณ
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
              ขอบคุณที่ร่วมเป็นส่วนหนึ่งกับเรา! เราได้ส่งลิงก์ยืนยันไปที่ <br />
              <Box component="span" sx={{ color: "primary.main", fontWeight: 600 }}>
                {session.user.email}
              </Box> <br />
              กรุณาตรวจสอบกล่องจดหมายของคุณเพื่อเปิดใช้งานบัญชี
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <LoadingButton
                variant="contained"
                fullWidth
                size="large"
                loading={isLoading}
                onClick={() => handleFormSubmit()}
                sx={{
                  borderRadius: "12px",
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 20px rgba(3, 201, 215, 0.2)",
                }}
              >
                ส่งอีเมลยืนยันอีกครั้ง
              </LoadingButton>
              
              <Button 
                variant="text" 
                color="inherit"
                onClick={() => signOut()}
                sx={{ fontWeight: 500, opacity: 0.7, "&:hover": { opacity: 1 } }}
              >
                ออกจากระบบ
              </Button>
            </Box>

            <Typography variant="caption" color="text.disabled" sx={{ mt: 4, display: "block" }}>
              หากไม่พบอีเมล กรุณาตรวจสอบในกล่องจดหมายขยะ (Spam)
            </Typography>
          </Paper>
        </Container>

        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={notify.open}
          autoHideDuration={4000}
          onClose={onClose}
        >
          <Alert
            onClose={onClose}
            severity={notify.color}
            variant="filled"
            sx={{ width: "100%", borderRadius: "12px", fontWeight: 500 }}
          >
            {notify.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  // 3. ถ้าผ่านเงื่อนไขทั้งหมด ให้แสดงเนื้อหาปกติ
  return <>{children}</>;
}

