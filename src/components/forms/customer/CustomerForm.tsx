"use client";

import React from "react";
import { Grid2, TextField, Button, Box } from "@mui/material";
import { Formik, Field, Form, ErrorMessage, FormikHelpers } from "formik";
import * as Yup from "yup";
import FormSection from "../../shared/FormSection";
import { useRouter } from "next/navigation";


import { Customer } from "@/interfaces/Customer";

// Validation Schema
const CustomerFormSchema = Yup.object({
    contactorName: Yup.string().required("ชื่อผู้ติดต่อจำเป็นต้องกรอก"),
});

// Use Partial<Customer> or Pick<Customer> if appropriate, or redefine if strictly for form
export interface CustomerFormData {
    contactorId?: string;
    contactorName: string;
    contactorTel: string;
    contactorEmail: string;
    contactorAddress: string;
}

interface CustomerFormProps {
    initialData?: CustomerFormData;
    isEdit?: boolean;
}

const defaultFormData: CustomerFormData = {
    contactorName: "",
    contactorTel: "",
    contactorEmail: "",
    contactorAddress: "",
};

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, isEdit = false }) => {
    const router = useRouter();

    const handleSubmit = async (values: CustomerFormData, { setSubmitting }: FormikHelpers<CustomerFormData>) => {
        try {
            const url = isEdit
                ? `/api/customer/${initialData?.contactorId}`
                : '/api/customer';

            const method = isEdit ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
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
            initialValues={initialData || defaultFormData}
            validationSchema={CustomerFormSchema}
            enableReinitialize
            onSubmit={handleSubmit}
        >
            {({ touched, errors, isSubmitting }) => (
                <Form>
                    <FormSection title="ข้อมูลลูกค้า">
                        <Grid2 container spacing={2} mt={2}>
                            <Grid2 size={12}>
                                <Field
                                    name="contactorName"
                                    as={TextField}
                                    label="ชื่อผู้ติดต่อ"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    required
                                    error={touched.contactorName && Boolean(errors.contactorName)}
                                    helperText={<ErrorMessage name="contactorName" />}
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <Field
                                    name="contactorTel"
                                    as={TextField}
                                    label="เบอร์โทร"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.contactorTel && Boolean(errors.contactorTel)}
                                    helperText={<ErrorMessage name="contactorTel" />}
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <Field
                                    name="contactorEmail"
                                    as={TextField}
                                    label="อีเมล์"
                                    variant="outlined"
                                    size="small"
                                    type="email"
                                    fullWidth
                                    error={touched.contactorEmail && Boolean(errors.contactorEmail)}
                                    helperText={<ErrorMessage name="contactorEmail" />}
                                />
                            </Grid2>
                            <Grid2 size={12}>
                                <Field
                                    name="contactorAddress"
                                    as={TextField}
                                    label="ที่อยู่"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={touched.contactorAddress && Boolean(errors.contactorAddress)}
                                    helperText={<ErrorMessage name="contactorAddress" />}
                                />
                            </Grid2>
                        </Grid2>
                    </FormSection>

                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                            sx={{
                                backgroundColor: "#03c9d7",
                                "&:hover": { backgroundColor: "#05b2bd" },
                                textTransform: "none",
                            }}
                        >
                            {isSubmitting ? "กำลังบันทึก..." : (isEdit ? "บันทึกการแก้ไข" : "บันทึก")}
                        </Button>
                    </Box>
                </Form>
            )}
        </Formik>
    );
};

export default CustomerForm;
