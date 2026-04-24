"use client";

import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid2,
  TextField,
  Avatar,
  Card,
  Divider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import * as Yup from "yup";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";

import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { KeyRound, Lock, ArrowRight, CheckCircle, EyeOff, Eye } from "lucide-react";
import {
  ResetPassword,
  initialResetPassword,
} from "@/interfaces/User";
import { authService } from "@/services/ApiServices/AuthAPI";

interface StoreProps {
  viewOnly?: boolean;
}

const ResetPasswordForm: FC<StoreProps> = ({ viewOnly = false }) => {
  const { setNotify } = useNotifyContext();
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [success, setSuccess] = useState<boolean>(false);

  const router = useRouter();
  const localActive = useLocale();
  const searchParams = useSearchParams();
  const searchParamsToken = searchParams.get("token");

  const signinUrl = `/${localActive}/store/auth/sign-in`;

  const validationSchema = Yup.object().shape({
    newPassword: Yup.string()
      .required("กรุณากรอกรหัสผ่านใหม่")
      .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
    confirmPassword: Yup.string()
      .required("กรุณากรอกยืนยันรหัสผ่าน")
      .oneOf([Yup.ref("newPassword")], "รหัสผ่านไม่ตรงกัน"),
  });

  const handleFormSubmit = async (
    values: ResetPassword,
    { setSubmitting, validateForm }: FormikHelpers<ResetPassword>
  ) => {
    validateForm();
    setSubmitting(true);

    if (!searchParamsToken) {
      setNotify({
        open: true,
        message: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือไม่พบ Token",
        color: "error",
      });
      setSubmitting(false);
      return;
    }

    const payload = {
      ...values,
      token: searchParamsToken,
    };

    const result = await authService.resetPassword(payload);

    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });

    if (result.success) {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.replace(signinUrl);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, router, signinUrl]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, md: 4 },
        backgroundColor: "#f5f7f9",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "1000px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          minHeight: "550px",
        }}
      >
        {/* Left Section - Hero/Branding */}
        <Box
          sx={{
            bgcolor: "primary.main",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: { xs: "100%", md: "40%" },
            flexDirection: "column",
            padding: 6,
            color: "white",
            textAlign: "center",
            background: "linear-gradient(135deg, #182E4E 0%, #3BB173 100%)",
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "20px",
              bgcolor: "rgba(255,255,255,0.2)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Lock size={40} color="white" />
          </Box>
          <Typography variant="h3" fontWeight="800" mb={2}>
            ตั้งรหัสผ่านใหม่
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
            สร้างรหัสผ่านใหม่ที่ปลอดภัย<br />เพื่อปกป้องบัญชีร้านค้าของคุณ
          </Typography>
          
          <Box sx={{ mt: "auto", width: "100%" }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              จำรหัสผ่านได้แล้ว?
            </Typography>
            <LoadingButton 
              color="inherit" 
              variant="text" 
              sx={{ 
                mt: 1,
                opacity: 0.8,
                "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" }
              }}
              onClick={() => router.push(signinUrl)}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </LoadingButton>
          </Box>
        </Box>

        {/* Right Section - Form */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: 4, md: 8 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            bgcolor: "white",
          }}
        >
          {success ? (
            <Box sx={{ textAlign: "center" }}>
              <Avatar sx={{ bgcolor: "success.light", width: 64, height: 64, mx: "auto", mb: 3 }}>
                <CheckCircle size={32} color="#2e7d32" />
              </Avatar>
              <Typography variant="h4" fontWeight="700" mb={2}>
                ตั้งรหัสผ่านใหม่สำเร็จ!
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                ระบบกำลังนำคุณไปยังหน้าเข้าสู่ระบบในอีก
              </Typography>
              <Typography variant="h2" fontWeight="800" color="primary.main" mb={4}>
                {countdown}
              </Typography>
              <LoadingButton
                variant="contained"
                onClick={() => router.replace(signinUrl)}
                sx={{ borderRadius: "12px", px: 4 }}
              >
                เข้าสู่ระบบทันที
              </LoadingButton>
            </Box>
          ) : (
            <>
              <Typography variant="h4" fontWeight="700" mb={1} color="text.primary">
                ความปลอดภัยใหม่
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={5}>
                กรุณาระบุรหัสผ่านใหม่ที่คุณต้องการใช้งาน
              </Typography>

              <Formik<ResetPassword>
                initialValues={initialResetPassword}
                validationSchema={validationSchema}
                onSubmit={handleFormSubmit}
                enableReinitialize
              >
                {({ setFieldValue, errors, touched, isSubmitting }) => (
                  <Form>
                    <Grid2 container spacing={3}>
                      <Grid2 size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                            <KeyRound size={16} />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="600">
                            รหัสผ่านใหม่
                          </Typography>
                        </Box>
                        <Field name="newPassword">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              type={showPassword ? "text" : "password"}
                              fullWidth
                              placeholder="อย่างน้อย 6 ตัวอักษร"
                              error={touched.newPassword && Boolean(errors.newPassword)}
                              helperText={touched.newPassword && errors.newPassword}
                              InputProps={{
                                readOnly: viewOnly,
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        </Field>
                      </Grid2>

                      <Grid2 size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                          <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                            <KeyRound size={16} />
                          </Avatar>
                          <Typography variant="subtitle1" fontWeight="600">
                            ยืนยันรหัสผ่านอีกครั้ง
                          </Typography>
                        </Box>
                        <Field name="confirmPassword">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              type={showPassword ? "text" : "password"}
                              fullWidth
                              placeholder="กรอกรหัสผ่านเดิมซ้ำอีกครั้ง"
                              error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                              helperText={touched.confirmPassword && errors.confirmPassword}
                              InputProps={{ readOnly: viewOnly }}
                            />
                          )}
                        </Field>
                      </Grid2>

                      <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                        <LoadingButton
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          loading={isSubmitting}
                          endIcon={<ArrowRight size={20} />}
                          sx={{
                            borderRadius: "12px",
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: "600",
                            boxShadow: "0 8px 20px rgba(24, 46, 78, 0.2)",
                          }}
                        >
                          บันทึกรหัสผ่านใหม่
                        </LoadingButton>
                      </Grid2>
                    </Grid2>
                  </Form>
                )}
              </Formik>
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default ResetPasswordForm;
