"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  CircularProgress,
  IconButton,
  Typography,
  Avatar,
  FormHelperText,
  Stack,
} from "@mui/material";
import { Save, Building2, Upload, Trash2 } from "lucide-react";
import { Field, Form, Formik, FormikHelpers, FieldProps } from "formik";
import * as Yup from "yup";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import FormSection from "@/components/shared/FormSection";
import { Company, initialCompany } from "@/interfaces/Company";
import { useNotifyContext } from "@/contexts/NotifyContext";

const validationSchema = Yup.object().shape({
  companyName: Yup.string().required("กรุณากรอกชื่อบริษัท"),
  companyEmail: Yup.string().email("อีเมลไม่ถูกต้อง").nullable(),
  companyWebsite: Yup.string().nullable(),
});

export default function CompanySettingsForm() {
  const { setNotify } = useNotifyContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [initialValues, setInitialValues] = useState<Company>(initialCompany);
  const companyIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/companies/me");
        if (res.ok) {
          const data: Company & { companyImage?: string | null; companyImagePublicId?: string | null } =
            await res.json();
          companyIdRef.current = data.companyId || null;
          setInitialValues({
            ...initialCompany,
            ...data,
            companyRegistrationDate: data.companyRegistrationDate
              ? new Date(data.companyRegistrationDate).toISOString().split("T")[0]
              : "",
          });
        } else if (res.status === 404) {
          setNotify({
            open: true,
            message: "ยังไม่มีข้อมูลบริษัทในบัญชีนี้",
            color: "warning",
          });
        }
      } catch (error) {
        console.error("Failed to fetch company", error);
        setNotify({
          open: true,
          message: "ไม่สามารถโหลดข้อมูลบริษัทได้",
          color: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [setNotify]);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploading(true);
    try {
      if (!file.type.startsWith("image/")) {
        setImageError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageError("ขนาดไฟล์ไม่ควรเกิน 5MB");
        return;
      }
      const form = new FormData();
      form.append("file", file);
      form.append("publicId", initialValues.companyImagePublicId || "");
      if (companyIdRef.current) {
        form.append("companyId", companyIdRef.current);
      }
      const res = await fetch("/api/companies/upload-image", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setFieldValue("companyImage", result.url);
      setFieldValue("companyImagePublicId", result.publicId);
    } catch (error) {
      console.error("Image upload failed", error);
      setImageError("ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue("companyImage", "");
    setFieldValue("companyImagePublicId", "");
  };

  const handleSubmit = async (
    values: Company,
    { setSubmitting }: FormikHelpers<Company>
  ) => {
    setSubmitting(true);
    setSaving(true);
    try {
      const payload = {
        ...values,
        companyRegistrationDate: values.companyRegistrationDate || null,
      };
      const res = await fetch("/api/companies/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setNotify({
          open: true,
          message: "บันทึกข้อมูลบริษัทสำเร็จ",
          color: "success",
        });
      } else {
        const err = await res.json().catch(() => ({}));
        setNotify({
          open: true,
          message: err.error || "บันทึกข้อมูลไม่สำเร็จ",
          color: "error",
        });
      }
    } catch (error) {
      console.error("Error saving company", error);
      setNotify({
        open: true,
        message: "เกิดข้อผิดพลาดในการเชื่อมต่อ",
        color: "error",
      });
    } finally {
      setSubmitting(false);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageContainer title="ข้อมูลบริษัท" description="จัดการข้อมูลบริษัทของคุณ">
      <PageHeader title="ข้อมูลบริษัท" />
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ values, errors, touched, isSubmitting, setFieldValue }) => (
          <Form>
            <Box mt={3}>
              <Card elevation={0} sx={{ border: "1px solid #e5eaef" }}>
                <CardContent sx={{ p: 4 }}>
                  <FormSection title="ข้อมูลบริษัท">
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Field name="companyName">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="ชื่อบริษัท"
                              variant="outlined"
                              size="small"
                              error={touched.companyName && !!errors.companyName}
                              helperText={touched.companyName && errors.companyName}
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="companyPhoneNumber">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="เบอร์โทร"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="companyTaxId">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="เลขที่เสียภาษี"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="branch">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="สาขา"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field name="companyRegistrationDate">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="วันที่จดทะเบียน"
                              type="date"
                              variant="outlined"
                              size="small"
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <Field name="companyAddress">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="ที่อยู่"
                              multiline
                              rows={3}
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="companyEmail">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="อีเมล"
                              variant="outlined"
                              size="small"
                              error={touched.companyEmail && !!errors.companyEmail}
                              helperText={touched.companyEmail && errors.companyEmail}
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="companyWebsite">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="เว็บไซต์"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Field name="companyBusinessType">
                          {({ field }: FieldProps) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="ประเภทธุรกิจ"
                              variant="outlined"
                              size="small"
                            />
                          )}
                        </Field>
                      </Grid>
                      <Grid item xs={12}>
                        <input
                          accept="image/*"
                          style={{ display: "none" }}
                          id="company-settings-image"
                          type="file"
                          onChange={(e) => handleImageChange(e, setFieldValue)}
                        />
                        <label htmlFor="company-settings-image">
                          <Button
                            variant="outlined"
                            component="span"
                            startIcon={
                              uploading ? (
                                <CircularProgress size={20} />
                              ) : (
                                <Upload size={18} />
                              )
                            }
                            disabled={uploading || saving}
                            sx={{
                              mb: 2,
                              borderStyle: "dashed",
                              borderColor: "primary.main",
                              color: "primary.main",
                            }}
                          >
                            {uploading ? "กำลังอัปโหลด..." : "เลือกรูปภาพบริษัท"}
                          </Button>
                        </label>
                        {imageError && (
                          <FormHelperText error>{imageError}</FormHelperText>
                        )}
                        {values.companyImage && (
                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <Avatar
                              variant="rounded"
                              src={values.companyImage}
                              sx={{ width: 96, height: 96 }}
                            >
                              <Building2 />
                            </Avatar>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveImage(setFieldValue)}
                              disabled={uploading || saving}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Stack>
                        )}
                      </Grid>
                    </Grid>
                  </FormSection>
                  <Box mt={3} display="flex" justifyContent="flex-end">
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      startIcon={
                        saving ? <CircularProgress size={18} /> : <Save size={18} />
                      }
                      disabled={isSubmitting || saving}
                      sx={{
                        backgroundColor: "#03c9d7",
                        "&:hover": { backgroundColor: "#05b2bd" },
                        color: "white",
                        textTransform: "none",
                      }}
                    >
                      {saving ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Form>
        )}
      </Formik>
    </PageContainer>
  );
}
