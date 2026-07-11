"use client";

import React, { useEffect, useState } from "react";
import { Grid2, TextField, Button, Box, alpha, MenuItem } from "@mui/material";
import { Formik, Field, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import FormSection from "../../shared/FormSection";
import { useRouter } from "next/navigation";
import { Category, Items, Unit } from "@/interfaces/Product";

export interface ProductFormData {
    itemsId?: string;
    itemsName: string;
    categoryId: string;
    itemsSKU: string;
    itemsDescription: string;
    itemsImage: string;
    itemsPrice: number;
    itemsDiscountPrice: string;
    itemsStock: number;
    itemsBrand: string;
    unitName: string;
}

interface ProductFormProps {
    initialData?: Items;
    isEdit?: boolean;
}

const ProductFormSchema = Yup.object({
    itemsName: Yup.string().required("ชื่อสินค้าจำเป็นต้องกรอก"),
    categoryId: Yup.string().nullable(),
    itemsSKU: Yup.string().nullable(),
    itemsDescription: Yup.string().nullable(),
    itemsImage: Yup.string().nullable(),
    itemsPrice: Yup.number().required("ราคาจำเป็นต้องกรอก").min(0, "ราคาต้องไม่น้อยกว่า 0"),
    itemsDiscountPrice: Yup.number().nullable().min(0, "ราคาพิเศษต้องไม่น้อยกว่า 0"),
    itemsStock: Yup.number().nullable().min(0, "จำนวนในสต็อกต้องไม่น้อยกว่า 0"),
    itemsBrand: Yup.string().nullable(),
    unitName: Yup.string().required("หน่วยนับจำเป็นต้องกรอก"),
});

const defaultFormData: ProductFormData = {
    itemsName: "",
    categoryId: "",
    itemsSKU: "",
    itemsDescription: "",
    itemsImage: "",
    itemsPrice: 0,
    itemsDiscountPrice: "",
    itemsStock: 0,
    itemsBrand: "",
    unitName: "ชิ้น",
};

const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [uploading, setUploading] = useState(false);
    const [imagePublicId, setImagePublicId] = useState<string>('');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch("/api/inventory/product/category");
                if (res.ok) {
                    const data: Category[] = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const res = await fetch("/api/units");
                if (res.ok) {
                    const data: Unit[] = await res.json();
                    setUnits(data);
                }
            } catch (error) {
                console.error("Error fetching units:", error);
            }
        };
        fetchUnits();
    }, []);

    useEffect(() => {
        if (initialData?.itemsImage) {
            setImagePreview(initialData.itemsImage);
        }
    }, [initialData]);

    const getInitialValues = (): ProductFormData => {
        if (initialData) {
            return {
                itemsId: initialData.itemsId,
                itemsName: initialData.itemsName || "",
                categoryId: initialData.categoryId || "",
                itemsSKU: initialData.itemsSKU || "",
                itemsDescription: initialData.itemsDescription || "",
                itemsImage: initialData.itemsImage || "",
                itemsPrice: initialData.aboutItems?.itemsPrice || 0,
                itemsDiscountPrice: initialData.aboutItems?.itemsDiscountPrice != null ? String(initialData.aboutItems.itemsDiscountPrice) : "",
                itemsStock: initialData.aboutItems?.itemsStock || 0,
                itemsBrand: initialData.aboutItems?.itemsBrand || "",
                unitName: initialData.aboutItems?.unitName || "ชิ้น",
            };
        }
        return { ...defaultFormData };
    };

    const handleSubmit = async (values: ProductFormData, { setSubmitting }: FormikHelpers<ProductFormData>) => {
        try {
            const payload = {
                itemsName: values.itemsName,
                categoryId: values.categoryId || null,
                itemsSKU: values.itemsSKU || null,
                itemsDescription: values.itemsDescription || null,
                itemsImage: values.itemsImage || null,
                itemsPrice: Number(values.itemsPrice) || 0,
                itemsDiscountPrice: values.itemsDiscountPrice ? Number(values.itemsDiscountPrice) : null,
                itemsStock: Number(values.itemsStock) || 0,
                itemsBrand: values.itemsBrand || null,
                unitName: values.unitName || "ชิ้น",
            };

            const url = isEdit ? `/api/inventory/product/${initialData?.itemsId}` : "/api/inventory/product";

            const response = await fetch(url, {
                method: isEdit ? "PATCH" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                router.push("/protected/product");
            } else {
                const error = await response.json();
                console.error("Error saving product:", error);
            }
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Formik<ProductFormData>
            initialValues={getInitialValues()}
            validationSchema={ProductFormSchema}
            enableReinitialize
            onSubmit={handleSubmit}
        >
            {({ touched, errors, isSubmitting, values, setFieldValue }) => {
                const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploading(true);
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('publicId', imagePublicId);

                        const res = await fetch('/api/inventory/product/upload-image', {
                            method: 'POST',
                            body: formData,
                        });

                        if (res.ok) {
                            const data = await res.json();
                            setFieldValue('itemsImage', data.url);
                            setImagePublicId(data.publicId);
                            setImagePreview(data.url);
                        } else {
                            console.error('Upload failed');
                        }
                    } catch (error) {
                        console.error('Upload error:', error);
                    } finally {
                        setUploading(false);
                    }
                };

                return (
                <Form>
                    <FormSection title="ข้อมูลสินค้า">
                        <Grid2 container spacing={2} mt={1}>
                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Field
                                    name="itemsName"
                                    as={TextField}
                                    label="ชื่อสินค้า"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    required
                                    error={touched.itemsName && Boolean(errors.itemsName)}
                                    helperText={touched.itemsName && errors.itemsName}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Field
                                    name="categoryId"
                                    as={TextField}
                                    select
                                    label="หมวดหมู่"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.categoryId && Boolean(errors.categoryId)}
                                    helperText={touched.categoryId && errors.categoryId}
                                >
                                    <MenuItem value="">ไม่ระบุหมวดหมู่</MenuItem>
                                    {categories.map((cat) => (
                                        <MenuItem key={cat.categoryId} value={cat.categoryId}>
                                            {cat.categoryName}
                                        </MenuItem>
                                    ))}
                                </Field>
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Field
                                    name="itemsSKU"
                                    as={TextField}
                                    label="SKU"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.itemsSKU && Boolean(errors.itemsSKU)}
                                    helperText={touched.itemsSKU && errors.itemsSKU}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Field
                                    name="itemsBrand"
                                    as={TextField}
                                    label="ยี่ห้อ / แบรนด์"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.itemsBrand && Boolean(errors.itemsBrand)}
                                    helperText={touched.itemsBrand && errors.itemsBrand}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <Field
                                    name="itemsPrice"
                                    as={TextField}
                                    label="ราคา (บาท)"
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    required
                                    error={touched.itemsPrice && Boolean(errors.itemsPrice)}
                                    helperText={touched.itemsPrice && errors.itemsPrice}
                                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <Field
                                    name="itemsDiscountPrice"
                                    as={TextField}
                                    label="ราคาพิเศษ (บาท)"
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.itemsDiscountPrice && Boolean(errors.itemsDiscountPrice)}
                                    helperText={touched.itemsDiscountPrice && errors.itemsDiscountPrice}
                                    slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 4 }}>
                                <Field
                                    name="itemsStock"
                                    as={TextField}
                                    label="จำนวนในสต็อก"
                                    type="number"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    error={touched.itemsStock && Boolean(errors.itemsStock)}
                                    helperText={touched.itemsStock && errors.itemsStock}
                                    slotProps={{ htmlInput: { min: 0, step: 1 } }}
                                />
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <Field
                                    name="unitName"
                                    as={TextField}
                                    select
                                    label="หน่วยนับ"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    required
                                    error={touched.unitName && Boolean(errors.unitName)}
                                    helperText={touched.unitName && errors.unitName}
                                >
                                    {units.map((unit) => (
                                        <MenuItem key={unit.unitId} value={unit.unitName}>
                                            {unit.unitName}
                                        </MenuItem>
                                    ))}
                                </Field>
                            </Grid2>

                            <Grid2 size={{ xs: 12, md: 6 }}>
                                <input
                                    accept="image/*"
                                    type="file"
                                    id="product-image-upload"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="product-image-upload">
                                    <Button
                                        variant="outlined"
                                        component="span"
                                        disabled={uploading}
                                        sx={{ mb: 1 }}
                                    >
                                        {uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปภาพ'}
                                    </Button>
                                </label>
                                {(imagePreview || values.itemsImage) && (
                                    <Box mt={1}>
                                        <img
                                            src={imagePreview || values.itemsImage}
                                            alt="Product preview"
                                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5eaef' }}
                                        />
                                    </Box>
                                )}
                            </Grid2>

                            <Grid2 size={12}>
                                <Field
                                    name="itemsDescription"
                                    as={TextField}
                                    label="รายละเอียดสินค้า"
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    error={touched.itemsDescription && Boolean(errors.itemsDescription)}
                                    helperText={touched.itemsDescription && errors.itemsDescription}
                                />
                            </Grid2>
                        </Grid2>
                    </FormSection>

                    <Box mt={3} display="flex" justifyContent="flex-end" gap={1}>
                        <Button
                            variant="outlined"
                            onClick={() => router.push("/protected/product")}
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

export default ProductForm;
