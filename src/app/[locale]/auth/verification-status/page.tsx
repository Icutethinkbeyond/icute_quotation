"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Container,
  Alert,
  Paper,
} from "@mui/material";
import { useSession } from "next-auth/react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useLocale } from "next-intl";

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locaActive = useLocale();
  const { data: session, status: authStatus, update } = useSession();
  const [countdown, setCountdown] = useState(5);


  const redirectUrl = `/${locaActive}/store/protected/dashboard`

  const [isProcessing, setIsProcessing] = useState(true);
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  useEffect(() => {
    // Only start countdown after processing is done
    if (isProcessing || status !== "success") return;
    
    // Don't start countdown if already at 0
    if (countdown <= 0) return;
    
    // นับถอยหลัง
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    // ครบเวลา → redirect
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (authStatus === "authenticated") {
        // Already logged in - go to dashboard
        router.replace(redirectUrl);
      } else {
        // Not logged in - go to login page
        router.replace(`/${locaActive}/store/auth/sign-in?verified=true`);
      }
    }, countdown * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isProcessing, status, countdown, router, redirectUrl, authStatus, locaActive]);

  useEffect(() => {
    if (status !== "success") {
      setIsProcessing(false);
      return;
    }

    const handleLogic = async () => {
      try {
        if (authStatus === "authenticated") {
          // Refresh session to get updated emailVerified from database
          await update();
          setIsProcessing(false);
          return;
        }

        if (authStatus === "unauthenticated") {
          // User is not logged in, redirect to login page
          router.replace(`/${locaActive}/store/auth/sign-in?verified=true`);
          return;
        }
      } catch (error) {
        console.error("Update session failed:", error);
        setIsProcessing(false);
      }
    };

    handleLogic();
  }, [status, authStatus, update, router, locaActive]);

  // useEffect(() => {
  //   if (status !== "success") {
  //     setIsProcessing(false);
  //     return;
  //   }

  //   // รอให้ next-auth รู้สถานะก่อน
  //   if (authStatus === "loading") return;

  //   const handleLogic = async () => {
  //     try {
  //       if (authStatus === "authenticated") {
  //         // บังคับ refresh session (ดึงค่าล่าสุดจาก DB)
  //         const updatedSession = await update({
  //           emailVerified: true, // สำคัญมาก
  //         });

  //         console.log("Updated session:", updatedSession);
  //         setIsProcessing(false);
  //         return;
  //       }

  //       if (authStatus === "unauthenticated") {
  //         router.replace(`/${locaActive}/auth/sign-in`);
  //         return;
  //       }
  //     } catch (error) {
  //       console.error("Update session failed:", error);
  //       setIsProcessing(false);
  //     }
  //   };

  //   handleLogic();
  // }, [status, authStatus, update, router, locaActive]);

  if (isProcessing) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 10,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>กำลังดำเนินการ...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
        {status === "success" ? (
          <Box>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 64, color: "success.main", mb: 2 }}
            />
            <Typography
              variant="h4"
              gutterBottom
              color="success.main"
              fontWeight="bold"
            >
              สำเร็จ!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {message || "ยืนยันอีเมลของคุณเรียบร้อยแล้ว"}
            </Typography>
            {/* <Button variant="contained" fullWidth onClick={() => router.push(`/${locaActive}/protected/admin/dashboard`)}>
              เข้าสู่ Dashboard
            </Button> */}
            <Button variant="contained" fullWidth>
              <span style={{ paddingRight: 10 }}>
                ระบบกำลังนำคุณไปเข้าสู่ระบบใหม่{" "}
              </span>
              <strong style={{ fontSize: 24, paddingRight: 10 }}>
                {" "}
                {countdown}{" "}
              </strong>{" "}
              วินาที
            </Button>
          </Box>
        ) : (
          <Box>
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: "error.main", mb: 2 }}
            />
            <Typography
              variant="h4"
              gutterBottom
              color="error.main"
              fontWeight="bold"
            >
              เกิดข้อผิดพลาด
            </Typography>
            <Alert severity="error" sx={{ mb: 3, textAlign: "left" }}>
              {message || "ไม่สามารถทำรายการได้ กรุณาลองใหม่อีกครั้ง"}
            </Alert>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push(`/${locaActive}`)}
            >
              กลับไปหน้าหลัก
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

// ต้องใช้ Suspense เพราะมีการใช้ useSearchParams
export default function VerificationStatusPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <VerificationContent />
    </Suspense>
  );
}
