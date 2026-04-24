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

  const pathname = usePathname(); // ดึง Path ปัจจุบัน
  const localActive = useLocale();

  // 1. กำหนดหน้าที่อนุญาตให้ผ่านได้ (White list)
  const isVerificationPage = pathname.startsWith(`/${localActive}/store/auth/verification-status`);

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
    setIsLoading(true);
    const result = await authService.resendVerifyEmail();

    setNotify({
      ...notify,
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    setIsLoading(false);
  };

  // 2. ถ้าล็อกอินแล้ว แต่ emailVerified เป็น null (ยังไม่ได้ยืนยัน)
  if (session?.user && !Boolean(session.user.emailVerified)) {
    return (
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{ p: 4, mt: 8, textAlign: "center", borderRadius: 2 }}
        >
          <MarkEmailReadIcon
            sx={{ fontSize: 60, color: "warning.main", mb: 2 }}
          />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            กรุณายืนยันอีเมลของคุณ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            เราได้ส่งลิงก์ยืนยันไปที่ <b>{session.user.email}</b> แล้ว
            กรุณาตรวจสอบกล่องจดหมาย (หรือ Junk mail) เพื่อเปิดใช้งานบัญชี
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <LoadingButton
              variant="contained"
              fullWidth
              size="large"
              loading={isLoading}
              onClick={() => handleFormSubmit()}
            >
              ส่งอีเมลยืนยันอีกครั้ง
            </LoadingButton>
            <Button variant="text" onClick={() => signOut()}>
              ออกจากระบบ
            </Button>
          </Box>
        </Paper>
        <Snackbar
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={notify.open}
          autoHideDuration={3000}
          onClose={onClose}
        >
          <Alert
            variant="filled"
            severity={notify.color}
            action={
              <React.Fragment>
                {/* {action} */}
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  // sx={{ fontFamily: "inherit", fontSize: '1em' }}
                  onClick={onClose}
                >
                  <Close fontSize="small" />
                  {/* รับทราบ */}
                </IconButton>
              </React.Fragment>
            }
          >
            <AlertTitle>
              {notify.header ? notify.header : "แจ้งเตือน"}
            </AlertTitle>
            {notify.message}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  // 3. ถ้าผ่านเงื่อนไขทั้งหมด ให้แสดงเนื้อหาปกติ
  return <>{children}</>;
}

