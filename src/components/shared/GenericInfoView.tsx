"use client";

import React from "react";
import {
    Grid,
    Box,
    Button,
    Divider,
    Paper,
    Skeleton,
    Avatar,
    Stack,
    Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import {
    ArrowBack,
    Description,
    Business,
    Phone,
    Email,
    LocationOn,
    Language,
    Category,
    Event,
    Payments,
    AccountCircle,
    Badge,
} from "@mui/icons-material";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import PageHeader from "@/components/shared/PageHeader";

export type ViewStatus = 'loading' | 'error' | 'notFound' | 'ready';

export interface FieldConfig<T> {
    label: string;
    key: keyof T | string;
    format?: (value: any) => string;
    icon?: React.ReactNode;
}

export interface SectionConfig<T> {
    sectionTitle: string;
    fields: FieldConfig<T>[];
}

interface GenericInfoViewProps<T> {
    title: string;
    backPath: string;
    data: T | null;
    fields?: FieldConfig<T>[];
    sections?: SectionConfig<T>[];
    status: ViewStatus;
    errorMessage?: string;
    notFoundMessage?: string;
    headerActions?: React.ReactNode;
    renderExtraSection?: () => React.ReactNode;
}

const getIconForField = (label: string, icon?: React.ReactNode) => {
    if (icon) return icon;
    const lowerLabel = label.toLowerCase();

    // Using theme palette colors
    if (lowerLabel.includes("ชื่อ") || lowerLabel.includes("name")) return <Business fontSize="small" color="primary" />;
    if (lowerLabel.includes("โทร") || lowerLabel.includes("phone") || lowerLabel.includes("tel")) return <Phone fontSize="small" color="success" />;
    if (lowerLabel.includes("อีเมล") || lowerLabel.includes("email")) return <Email fontSize="small" color="warning" />;
    if (lowerLabel.includes("ที่อยู่") || lowerLabel.includes("address")) return <LocationOn fontSize="small" color="error" />;
    if (lowerLabel.includes("เว็บ") || lowerLabel.includes("web")) return <Language fontSize="small" color="info" />;
    if (lowerLabel.includes("ประเภท") || lowerLabel.includes("type")) return <Category fontSize="small" color="secondary" />;
    if (lowerLabel.includes("วัน") || lowerLabel.includes("date")) return <Event fontSize="small" color="primary" />;
    if (lowerLabel.includes("ราคา") || lowerLabel.includes("price")) return <Payments fontSize="small" color="success" />;
    if (lowerLabel.includes("ภาษี") || lowerLabel.includes("tax")) return <Badge fontSize="small" color="info" />;
    if (lowerLabel.includes("คน") || lowerLabel.includes("contact")) return <AccountCircle fontSize="small" color="primary" />;

    return <Description fontSize="small" color="action" />;
};

const DetailItem = ({ label, value, icon }: { label: string; value: string | undefined | null; icon?: React.ReactNode }) => (
    <Box mb={2}>
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            {getIconForField(label, icon)}
            <Typography variant="subtitle2" fontWeight={600} color="textSecondary">
                {label}
            </Typography>
        </Stack>
        <Typography variant="body1" color="textPrimary" sx={{ ml: 3.5, fontWeight: 500 }}>
            {value || "-"}
        </Typography>
        <Divider
            sx={{
                mt: 1.5,
                borderColor: 'primary.main',
                opacity: 0.3,
            }}
        />
    </Box>
);

const LoadingSkeleton = ({ title }: { title: string }) => (
    <Box>
        <Box mb={2}>
            <Skeleton variant="text" width="30%" height={40} />
        </Box>
        <DashboardCard title="">
            <Grid container spacing={4}>
                {[...Array(6)].map((_, i) => (
                    <Grid item xs={12} md={6} key={i}>
                        <Box sx={{ mb: 2 }}>
                            <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" height={30} sx={{ borderRadius: "4px" }} />
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </DashboardCard>
    </Box>
);

export function GenericInfoView<T>({
    title,
    backPath,
    data,
    fields,
    sections,
    status,
    errorMessage = "Cannot load data",
    notFoundMessage = "Data not found",
    headerActions,
    renderExtraSection,
}: GenericInfoViewProps<T>) {
    const router = useRouter();

    const getValue = (item: T, field: FieldConfig<T>) => {
        if (!item) return "-";
        const val = (item as any)[field.key];
        if (field.format) {
            return field.format(val);
        }
        return val;
    };

    if (status === 'loading') {
        return (
            <PageContainer title={title} description={`View ${title}`}>
                <LoadingSkeleton title={title} />
            </PageContainer>
        );
    }

    if (status === 'error' || status === 'notFound' || !data) {
        return (
            <PageContainer title={title} description={`View ${title}`}>
                <Box p={4} textAlign="center">
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            p: 6,
                            borderRadius: '16px',
                            borderStyle: 'dashed',
                            borderColor: 'primary.main',
                            backgroundColor: 'primary.light'
                        }}
                    >
                        <Avatar sx={{ width: 80, height: 80, mx: "auto", mb: 2, bgcolor: "warning.light" }}>
                            <Description fontSize="large" color="warning" />
                        </Avatar>
                        <Typography variant="h4" gutterBottom>
                            {status === 'notFound' ? "ไม่พบข้อมูล" : "เกิดข้อผิดพลาด"}
                        </Typography>
                        <Typography variant="body1" color="textSecondary" mb={3}>
                            {status === 'notFound' ? notFoundMessage : errorMessage}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<ArrowBack />}
                            onClick={() => router.push(backPath)}
                            sx={{ borderRadius: "8px" }}
                        >
                            กลับไปยังรายการ
                        </Button>
                    </Paper>
                </Box>
            </PageContainer>
        );
    }

    return (
        <PageContainer title={title} description={`View ${title}`}>
            <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ArrowBack />}
                    onClick={() => router.push(backPath)}
                    sx={{ textTransform: "none", borderRadius: "8px", boxShadow: "none" }}
                >
                    ย้อนกลับ
                </Button>
                {headerActions && <Box>{headerActions}</Box>}
            </Box>

            <Box mt={3}>
                {sections ? (
                    sections.map((section, sIdx) => (
                        <Box key={sIdx} mb={3}>
                            <DashboardCard title={section.sectionTitle}>
                                <Grid container spacing={4}>
                                    {section.fields.map((field, fIdx) => (
                                        <Grid item xs={12} md={6} key={fIdx}>
                                            <DetailItem
                                                label={field.label}
                                                value={getValue(data as T, field)}
                                                icon={field.icon}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </DashboardCard>
                        </Box>
                    ))
                ) : (
                    <DashboardCard title="ข้อมูลรายละเอียด">
                        <Grid container spacing={4}>
                            {fields?.map((field, index) => (
                                <Grid item xs={12} md={6} key={index}>
                                    <DetailItem
                                        label={field.label}
                                        value={getValue(data as T, field)}
                                        icon={field.icon}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </DashboardCard>
                )}
                {renderExtraSection && renderExtraSection()}
            </Box>
        </PageContainer>
    );
}

export default GenericInfoView;
