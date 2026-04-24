"use client";

import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Box,
    CircularProgress,
    IconButton,
    Typography,
    Avatar,
    FormHelperText,
} from "@mui/material";
import PageContainer from "@/components/shared/PageContainer";
import PageHeader from "@/components/shared/PageHeader";
import { useRouter } from "next/navigation";
import FormSection from "@/components/shared/FormSection";
import { CompanyProfile } from "@/interfaces/Company";

interface CompanyFormProps {
    title?: string;
    onSuccess?: () => void;
    companyId?: string; // Optional: If provided, Edit Mode. If not, Create Mode.
}

interface CompanyFormData {
    companyName: string;
    companyTaxId: string;
    branch: string;
    companyAddress: string;
    companyPhoneNumber: string;
    companyEmail: string;
    companyWebsite: string;
    companyBusinessType: string;
    companyRegistrationDate: string;
    companyImage: string;
    companyImagePublicId: string;
}

export default function CompanyForm({ title = "ข้อมูลบริษัท", onSuccess, companyId }: CompanyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [data, setData] = useState<CompanyProfile | null>(null);
    const [formData, setFormData] = useState<CompanyFormData>({
        companyName: "",
        companyTaxId: "",
        branch: "",
        companyAddress: "",
        companyPhoneNumber: "",
        companyEmail: "",
        companyWebsite: "",
        companyBusinessType: "",
        companyRegistrationDate: "",
        companyImage: "",
        companyImagePublicId: "",
    });
    const [imageError, setImageError] = useState<string>("");

    useEffect(() => {
        if (companyId) {
            fetchCompanyData(companyId);
        } else {
            setLoading(false);
        }
    }, [companyId]);

    const fetchCompanyData = async (id: string) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/companies/${id}`);
            if (res.ok) {
                const data: CompanyProfile = await res.json();
                if (data) {
                    setData(data);
                    setFormData({
                        companyName: data.companyName || "",
                        companyTaxId: data.companyTaxId || "",
                        branch: data.branch || "",
                        companyAddress: data.companyAddress || "",
                        companyPhoneNumber: data.companyPhoneNumber || "",
                        companyEmail: data.companyEmail || "",
                        companyWebsite: data.companyWebsite || "",
                        companyBusinessType: data.companyBusinessType || "",
                        companyRegistrationDate: data.companyRegistrationDate
                            ? new Date(data.companyRegistrationDate).toISOString().split('T')[0]
                            : "",
                        companyImage: data.companyImage || "",
                        companyImagePublicId: data.companyImagePublicId || "",
                    });
                }
            }
        } catch (error) {
            console.error("Failed to fetch company data", error);
            alert("Failed to load company data");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError("");
        setUploading(true);

        try {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setImageError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setImageError("ขนาดไฟล์ไม่ควรเกิน 5MB");
                return;
            }

            // Upload to server
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('publicId', formData.companyImagePublicId || '');
            if (companyId) {
                uploadFormData.append('companyId', companyId);
            }

            const res = await fetch('/api/companies/upload-image', {
                method: 'POST',
                body: uploadFormData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const result = await res.json();

            setFormData((prev) => ({
                ...prev,
                companyImage: result.url,
                companyImagePublicId: result.publicId,
            }));
        } catch (error) {
            console.error("Image upload failed:", error);
            setImageError("ไม่สามารถอัปโหลดรูปภาพได้ กรุณาลองใหม่อีกครั้ง");
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setFormData((prev) => ({
            ...prev,
            companyImage: "",
            companyImagePublicId: "",
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const method = companyId ? "PUT" : "POST";
            const endpoint = companyId ? `/api/companies/${companyId}` : "/api/companies";

            const payload = {
                ...formData,
                companyRegistrationDate: formData.companyRegistrationDate || null,
            };

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                alert("บันทึกข้อมูลสำเร็จ");
                if (onSuccess) {
                    onSuccess();
                }
                router.push("/company");
            } else {
                const errorData = await res.json();
                alert(errorData.error || "บันทึกข้อมูลไม่สำเร็จ");
            }
        } catch (error) {
            console.error("Error saving data:", error);
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <PageContainer title={title} description="Manage company details">
            <PageHeader title={title} />
            <Box mt={3}>
                <Card elevation={0} sx={{ border: '1px solid #e5eaef' }}>
                    <CardContent sx={{ p: 4 }}>
                        <FormSection title="ข้อมูลบริษัท">
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="ชื่อบริษัท"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="เบอร์โทร"
                                        name="companyPhoneNumber"
                                        value={formData.companyPhoneNumber}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="เลขที่เสียภาษี"
                                        name="companyTaxId"
                                        value={formData.companyTaxId}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="สาขา"
                                        name="branch"
                                        value={formData.branch}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="วันที่จดทะเบียน"
                                        name="companyRegistrationDate"
                                        value={formData.companyRegistrationDate}
                                        onChange={handleChange}
                                        type="date"
                                        variant="outlined"
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="ที่อยู่"
                                        name="companyAddress"
                                        value={formData.companyAddress}
                                        onChange={handleChange}
                                        multiline
                                        rows={3}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="อีเมล"
                                        name="companyEmail"
                                        value={formData.companyEmail}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="เว็บไซต์"
                                        name="companyWebsite"
                                        value={formData.companyWebsite}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="ประเภทธุรกิจ"
                                        name="companyBusinessType"
                                        value={formData.companyBusinessType}
                                        onChange={handleChange}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="company-image-upload"
                                        type="file"
                                        onChange={handleImageChange}
                                    />
                                    <label htmlFor="company-image-upload">
                                        <Button
                                            variant="outlined"
                                            component="span"
                                            startIcon={uploading ? <CircularProgress size={20} /> : null}
                                            disabled={loading || saving || uploading}
                                            sx={{
                                                mb: 2,
                                                borderStyle: 'dashed',
                                                borderColor: 'primary.main',
                                                color: 'primary.main',
                                                '&:hover': {
                                                    borderColor: 'primary.dark',
                                                    backgroundColor: 'rgba(3, 194, 215, 0.04)'
                                                }
                                            }}
                                        >
                                            {uploading ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพบริษัท'}
                                        </Button>
                                    </label>
                                    {imageError && (
                                        <FormHelperText error>{imageError}</FormHelperText>
                                    )}
                                    {(formData.companyImage || (companyId && data?.companyImage)) && (
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box
                                                component="img"
                                                src={formData.companyImage || (data && data.companyImage) || undefined}
                                                alt="Company Logo"
                                                sx={{
                                                    maxWidth: 200,
                                                    maxHeight: 120,
                                                    width: 'auto',
                                                    height: 'auto',
                                                    objectFit: 'contain',
                                                    borderRadius: '8px',
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    รูปภาพปัจจุบัน
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={handleRemoveImage}
                                                    disabled={saving || uploading}
                                                    sx={{
                                                        backgroundColor: 'error.light',
                                                        color: 'white',
                                                        '&:hover': {
                                                            backgroundColor: 'error.main'
                                                        }
                                                    }}
                                                >
                                                    <span>ลบ</span>
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </FormSection>
                        <Box mt={3} display="flex" justifyContent="flex-end">
                            <Button
                                variant="contained"
                                color="success"
                                onClick={handleSave}
                                disabled={saving}
                                sx={{
                                    backgroundColor: "#03c9d7",
                                    "&:hover": { backgroundColor: "#05b2bd" },
                                    color: "white",
                                    textTransform: "none"
                                }}
                            >
                                {saving ? "กำลังบันทึก..." : (companyId ? "บันทึกการแก้ไข" : "บันทึก")}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </PageContainer>
    );
}
