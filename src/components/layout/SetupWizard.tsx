"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Card,
  CardContent,
  Chip,
  useTheme,
  Alert,
} from "@mui/material";
import {
  Users,
  Briefcase,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Building2,
} from "lucide-react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

interface SetupStatus {
  canActivate: boolean;
  hasEmployees: boolean;
  hasServices: boolean;
  employeeCount: number;
  serviceCount: number;
  isActivated: boolean;
  storeName: string;
  missingSteps: string[];
  setupComplete: boolean;
}

const SETUP_WIZARD_DISMISSED_KEY = "setup_wizard_dismissed";

const SetupWizard = ({
  open,
  onClose,
  onSetupComplete,
}: {
  open: boolean;
  onClose: () => void;
  onSetupComplete?: () => void;
}) => {
  const theme = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if wizard was previously dismissed - only if setup is now complete
  const isDismissed = React.useMemo(() => {
    if (typeof window === "undefined") return false;
    const dismissed = sessionStorage.getItem(SETUP_WIZARD_DISMISSED_KEY) === "true";
    // Clear dismissal if setup is not complete, so wizard shows again
    if (!setupStatus?.setupComplete && dismissed) {
      sessionStorage.removeItem(SETUP_WIZARD_DISMISSED_KEY);
      return false;
    }
    return dismissed;
  }, [setupStatus?.setupComplete]);

  // Fetch setup status
  useEffect(() => {
    if (open && !isDismissed) {
      fetchSetupStatus();
    }
  }, [open, isDismissed]);

  const fetchSetupStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/store/setup-status", { cache: "no-store"});
      const data = await response.json();
      // console.log(data)
      if (data.success) {
        setSetupStatus(data.data);
        if (data.data.setupComplete && !data.data.isActivated) {
          // Setup complete but not activated, close wizard
          onSetupComplete?.();
          handleClose();
        } else if (data.data.isActivated) {
          // Store is already activated, close wizard
          handleClose();
        }
      }
    } catch (error) {
      console.error("Error fetching setup status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Save dismissal to sessionStorage so wizard doesn't reappear on navigation
    sessionStorage.setItem(SETUP_WIZARD_DISMISSED_KEY, "true");
    onClose();
  };

  const navigateToSetup = (step: string) => {
    let href = "";
    switch (step) {
      case "employees":
        href = `/${locale}/store/protected/employees`;
        break;
      case "services":
        href = `/${locale}/store/protected/services`;
        break;
    }
    if (href) {
      router.push(href);
      onClose();
    }
  };

  const steps = [
    {
      key: "employees",
      label: "เพิ่มพนักงาน",
      icon: Users,
      description: "เพิ่มพนักงานอย่างน้อย 1 คนเพื่อให้บริการลูกค้า",
    },
    {
      key: "services",
      label: "เพิ่มบริการ",
      icon: Briefcase,
      description: "เพิ่มบริการอย่างน้อย 1 รายการเพื่อให้ลูกค้าเลือกจอง",
    },
  ];

  const getActiveStep = () => {
    if (!setupStatus) return 0;
    if (!setupStatus.hasEmployees) return 0;
    if (!setupStatus.hasServices) return 1;
    return 2;
  };

  const progress = setupStatus
    ? (((setupStatus.hasEmployees ? 1 : 0) +
        (setupStatus.hasServices ? 1 : 0)) /
        steps.length) *
      100
    : 0;

  if (loading) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogContent sx={{ py: 6 }}>
          <Box sx={{ textAlign: "center" }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography>กำลังตรวจสอบสถานะการตั้งค่า...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!setupStatus) {
    return null;
  }

  // Don't show wizard if dismissed and not complete
  if (isDismissed && setupStatus && !setupStatus.setupComplete) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={setupStatus?.setupComplete ? handleClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
      sx={{
        "& .MuiDialogTitle-root": {
          pb: 0,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          textAlign: "center",
          pt: 4,
          mb: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mx: "auto",
            mb: 2,
          }}
        >
          <Building2 size={40} color="white" />
        </Box>
        <Typography variant="h5" fontWeight={800}>
          ยินดีต้อนรับสู่ร้าน{setupStatus.storeName || "ของคุณ"}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9, mt: 1, pb: 2 }}>
          กรุณาตั้งค่าร้านให้เสร็จสิ้นก่อนเปิดใช้งาน
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {/* Progress */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" fontWeight={600}>
              ความคืบหน้าการตั้งค่า
            </Typography>
            <Typography variant="body2" color="primary" fontWeight={700}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: theme.palette.grey[200],
              "& .MuiLinearProgress-bar": {
                borderRadius: 5,
              },
            }}
          />
        </Box>

        {/* Steps */}
        <Stepper activeStep={getActiveStep()} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step, index) => {
            const isComplete =
              (setupStatus.hasEmployees && step.key === "employees") ||
              (setupStatus.hasServices && step.key === "services");
            const isActive = !isComplete && getActiveStep() === index;

            return (
              <Step key={step.key} completed={isComplete}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isComplete
                          ? "success.main"
                          : isActive
                            ? "primary.main"
                            : "grey.300",
                        color: "white",
                        transition: "all 0.3s",
                      }}
                    >
                      {isComplete ? (
                        <CheckCircle size={20} />
                      ) : (
                        <step.icon size={20} />
                      )}
                    </Box>
                  )}
                >
                  <Typography
                    variant="body2"
                    fontWeight={isActive ? 700 : 500}
                    color={
                      isComplete
                        ? "success.main"
                        : isActive
                          ? "primary.main"
                          : "text.secondary"
                    }
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            );
          })}
        </Stepper>

        {/* Setup Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
          {/* Employees Card */}
          <Card
            variant="outlined"
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              borderColor: setupStatus.hasEmployees
                ? "success.main"
                : "divider",
              "&:hover": {
                borderColor: setupStatus.hasEmployees
                  ? "success.main"
                  : "primary.main",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => navigateToSetup("employees")}
          >
            <CardContent
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: setupStatus.hasEmployees
                    ? "success.light"
                    : "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users
                  size={28}
                  color={"white"}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    จัดการพนักงาน
                  </Typography>
                  {setupStatus.hasEmployees ? (
                    <Chip
                      size="small"
                      label={`${setupStatus.employeeCount} คน`}
                      color="success"
                      sx={{ height: 24 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="ยังไม่มี"
                      color="warning"
                      sx={{ height: 24 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  เพิ่มพนักงานเเละ "เปิดใช้งาน" อย่างน้อย 1 รายการ
                </Typography>
              </Box>
              {setupStatus.hasEmployees ? (
                <CheckCircle size={24} color={theme.palette.success.main} />
              ) : (
                <ArrowRight size={24} color={theme.palette.grey[400]} />
              )}
            </CardContent>
          </Card>

          {/* Services Card */}
          <Card
            variant="outlined"
            sx={{
              cursor: "pointer",
              transition: "all 0.2s",
              borderColor: setupStatus.hasServices ? "success.main" : "divider",
              "&:hover": {
                borderColor: setupStatus.hasServices
                  ? "success.main"
                  : "primary.main",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transform: "translateY(-2px)",
              },
            }}
            onClick={() => navigateToSetup("services")}
          >
            <CardContent
              sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 2,
                  bgcolor: setupStatus.hasServices
                    ? "success.light"
                    : "primary.light",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Briefcase
                  size={28}
                   color={"white"}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700}>
                    จัดการบริการ
                  </Typography>
                  {setupStatus.hasServices ? (
                    <Chip
                      size="small"
                      label={`${setupStatus.serviceCount} รายการ`}
                      color="success"
                      sx={{ height: 24 }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="ยังไม่มี"
                      color="warning"
                      sx={{ height: 24 }}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  เพิ่มบริการเเละ "เปิดใช้งาน" อย่างน้อย 1 รายการ
                </Typography>
              </Box>
              {setupStatus.hasServices ? (
                <CheckCircle size={24} color={theme.palette.success.main} />
              ) : (
                <ArrowRight size={24} color={theme.palette.grey[400]} />
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Warning/Success Message */}
        {!setupStatus.setupComplete && (
          <Alert
            severity="warning"
            icon={<AlertTriangle size={20} />}
            sx={{
              borderRadius: 3,
              "& .MuiAlert-message": {
                fontWeight: 600,
              },
            }}
          >
            {setupStatus.missingSteps.length === 2
              ? "กรุณาเพิ่มพนักงานและบริการก่อนเปิดใช้งานร้าน"
              : setupStatus.missingSteps.includes("employees")
                ? "กรุณาเพิ่มพนักงานก่อนเปิดใช้งานร้าน"
                : "กรุณาเพิ่มบริการก่อนเปิดใช้งานร้าน"}
          </Alert>
        )}

        {setupStatus.setupComplete && (
          <Alert
            severity="success"
            icon={<CheckCircle size={20} />}
            sx={{
              borderRadius: 3,
              "& .MuiAlert-message": {
                fontWeight: 600,
              },
            }}
          >
            การตั้งค่าเสร็จสิ้น! คุณสามารถเปิดใช้งานร้านได้แล้ว
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, justifyContent: "center", gap: 2 }}>
        {setupStatus.setupComplete ? (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ borderRadius: 3, px: 4 }}
            >
              ทำทีหลัง
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                onSetupComplete?.();
                handleClose();
              }}
              sx={{ borderRadius: 3, px: 4, fontWeight: 700 }}
            >
              เปิดใช้งานร้าน
            </Button>
          </>
        ) : (
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{ borderRadius: 3, px: 4 }}
          >
            ทำทีหลัง
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SetupWizard;
