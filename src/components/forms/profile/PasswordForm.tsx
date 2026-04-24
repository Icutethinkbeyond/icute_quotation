"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  ShieldCheck
} from "lucide-react";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useSession } from "next-auth/react";
import { employeeService } from "@/services/ApiServices/EmployeeAPI";
import { Employee } from "@/interfaces/Employee";

const validationSchema = Yup.object().shape({
  password: Yup.string()
    .required("กรุณากรอกรหัสผ่านใหม่")
    .min(6, "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"),
  confirmPassword: Yup.string()
    .required("กรุณายืนยันรหัสผ่านใหม่")
    .oneOf([Yup.ref("password")], "รหัสผ่านไม่ตรงกัน"),
});

export default function PasswordForm() {
  const theme = useTheme();
  const { data: session } = useSession();
  const { setNotify } = useNotifyContext();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleFormSubmit = async (values: any, { setSubmitting, resetForm }: FormikHelpers<any>) => {
    if (!session?.user?.id) return;

    setSubmitting(true);
    
    // First, get current employee data to avoid wiping out other fields due to the PATCH implementation
    const res = await employeeService.getEmployee(session.user.id);
    if (!res.success) {
      setNotify({ open: true, message: "ไม่สามารถดึงข้อมูลพนักงานได้", color: "error" });
      setSubmitting(false);
      return;
    }

    const currentEmployee = res.data;
    const updatedData = {
      ...currentEmployee,
      password: values.password,
      confirmPassword: values.confirmPassword,
      // Ensure we pass necessary IDs for many-to-many
      serviceIds: currentEmployee.services?.map((s: any) => s.id) || [],
    };

    let updateRes = await employeeService.updateEmployee(updatedData);

    if (updateRes.success) {
      setNotify({ open: true, message: "เปลี่ยนรหัสผ่านสำเร็จ", color: "success" });
      resetForm();
    } else {
      setNotify({ open: true, message: updateRes.message, color: "error" });
    }
    setSubmitting(false);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4 }}>
      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
              <Box sx={{ p: 3, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box 
                    sx={{ 
                      bgcolor: "primary.main", 
                      color: "white", 
                      p: 1, 
                      borderRadius: 2,
                      display: "flex"
                    }}
                  >
                    <ShieldCheck size={20} />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>เปลี่ยนรหัสผ่าน</Typography>
                    <Typography variant="body2" color="text.secondary">ตั้งค่ารหัสผ่านใหม่เพื่อความปลอดภัยของบัญชีคุณ</Typography>
                  </Box>
                </Stack>
              </Box>
              
              <Box sx={{ p: 4 }}>
                <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                  รหัสผ่านควรมีความยาวอย่างน้อย 6 ตัวอักษร และประกอบด้วยตัวอักษรและตัวเลข
                </Alert>

                <Stack spacing={3}>
                  <Field name="password">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="รหัสผ่านใหม่"
                        type={showPassword ? "text" : "password"}
                        error={touched.password && !!errors.password}
                        helperText={touched.password && errors.password as string}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={18} />
                            </InputAdornment>
                          ),
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

                  <Field name="confirmPassword">
                    {({ field }: FieldProps) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="ยืนยันรหัสผ่านใหม่"
                        type={showConfirmPassword ? "text" : "password"}
                        error={touched.confirmPassword && !!errors.confirmPassword}
                        helperText={touched.confirmPassword && errors.confirmPassword as string}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock size={18} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  </Field>

                  <Box sx={{ pt: 2 }}>
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      type="submit"
                      size="large"
                      loading={isSubmitting}
                      startIcon={<Save size={20} />}
                      sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, boxShadow: theme.shadows[4] }}
                    >
                      บันทึกรหัสผ่านใหม่
                    </LoadingButton>
                  </Box>
                </Stack>
              </Box>
            </Card>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
