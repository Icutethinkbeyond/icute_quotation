"use client";

import React, { useEffect, useState } from "react";
import { Grid2, Box, Typography, Stack, Avatar, Chip, Button, CircularProgress } from "@mui/material";
import PageContainer from "@/components/shared/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import { 
  IconReceipt2, 
  IconPackage, 
  IconUsers, 
  IconCurrencyBaht,
  IconArrowUpRight,
  IconPlus
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { formatThaiDate } from "@/utils/utils";

interface Stats {
  totalQuotations: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
}

interface RecentQuotation {
  id: string;
  number: string;
  customer: string;
  date: string;
  status: string;
}

const Dashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentQuotations, setRecentQuotations] = useState<RecentQuotation[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) throw new Error("Failed to fetch stats");
        const data = await response.json();
        setStats(data.stats);
        setRecentQuotations(data.recentQuotations || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    {
      title: "ใบเสนอราคาทั้งหมด",
      value: stats?.totalQuotations || 0,
      icon: IconReceipt2,
      color: "primary.main",
      bgColor: "primary.light",
      href: "/quotation"
    },
    {
      title: "ลูกค้ารวม",
      value: stats?.totalCustomers || 0,
      icon: IconUsers,
      color: "secondary.main",
      bgColor: "secondary.light",
      href: "/customer"
    },
    {
      title: "สินค้าในระบบ",
      value: stats?.totalProducts || 0,
      icon: IconPackage,
      color: "success.main",
      bgColor: "success.light",
      href: "/product"
    },
    {
      title: "รายได้รวม (อนุมัติแล้ว)",
      value: `฿${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: IconCurrencyBaht,
      color: "warning.main",
      bgColor: "warning.light",
      href: "/quotation"
    }
  ];

  if (loading) {
    return (
      <PageContainer title="Dashboard" description="Overview of your system">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Dashboard" description="ยินดีต้อนรับสู่ระบบจัดการเอกสาร">
      <Box mt={3}>
        <Grid2 container spacing={3}>
          {/* Welcome Card */}
          <Grid2 size={12}>
            <DashboardCard>
              <Box p={1}>
                <Typography variant="h4" fontWeight={700}>
                  ยินดีต้อนรับกลับมา! 👋
                </Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>
                  นี่คือภาพรวมของระบบธุรกิจของคุณในวันนี้
                </Typography>
              </Box>
            </DashboardCard>
          </Grid2>

          {/* Stats Cards */}
          {statCards.map((card, index) => (
            <Grid2 size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
              <DashboardCard title="">
                <>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary" fontWeight={600}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" fontWeight={700} mt={1}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: card.bgColor,
                      color: card.color,
                      width: 48,
                      height: 48
                    }}
                  >
                    <card.icon size="24" />
                  </Avatar>
                </Box>
                <Box mt={2} display="flex" alignItems="center">
                  <Button 
                    size="small" 
                    endIcon={<IconArrowUpRight size="16" />}
                    onClick={() => router.push(card.href)}
                    sx={{ textTransform: 'none', p: 0 }}
                  >
                    ดูรายละเอียด
                  </Button>
                </Box>
                </>
              </DashboardCard>
            </Grid2>
          ))}

          {/* Quick Actions */}
          <Grid2 size={{ xs: 12, lg: 4 }}>
            <DashboardCard title="ทางลัด">
              <Stack spacing={2} mt={1}>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<IconPlus size="20" />}
                  onClick={() => router.push("/quotation/new-quotation")}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  สร้างใบเสนอราคาใหม่
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<IconUsers size="20" />}
                  onClick={() => router.push("/customer/new-customer")}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  เพิ่มลูกค้าใหม่
                </Button>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  startIcon={<IconPackage size="20" />}
                  onClick={() => router.push("/product/new")}
                  sx={{ py: 1.5, textTransform: 'none', fontWeight: 600 }}
                >
                  เพิ่มสินค้าใหม่
                </Button>
              </Stack>
            </DashboardCard>
          </Grid2>

          {/* Recent Quotations */}
          <Grid2 size={{ xs: 12, lg: 8 }}>
            <DashboardCard title="ใบเสนอราคาล่าสุด">
              <>
              <Box mt={2} overflow="auto">
                <Box minWidth="600px">
                  <Grid2 container sx={{ borderBottom: 1, borderColor: 'divider', pb: 1, mb: 2 }}>
                    <Grid2 size={3}><Typography variant="subtitle2" fontWeight={700}>เลขที่เอกสาร</Typography></Grid2>
                    <Grid2 size={4}><Typography variant="subtitle2" fontWeight={700}>ลูกค้า</Typography></Grid2>
                    <Grid2 size={3}><Typography variant="subtitle2" fontWeight={700}>วันที่</Typography></Grid2>
                    <Grid2 size={2}><Typography variant="subtitle2" fontWeight={700}>สถานะ</Typography></Grid2>
                  </Grid2>
                  
                  {recentQuotations.length > 0 ? (
                    recentQuotations.map((item) => (
                      <Grid2 
                        container 
                        key={item.id} 
                        sx={{ 
                          py: 1.5, 
                          borderBottom: 1, 
                          borderColor: 'grey.100',
                          '&:hover': { bgcolor: 'grey.50', cursor: 'pointer' }
                        }}
                        onClick={() => router.push(`/quotation/edit-quotation/${item.id}`)}
                      >
                        <Grid2 size={3}><Typography variant="body2" fontWeight={600}>{item.number}</Typography></Grid2>
                        <Grid2 size={4}><Typography variant="body2">{item.customer}</Typography></Grid2>
                        <Grid2 size={3}><Typography variant="body2">{formatThaiDate(item.date)}</Typography></Grid2>
                        <Grid2 size={2}>
                          <Chip 
                            label={item.status} 
                            size="small" 
                            color={
                              item.status === 'Approve' ? 'success' : 
                              item.status === 'Draft' ? 'default' : 
                              item.status === 'Waiting' ? 'warning' : 'error'
                            }
                            sx={{ fontWeight: 600 }}
                          />
                        </Grid2>
                      </Grid2>
                    ))
                  ) : (
                    <Box py={4} textAlign="center">
                      <Typography color="textSecondary">ยังไม่มีข้อมูลล่าสุด</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
              <Box mt={2} textAlign="right">
                <Button 
                  onClick={() => router.push("/quotation")}
                  sx={{ textTransform: 'none' }}
                >
                  ดูใบเสนอราคาทั้งหมด
                </Button>
              </Box>
              </>
            </DashboardCard>
          </Grid2>
        </Grid2>
      </Box>
    </PageContainer>
  );
};

export default Dashboard;
