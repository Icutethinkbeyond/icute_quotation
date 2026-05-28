"use client";

import { useState } from "react";
import {
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Typography,
  Grid2,
  Avatar,
  Box,
  Card,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Field, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { KeyRound, StoreIcon, UserPlus, ArrowRight, User } from "lucide-react";
import { authService, RegisterData } from "@/services/api-services/AuthAPI";
import { LoadingButton } from "@mui/lab";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อ-นามสกุล"),
  companyName: Yup.string().required("กรุณากรอกชื่อบริษัท/ห้างร้าน"),
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: Yup.string().required("กรุณากรอกรหัสผ่าน").min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: Yup.string()
    .required("กรุณากรอกยืนยันรหัสผ่าน")
    .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
  termsAccepted: Yup.bool().oneOf([true], "กรุณายอมรับเงื่อนไขการใช้บริการ"),
});

const initialValues = {
  name: "",
  companyName: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
};

const AuthRegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { setNotify } = useNotifyContext();

  const router = useRouter();
  const locale = useLocale();

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting, resetForm }: FormikHelpers<typeof initialValues>
  ) => {
    setSubmitting(true);

    const data: RegisterData = {
      email: values.email,
      password: values.password,
      name: values.name,
      companyName: values.companyName,
    };

    const result = await authService.register(data);
    
    if (result.success) {
      setNotify({
        open: true,
        message: "สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
        color: "success",
      });
      resetForm();
      setTimeout(() => {
        router.push(`/${locale}/auth/sign-in`);
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
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: { xs: 2, md: 4 },
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
            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
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
            iCute Account
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
            เริ่มต้นจัดการบัญชีของคุณ<br />ให้ง่ายและเป็นระบบมากขึ้น
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
              onClick={() => router.push(`/${locale}/auth/sign-in`)}
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
            กรอกข้อมูลสั้นๆ เพื่อเริ่มต้นใช้งานระบบบัญชี
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
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
                  {/* Section 1: User Info */}
                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                        <User size={16} color="#03c9d7" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        ข้อมูลผู้ใช้งาน
                      </Typography>
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Field name="name">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          label="ชื่อ-นามสกุล"
                          fullWidth
                          variant="outlined"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      )}
                    </Field>
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

                  {/* Section 2: Password */}
                  <Grid2 size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "warning.light", width: 32, height: 32 }}>
                        <KeyRound size={16} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        ตั้งรหัสผ่าน
                      </Typography>
                    </Box>
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

                  {/* Section 3: Company Info */}
                  <Grid2 size={{ xs: 12 }} sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "secondary.light", width: 32, height: 32 }}>
                        <StoreIcon size={16} />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        ข้อมูลบริษัท/ธุรกิจ
                      </Typography>
                    </Box>
                  </Grid2>

                  <Grid2 size={{ xs: 12 }}>
                    <Field name="companyName">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          label="ชื่อบริษัท หรือ ชื่อร้านค้า"
                          fullWidth
                          error={touched.companyName && Boolean(errors.companyName)}
                          helperText={touched.companyName && errors.companyName}
                          placeholder="เช่น บริษัท ไอคิวท์ จำกัด"
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
                      ลงทะเบียนใช้งาน
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
