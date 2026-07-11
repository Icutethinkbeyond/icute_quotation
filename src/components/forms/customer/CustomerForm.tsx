"use client";

import React from "react";
import { Grid2, TextField, Button, Box, Paper, Typography, alpha, MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import FormSection from "../../shared/FormSection";
import { useRouter } from "next/navigation";
import { Customer, CustomerType } from "@/interfaces/Customer";

export interface CustomerFormData {
  id?: string;
  companyId?: string;
  customerType: CustomerType;
  name: string;
  taxId?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  note?: string;
  branch?: string;
  registrationDate?: string;
  businessType?: string;
  capital?: number;
  directorName?: string;
  firstName?: string;
  lastName?: string;
  nationalId?: string;
  dateOfBirth?: string;
  occupation?: string;
}

interface CustomerFormProps {
  initialData?: CustomerFormData;
  isEdit?: boolean;
  companyId?: string;
}

const CustomerFormSchema = Yup.object({
  customerType: Yup.mixed<CustomerType>().oneOf(Object.values(CustomerType)).required("ประเภทลูกค้าจำเป็นต้องเลือก"),
  name: Yup.string().required("ชื่อลูกค้าจำเป็นต้องกรอก"),
  taxId: Yup.string().nullable(),
  phone: Yup.string().nullable(),
  email: Yup.string().email("รูปแบบอีเมลไม่ถูกต้อง").nullable(),
  address: Yup.string().nullable(),
  website: Yup.string().url("รูปแบบเว็บไซต์ไม่ถูกต้อง").nullable(),
  branch: Yup.string().nullable(),
  registrationDate: Yup.string().nullable(),
  businessType: Yup.string().nullable(),
  capital: Yup.number().nullable(),
  directorName: Yup.string().nullable(),
  firstName: Yup.string().nullable(),
  lastName: Yup.string().nullable(),
  nationalId: Yup.string().nullable(),
  dateOfBirth: Yup.string().nullable(),
  occupation: Yup.string().nullable(),
});

const defaultFormData: CustomerFormData = {
  customerType: CustomerType.CORPORATION,
  name: "",
  taxId: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  note: "",
  branch: "",
  registrationDate: "",
  businessType: "",
  capital: 0,
  directorName: "",
  firstName: "",
  lastName: "",
  nationalId: "",
  dateOfBirth: "",
  occupation: "",
};

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, isEdit = false, companyId }) => {
  const router = useRouter();

  const handleSubmit = async (values: CustomerFormData, { setSubmitting }: FormikHelpers<CustomerFormData>) => {
    try {
      const payload = {
        ...values,
        companyId: values.companyId || companyId,
      };

      const url = isEdit ? `/api/customer/${initialData?.id}` : '/api/customer';

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push('/protected/customer');
      } else {
        const error = await response.json();
        console.error("Error saving customer:", error);
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik<CustomerFormData>
      initialValues={initialData || { ...defaultFormData, companyId }}
      validationSchema={CustomerFormSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ touched, errors, isSubmitting, values, handleChange, setFieldValue }) => {
        const handleCustomerTypeChange = (e: any) => {
          handleChange(e);
          const newType = e.target.value as CustomerType;
          if (newType === CustomerType.CORPORATION) {
            setFieldValue("firstName", "");
            setFieldValue("lastName", "");
            setFieldValue("nationalId", "");
            setFieldValue("dateOfBirth", "");
            setFieldValue("occupation", "");
          } else {
            setFieldValue("name", "");
            setFieldValue("taxId", "");
            setFieldValue("branch", "");
            setFieldValue("businessType", "");
            setFieldValue("registrationDate", "");
            setFieldValue("capital", 0);
            setFieldValue("directorName", "");
          }
        };

        return (
        <Form>
          <FormSection title="ข้อมูลลูกค้า">
            <Grid2 container spacing={2} mt={1}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" error={!!(touched.customerType && errors.customerType)}>
                  <InputLabel id="customer-type-label">ประเภทลูกค้า</InputLabel>
                  <Select
                    labelId="customer-type-label"
                    label="ประเภทลูกค้า"
                    value={values.customerType}
                    onChange={(e) => {
                      handleCustomerTypeChange(e);
                    }}
                  >
                    <MenuItem value={CustomerType.CORPORATION}>ลูกค้านิติบุคคล (Corporation)</MenuItem>
                    <MenuItem value={CustomerType.INDIVIDUAL}>ลูกค้าบุคคลธรรมดา (Individual)</MenuItem>
                  </Select>
                </FormControl>
              </Grid2>

              {values.customerType === CustomerType.CORPORATION ? (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="name"
                    as={TextField}
                    label="ชื่อบริษัท/ลูกค้า"
                    variant="outlined"
                    size="small"
                    fullWidth
                    required
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                </Grid2>
              ) : (
                <>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Field
                      name="firstName"
                      as={TextField}
                      label="ชื่อ"
                      variant="outlined"
                      size="small"
                      fullWidth
                      required
                      error={touched.firstName && Boolean(errors.firstName)}
                      helperText={touched.firstName && errors.firstName}
                    />
                  </Grid2>
                  <Grid2 size={{ xs: 12, md: 6 }}>
                    <Field
                      name="lastName"
                      as={TextField}
                      label="นามสกุล"
                      variant="outlined"
                      size="small"
                      fullWidth
                      required
                      error={touched.lastName && Boolean(errors.lastName)}
                      helperText={touched.lastName && errors.lastName}
                    />
                  </Grid2>
                </>
              )}

              {values.customerType === CustomerType.CORPORATION ? (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="taxId"
                    as={TextField}
                    label="เลขประจำตัวผู้เสียภาษี"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.taxId && Boolean(errors.taxId)}
                    helperText={touched.taxId && errors.taxId}
                  />
                </Grid2>
              ) : (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="nationalId"
                    as={TextField}
                    label="เลขบัตรประชาชน"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.nationalId && Boolean(errors.nationalId)}
                    helperText={touched.nationalId && errors.nationalId}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.CORPORATION && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="branch"
                    as={TextField}
                    label="สาขา"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.branch && Boolean(errors.branch)}
                    helperText={touched.branch && errors.branch}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.INDIVIDUAL && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="dateOfBirth"
                    as={TextField}
                    label="วันเกิด"
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                    helperText={touched.dateOfBirth && errors.dateOfBirth}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.INDIVIDUAL && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="occupation"
                    as={TextField}
                    label="อาชีพ"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.occupation && Boolean(errors.occupation)}
                    helperText={touched.occupation && errors.occupation}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.CORPORATION && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="businessType"
                    as={TextField}
                    label="ธุรกิจ"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.businessType && Boolean(errors.businessType)}
                    helperText={touched.businessType && errors.businessType}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.CORPORATION && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="registrationDate"
                    as={TextField}
                    label="วันที่จดทะเบียน"
                    type="date"
                    variant="outlined"
                    size="small"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={touched.registrationDate && Boolean(errors.registrationDate)}
                    helperText={touched.registrationDate && errors.registrationDate}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.CORPORATION && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="capital"
                    as={TextField}
                    label="ทุนจดทะเบียน"
                    type="number"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.capital && Boolean(errors.capital)}
                    helperText={touched.capital && errors.capital}
                  />
                </Grid2>
              )}

              {values.customerType === CustomerType.CORPORATION && (
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <Field
                    name="directorName"
                    as={TextField}
                    label="อำนาจการให้บริการ"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={touched.directorName && Boolean(errors.directorName)}
                    helperText={touched.directorName && errors.directorName}
                  />
                </Grid2>
              )}

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Field
                  name="phone"
                  as={TextField}
                  label="เบอร์โทรศัพท์"
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                />
              </Grid2>

              <Grid2 size={{ xs: 12, md: 6 }}>
                <Field
                  name="email"
                  as={TextField}
                  label="อีเมล"
                  variant="outlined"
                  size="small"
                  fullWidth
                  type="email"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Grid2>

              <Grid2 size={12}>
                <Field
                  name="address"
                  as={TextField}
                  label="ที่อยู่"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
              </Grid2>

              <Grid2 size={12}>
                <Field
                  name="website"
                  as={TextField}
                  label="เว็บไซต์"
                  variant="outlined"
                  size="small"
                  fullWidth
                  error={touched.website && Boolean(errors.website)}
                  helperText={touched.website && errors.website}
                />
              </Grid2>

              <Grid2 size={12}>
                <Field
                  name="note"
                  as={TextField}
                  label="หมายเหตุ"
                  variant="outlined"
                  size="small"
                  fullWidth
                  multiline
                  rows={3}
                  error={touched.note && Boolean(errors.note)}
                  helperText={touched.note && errors.note}
                />
              </Grid2>
            </Grid2>
          </FormSection>

          <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="outlined"
              onClick={() => router.push('/protected/customer')}
              sx={{
                borderColor: "#e5eaef",
                color: "#5A6A85",
                textTransform: "none",
                "&:hover": {
                  borderColor: "#03c9d7",
                  color: "#03c9d7",
                  backgroundColor: alpha("#03c9d7", 0.04),
                },
              }}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                backgroundColor: "#03c9d7",
                "&:hover": { backgroundColor: "#05b2bd" },
                textTransform: "none",
                fontWeight: 600,
                px: 4,
              }}
            >
              {isSubmitting ? "กำลังบันทึก..." : (isEdit ? "บันทึกการแก้ไข" : "บันทึก")}
            </Button>
          </Box>
        </Form>
        );
      }}
    </Formik>
  );
};

export default CustomerForm;
