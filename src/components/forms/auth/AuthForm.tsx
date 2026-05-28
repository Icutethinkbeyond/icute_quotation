import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Grid2,
  InputAdornment,
  IconButton,
  TextField,
  Box,
  Card,
  Avatar,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { initialLogin, Login } from "@/interfaces/User";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useLocale } from "next-intl";
import { LogIn, KeyRound, UserCircle } from "lucide-react";
import { IconBrandGoogle, IconBrandFacebook } from "@tabler/icons-react";

const validationSchema = Yup.object().shape({
  email: Yup.string().required("กรุณากรอกอีเมล").email("รูปแบบอีเมลไม่ถูกต้อง"),
  password: Yup.string().required("กรุณากรอกรหัสผ่าน"),
});

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[] | string;
  subtext?: JSX.Element | JSX.Element[];
  successPath?: string;
}

const AuthForm: React.FC<loginType> = ({ title, subtext }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credential] = useState<Login>(initialLogin);
  const [disableLogin, setDisableLogin] = useState<boolean>(false);

  const localActive = useLocale();
  const router = useRouter();
  const { setNotify, notify } = useNotifyContext();

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const onLoginPress = (value: Login, { validateForm }: any) => {
    validateForm();
    onLogin(value);
  };

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    await signIn(provider, { callbackUrl: `/${localActive}/protected/dashboard` });
  };

  const onLogin = async (loginCredential: Login) => {
    setDisableLogin(true);
    const { email, password } = loginCredential;

    if (email && password) {
      const result = await signIn("credentials", {
        email: email,
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setNotify({
          ...notify,
          open: true,
          color: "error",
          message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        });
        setDisableLogin(false);
      } else {
        router.push(`/${localActive}/protected/dashboard`);
      }
    }
  };

  useEffect(() => {
    return () => {
      setDisableLogin(false);
    };
  }, []);

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
          minHeight: "650px",
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
            <LogIn size={40} color="white" />
          </Box>
          <Typography variant="h3" fontWeight="800" mb={2}>
            iCute Account
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4 }}>
            ยินดีต้อนรับกลับมา!<br />เข้าสู่ระบบเพื่อจัดการบัญชีของคุณ
          </Typography>
          
          <Box sx={{ mt: "auto", width: "100%" }}>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", mb: 3 }} />
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              ยังไม่มีบัญชี? 
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
              onClick={() => router.push(`/${localActive}/auth/sign-up`)}
            >
              สมัครสมาชิกที่นี่
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
            เข้าสู่ระบบ
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            กรุณาระบุอีเมลและรหัสผ่านเพื่อเข้าใช้งานระบบ
          </Typography>

          {/* Social Logins */}
          <Grid2 container spacing={2} sx={{ mb: 4 }}>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconBrandGoogle size={20} />}
                onClick={() => handleSocialLogin("google")}
                sx={{
                  borderRadius: "12px",
                  py: 1,
                  color: "text.primary",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "grey.50", borderColor: "grey.400" },
                }}
              >
                Google
              </Button>
            </Grid2>
            <Grid2 size={{ xs: 12, sm: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconBrandFacebook size={20} color="#1877F2" />}
                onClick={() => handleSocialLogin("facebook")}
                sx={{
                  borderRadius: "12px",
                  py: 1,
                  color: "text.primary",
                  borderColor: "divider",
                  "&:hover": { bgcolor: "grey.50", borderColor: "grey.400" },
                }}
              >
                Facebook
              </Button>
            </Grid2>
          </Grid2>

          <Divider sx={{ mb: 4 }}>
            <Typography variant="body2" color="text.disabled">หรือใช้งานด้วยอีเมล</Typography>
          </Divider>

          {subtext}

          <Formik
            initialValues={credential}
            validationSchema={validationSchema}
            onSubmit={onLoginPress}
            enableReinitialize
          >
            {({ errors, touched, values, setFieldValue }) => (
              <Form>
                <Grid2 container spacing={3}>
                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                        <UserCircle size={16} color="#03c9d7" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight="600">
                        อีเมลผู้ใช้งาน
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

                  <Grid2 size={{ xs: 12 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Avatar sx={{ bgcolor: "primary.light", width: 32, height: 32 }}>
                          <KeyRound size={16} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight="600">
                          รหัสผ่าน
                        </Typography>
                      </Box>
                      <Button
                        variant="text"
                        size="small"
                        sx={{ textTransform: "none", fontWeight: 500 }}
                        onClick={() => router.push(`/${localActive}/auth/forgot-password`)}
                      >
                        ลืมรหัสผ่าน?
                      </Button>
                    </Box>
                    <Field name="password">
                      {({ field }: any) => (
                        <TextField
                          {...field}
                          type={showPassword ? "text" : "password"}
                          fullWidth
                          placeholder="••••••••"
                          error={touched.password && Boolean(errors.password)}
                          helperText={touched.password && errors.password}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={handleClickShowPassword} edge="end">
                                  {showPassword ? <VisibilityOff /> : <Visibility />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
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
                      loading={disableLogin}
                      sx={{
                        borderRadius: "12px",
                        py: 1.5,
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        boxShadow: "0 8px 20px rgba(24, 46, 78, 0.2)",
                      }}
                    >
                      เข้าสู่ระบบ
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

export default AuthForm;
