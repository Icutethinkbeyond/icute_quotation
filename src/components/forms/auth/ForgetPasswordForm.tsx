"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Grid2,
  Box,
  Card,
  Avatar,
  Divider,
} from "@mui/material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { authService } from "@/services/ApiServices/AuthAPI";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Mail, HelpCircle, ArrowLeft, Send } from "lucide-react";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
});

export default function ForgetPasswordForm() {
  const { setNotify } = useNotifyContext();
  const router = useRouter();
  const localActive = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (
    values: { email: string },
    { setSubmitting }: FormikHelpers<{ email: string }>
  ) => {
    setIsSubmitting(true);
    const result = await authService.sendForgotPassword(values.email);

    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    
    setIsSubmitting(false);
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, md: 4 },
        // backgroundColor: "#f5f7f9",
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
            <HelpCircle size={40} color="white" />
          </Box>
          <Typography variant="h3" fontWeight="800" mb={2}>
            ลืมรหัสผ่าน?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
            ไม่ต้องกังวล เราจะช่วยคุณ<br />กู้คืนการเข้าถึงบัญชีของคุณ
          </Typography>
          
          <Box sx={{ mt: "auto", width: "100%" }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />
            <Button 
              color="inherit" 
              variant="text" 
              startIcon={<ArrowLeft size={18} />}
              sx={{ 
                opacity: 0.8,
                "&:hover": { opacity: 1, bgcolor: "rgba(255,255,255,0.1)" }
              }}
              onClick={() => router.push(`/${localActive}/store/auth/sign-in`)}
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
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
          <Typography variant="h4" fontWeight="700" mb={1} color="text.primary">
            กู้คืนรหัสผ่าน
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            กรุณากรอกอีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์เพื่อตั้งรหัสผ่านใหม่ไปให้คุณ
          </Typography>

          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ errors, touched }) => (
              <Form>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                        <Mail size={16} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        อีเมลของคุณ
                      </Typography>
                    </Box>
                    <Field name="email">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          fullWidth
                          placeholder="example@email.com"
                          variant="outlined"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
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
                      endIcon={<Send size={18} />}
                      sx={{
                        borderRadius: "12px",
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        boxShadow: "0 8px 20px rgba(24, 46, 78, 0.2)",
                      }}
                    >
                      ส่งลิงก์รีเซ็ตรหัสผ่าน
                    </LoadingButton>
                  </Grid2>
                  
                  <Grid2 size={{ xs: 12 }} sx={{ textAlign: "center", mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      หากไม่พบอีเมล กรุณาตรวจสอบในกล่องจดหมายขยะ (Spam)
                    </Typography>
                  </Grid2>
                </Grid2>
              </Form>
            )}
          </Formik>
        </Box>
      </Card>
    </Box>
  );
}
