"use client";

import React, { FC, useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  TextField,
  Grid2,
  Avatar,
  Stack,
  CircularProgress,
  InputAdornment,
  Divider,
  Paper,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { 
  User, 
  Phone, 
  Mail, 
  Clock, 
  Briefcase, 
  StickyNote, 
  Save, 
  CalendarOff,
} from "lucide-react";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { DAY_LABEL } from "@/interfaces/Store";
import { LoadingButton } from "@mui/lab";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { useSession } from "next-auth/react";
import DragDropImage from "@/components/shared/DragDropImage";
import dayjs from "dayjs";
import { employeeService } from "@/services/ApiServices/EmployeeAPI";
import { 
  Employee, 
  initialEmployee, 
  LEAVE_TYPE_MAP, 
} from "@/interfaces/Employee";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("กรุณากรอกชื่อ"),
  surname: Yup.string().required("กรุณากรอกนามสกุล"),
  email: Yup.string().email("อีเมลไม่ถูกต้อง").required("กรุณากรอกอีเมล"),
  phone: Yup.string().required("กรุณากรอกเบอร์โทรศัพท์"),
});

export default function ProfileForm() {
  const theme = useTheme();
  const { data: session } = useSession();
  const { setNotify } = useNotifyContext();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [employee, setEmployee] = useState<Employee>(initialEmployee);

  const handleFormSubmit = async (values: Employee, { setSubmitting }: FormikHelpers<Employee>) => {
    setSubmitting(true);
    let result = await employeeService.updateEmployee(values);

    if (result.success) {
      setNotify({ open: true, message: "บันทึกข้อมูลส่วนตัวสำเร็จ", color: "success" });
    } else {
      setNotify({ open: true, message: result.message, color: "error" });
    }
    setSubmitting(false);
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      if (session?.user?.id) {
        setIsLoading(true);
        const res = await employeeService.getEmployee(session.user.id);
        if (res.success) {
          setEmployee(res.data);
        }
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [session?.user?.id]);

  if (isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1000, mx: "auto", pb: 6 }}>
      <Formik<Employee>
        initialValues={employee}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ values, setFieldValue, errors, touched, isSubmitting }) => (
          <Form>
            <Grid2 container spacing={4}>
              {/* Left Column: Media */}
              <Grid2 size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  <Card sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", textAlign: "center" }}>
                      <Typography variant="subtitle2" fontWeight={700}>รูปโปรไฟล์</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Field name="imageUrl" component={DragDropImage} setFieldValue={setFieldValue} aspectRatio={1} />
                    </Box>
                  </Card>

                  <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
                      <Typography variant="subtitle2" fontWeight={700}>ตำแหน่งและสถานะ</Typography>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">ตำแหน่ง</Typography>
                          <Typography variant="body1" fontWeight={600}>{values.position || "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">สิทธิ์การใช้งาน</Typography>
                          <Typography variant="body1" fontWeight={600}>{session?.user?.roleName || "-"}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">สถานะปัจจุบัน</Typography>
                          <Chip 
                            label={values.isActive ? "พร้อมปฏิบัติงาน" : "ระงับการใช้งาน"} 
                            color={values.isActive ? "success" : "error"}
                            size="small"
                            sx={{ fontWeight: 600, ml: 1 }}
                          />
                        </Box>
                      </Stack>
                    </Box>
                  </Card>
                </Stack>
              </Grid2>

              {/* Right Column: Main Form */}
              <Grid2 size={{ xs: 12, md: 8 }}>
                <Stack spacing={4}>
                  {/* Basic & Contact Info */}
                  <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}><User size={16} /></Avatar>
                        <Typography variant="h6" fontWeight={700}>ข้อมูลส่วนตัวและติดต่อ</Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Grid2 container spacing={2.5}>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="name">
                            {({ field }: FieldProps) => (
                              <TextField {...field} fullWidth label="ชื่อ" error={touched.name && !!errors.name} helperText={touched.name && errors.name} />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="surname">
                            {({ field }: FieldProps) => (
                              <TextField {...field} fullWidth label="นามสกุล" error={touched.surname && !!errors.surname} helperText={touched.surname && errors.surname} />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="nickname">
                            {({ field }: FieldProps) => <TextField {...field} fullWidth label="ชื่อเล่น" />}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <TextField 
                            fullWidth 
                            label="วันที่เริ่มงาน" 
                            disabled 
                            value={values.startDate ? dayjs(values.startDate).format("D MMM YYYY") : "-"}
                          />
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="phone">
                            {({ field }: FieldProps) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                label="เบอร์โทรศัพท์" 
                                error={touched.phone && !!errors.phone} 
                                helperText={touched.phone && errors.phone}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} /></InputAdornment> }}
                              />
                            )}
                          </Field>
                        </Grid2>
                        <Grid2 size={{ xs: 12, sm: 6 }}>
                          <Field name="email">
                            {({ field }: FieldProps) => (
                              <TextField 
                                {...field} 
                                fullWidth 
                                label="อีเมล" 
                                error={touched.email && !!errors.email} 
                                helperText={touched.email && errors.email}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} /></InputAdornment> }}
                              />
                            )}
                          </Field>
                        </Grid2>
                      </Grid2>
                    </Box>
                  </Card>

                  {/* Schedule (View only) */}
                  <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}><Clock size={16} /></Avatar>
                        <Typography variant="h6" fontWeight={700}>ตารางเวลาทำงาน (ดูอย่างเดียว)</Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 0 }}>
                      {values.workingDays.map((day, dayIndex) => (
                        <Box 
                          key={day.dayOfWeek} 
                          sx={{ 
                            p: 2, 
                            borderBottom: dayIndex !== 6 ? "1px solid" : "none", 
                            borderColor: "divider",
                            bgcolor: day.isWorking ? "transparent" : "grey.25"
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Typography sx={{ minWidth: 100, fontWeight: 700 }}>{DAY_LABEL[day.dayOfWeek]}</Typography>
                            {day.isWorking ? (
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {day.timeSlots.map((slot, slotIndex) => (
                                  <Chip 
                                    key={slotIndex} 
                                    label={`${slot.startTime} - ${slot.endTime}`} 
                                    size="small" 
                                    variant="outlined" 
                                  />
                                ))}
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.disabled" fontStyle="italic">หยุดงาน</Typography>
                            )}
                          </Stack>
                        </Box>
                      ))}
                    </Box>
                  </Card>

                  {/* Leaves / Blocked Time (View only) */}
                  <Card sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider" }}>
                    <Box sx={{ p: 2.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 32, height: 32 }}><CalendarOff size={16} /></Avatar>
                        <Typography variant="h6" fontWeight={700}>ช่วงไม่ว่าง / วันลา (ดูอย่างเดียว)</Typography>
                      </Stack>
                    </Box>
                    <Box sx={{ p: 3 }}>
                      <Stack spacing={1.5}>
                        {values.leaves.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1 }}>ยังไม่มีบันทึกข้อมูลการลา</Typography>
                        ) : (
                          values.leaves.map((leave, idx) => (
                            <Paper key={leave.id || idx} variant="outlined" sx={{ p: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 2 }}>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
                                  <Chip label={LEAVE_TYPE_MAP[leave.leaveType]} size="small" variant="outlined" sx={{ fontWeight: 700, height: 20, fontSize: "0.65rem" }} />
                                  <Typography variant="caption" fontWeight={700}>
                                    {dayjs(leave.startDate).format("D MMM YYYY")} - {dayjs(leave.endDate).format("D MMM YYYY")}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2">{leave.note || "-"}</Typography>
                              </Box>
                            </Paper>
                          ))
                        )}
                      </Stack>
                    </Box>
                  </Card>

                  {/* Actions */}
                  <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
                    <LoadingButton
                      variant="contained"
                      type="submit"
                      size="large"
                      loading={isSubmitting}
                      startIcon={<Save size={20} />}
                      sx={{ borderRadius: 3, px: 6, py: 1.5, boxShadow: theme.shadows[4] }}
                    >
                      บันทึกการแก้ไข
                    </LoadingButton>
                  </Box>
                </Stack>
              </Grid2>
            </Grid2>
          </Form>
        )}
      </Formik>
    </Box>
  );
}
