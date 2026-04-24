"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
  Grid2,
  Avatar,
  Box,
  Card,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { StoreRegister } from "@/interfaces/Store";
import { useStoreContext } from "@/contexts/StoreContext";
import { KeyRound, StoreIcon, UserPlus, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authService } from "@/services/ApiServices/AuthAPI";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object().shape({
  storeName: Yup.string().required("กรุณากรอกชื่อร้านค้า"),
  storeUsername: Yup.string()
    .required("กรุณากรอก ID ร้านค้า")
    .matches(/^[a-zA-Z0-9-]+$/, "ID ร้านค้าต้องเป็นภาษาอังกฤษ ตัวเลข หรือขีดกลางเท่านั้น")
    .min(3, "ID ร้านค้าต้องมีอย่างน้อย 3 ตัวอักษร")
    .test('check-username', 'ชื่อผู้ใช้งานนี้ถูกใช้ไปแล้ว', async (value) => {
      if (!value || value.length < 3) return true;
      const res = await authService.checkStoreUsername(value);
      return res.available;
    }),
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: Yup.string().required("กรุณากรอกรหัสผ่าน").min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: Yup.string()
    .required("กรุณากรอกยืนยันรหัสผ่าน")
    .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  termsAccepted: Yup.bool().oneOf([true], "กรุณายอมรับเงื่อนไขการใช้บริการ"),
});

const AuthRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setNotify, openBackdrop } = useNotifyContext();
  const { storeRegister } = useStoreContext();

  const router = useRouter();
  const localActive = useLocale();

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (
    values: StoreRegister,
    {
      setSubmitting,
      resetForm,
    }: FormikHelpers<StoreRegister>
  ) => {
    setSubmitting(true);

    const result = await authService.registerStore(values);
    
    if (result.success) {
      setNotify({
        open: true,
        message: "สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        color: "success",
      });
      resetForm();
      setTimeout(() => {
        router.push(`/${localActive}/store/auth/sign-in`);
      }, 2000);
    } else {
      setNotify({
        open: true,
        message: result.message,
        color: "error",
      });
    }
    setSubmitting(false);
  };

  return (
    <Box
      sx={{
        // minHeight: "90vh",
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
          maxWidth: "1100px",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
          minHeight: "750px",
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
            <UserPlus size={40} color="white" />
          </Box>
          <Typography variant="h3" fontWeight="800" mb={2}>
            iCute Booking
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
            เริ่มต้นจัดการธุรกิจของคุณ<br />ให้ง่ายและเป็นระบบมากขึ้น
          </Typography>
          
          <Box sx={{ mt: "auto", width: "100%" }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              มีบัญชีอยู่แล้ว? 
            </Typography>
            <Button 
              color="inherit" 
              variant="outlined" 
              sx={{ 
                mt: 2, 
                borderColor: "rgba(255,255,255,0.5)",
                borderRadius: "12px",
                px: 4,
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
              }}
              onClick={() => router.push(`/${localActive}/store/auth/sign-in`)}
            >
              เข้าสู่ระบบที่นี่
            </Button>
          </Box>
        </Box>

        {/* Right Section - Form */}
        <Box
          sx={{
            flex: 1,
            padding: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
          }}
        >
          <Typography variant="h4" fontWeight="700" mb={1} color="text.primary">
            สร้างบัญชีใหม่
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            กรอกข้อมูลสั้นๆ เพื่อเริ่มต้นใช้งานระบบจองคิวออนไลน์
          </Typography>

          <Formik<StoreRegister>
            initialValues={storeRegister}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({
              values,
              setFieldValue,
              errors,
              touched,
              isSubmitting,
            }) => (
              <Form>
                <Grid2 container spacing={2.5}>
                  {/* Section 1: User Account */}
                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                        <KeyRound size={16} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        ข้อมูลการเข้าสู่ระบบ
                      </Typography>
                    </Box>
                  </Grid2>
                  
                  <Grid2 size={{ xs: 12 }}>
                    <Field name="email">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          label="อีเมลสำหรับการเข้าใช้งาน"
                          type="email"
                          fullWidth
                          variant="outlined"
                          error={touched.email && Boolean(errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      )}
                    </Field>
                  </Grid2>
                  
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="password">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          label="รหัสผ่าน"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleTogglePassword} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </Field>
                  </Grid2>
                  
                  <Grid2 size={{ xs: 12, sm: 6 }}>
                    <Field name="confirmPassword">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          label="ยืนยันรหัสผ่าน"
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                        />
                      )}
                    </Field>
                  </Grid2>

                  {/* Section 2: Store Info */}
                  <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "secondary.light", width: 32, height: 32 }}>
                        <StoreIcon size={16} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        ข้อมูลร้านค้า
                      </Typography>
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Field name="storeName">
                      {({ field }: FieldProps) => (
                        <TextField
                          {...field}
                          label="ชื่อร้านค้าของคุณ"
                          fullWidth
                          error={touched.storeName && Boolean(errors.storeName)}
                          helperText={touched.storeName && errors.storeName}
                          placeholder="เช่น iCute Salon"
                        />
                      )}
                    </Field>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Field name="storeUsername">
                      {({ field, form }: FieldProps) => (
                        <TextField
                          {...field}
                          label="ID ร้านค้า (สำหรับใช้งานใน URL)"
                          fullWidth
                          error={form.touched.storeUsername && Boolean(form.errors.storeUsername)}
                          helperText={typeof form.errors.storeUsername === 'string' ? form.errors.storeUsername : undefined}
                          placeholder="เช่น icute-salon"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Typography variant="body2" color="text.disabled">
                                  booking.icute.site/
                                </Typography>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                {form.isValidating && field.value ? (
                                  <Loader2 size={20} className="animate-spin" color="#94a3b8" />
                                ) : form.touched.storeUsername && !form.errors.storeUsername && field.value.length >= 3 ? (
                                  <CheckCircle2 size={20} color="#3BB173" />
                                ) : form.touched.storeUsername && form.errors.storeUsername ? (
                                  <AlertCircle size={20} color="#d32f2f" />
                                ) : null}
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    </Field>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="termsAccepted"
                          checked={values.termsAccepted}
                          onChange={(e) => setFieldValue("termsAccepted", e.target.checked)}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          ฉันยอมรับ <Box component="span" sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline" }}>เงื่อนไขการใช้บริการ</Box> และ <Box component="span" sx={{ color: "primary.main", cursor: "pointer", textDecoration: "underline" }}>นโยบายความเป็นส่วนตัว</Box>
                        </Typography>
                      }
                    />
                    {touched.termsAccepted && errors.termsAccepted && (
                      <Typography variant="caption" color="error" display="block" sx={{ ml: 4 }}>
                        {errors.termsAccepted}
                      </Typography>
                    )}
                  </Grid2>

                  <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      fullWidth
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
                      สร้างบัญชีของฉัน
                    </LoadingButton>
                  </Grid2>
                </Grid2>
              </Form>
            )}
          </Formik>
        </Box>
      </Card>
    </Box>
  );
};

export default AuthRegisterForm;
