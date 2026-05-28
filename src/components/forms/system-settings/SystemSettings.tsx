"use client";


import { LoadingButton } from "@mui/lab";
import { systemSettingService } from "@/services/api-services/SystemSettingAPI";
import { useNotifyContext } from "@/contexts/NotifyContext";
import {
  CloudQueue,
  Message,
  Email,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Save,
} from "@mui/icons-material";
import { Alert, alpha, Box, Checkbox, CircularProgress, Divider, FormControlLabel, IconButton, InputAdornment, Paper, TextField, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";

type SettingsGroup = "line" | "cloudinary" | "email" | "facebook" | "google";

interface SettingsData {
  line: Record<string, string>;
  cloudinary: Record<string, string>;
  email: Record<string, string>;
  facebook: Record<string, string>;
  google: Record<string, string>;
  helpLinks?: Record<string, string>;
}

const GROUP_CONFIG: Record<
  SettingsGroup,
  {
    label: string;
    icon: React.ReactNode;
    color: string;
    fields: { key: string; label: string; type?: string; placeholder?: string; helpLink?: string }[];
  }
> = {
  line: {
    label: "LINE",
    icon: <Message />,
    color: "#06C755",
    fields: [
      { key: "LINE_CLIENT_ID", label: "LINE Client ID", placeholder: "เช่น abc123..." },
      { key: "LINE_CLIENT_SECRET", label: "LINE Client Secret", type: "password", placeholder: "เช่น xyz789..." },
      { key: "LINE_CHANNEL_ID", label: "LINE Channel ID", placeholder: "เช่น 1234567890" },
      { key: "LINE_HELP_URL_TH", label: "ลิงก์วิธีสมัคร LINE (TH)", placeholder: "https://..." },
      { key: "LINE_HELP_URL_EN", label: "ลิงก์วิธีสมัคร LINE (EN)", placeholder: "https://..." },
    ],
  },
  cloudinary: {
    label: "Cloudinary",
    icon: <CloudQueue />,
    color: "#3448C5",
    fields: [
      { key: "CLOUDINARY_CLOUD_NAME", label: "Cloud Name", placeholder: "เช่น mycloud" },
      { key: "CLOUDINARY_API_KEY", label: "API Key", placeholder: "เช่น 123456789012345" },
      { key: "CLOUDINARY_API_SECRET", label: "API Secret", type: "password", placeholder: "เช่น abc-xyz..." },
    ],
  },
  email: {
    label: "Email",
    icon: <Email />,
    color: "#EA4335",
    fields: [
      { key: "EMAIL_HOST", label: "SMTP Host", placeholder: "เช่น smtp.gmail.com" },
      { key: "EMAIL_PORT", label: "SMTP Port", placeholder: "เช่น 587, 465" },
      { key: "EMAIL_USER", label: "Email User", placeholder: "เช่น noreply@gmail.com" },
      { key: "EMAIL_PASSWORD", label: "Email Password", type: "password", placeholder: "App Password" },
      { key: "EMAIL_FROM", label: "Email From (ผู้ส่ง)", placeholder: "เช่น noreply@gmail.com" },
      { key: "EMAIL_HELP_URL_TH", label: "ลิงก์วิธีสร้าง App Password (TH)", placeholder: "https://..." },
      { key: "EMAIL_HELP_URL_EN", label: "ลิงก์วิธีสร้าง App Password (EN)", placeholder: "https://..." },
    ],
  },
  facebook: {
    label: "Facebook",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z"/>
      </svg>
    ),
    color: "#1877F2",
    fields: [
      { key: "FACEBOOK_APP_ID", label: "Facebook App ID", placeholder: "เช่น 1234567890" },
      { key: "FACEBOOK_APP_SECRET", label: "Facebook App Secret", type: "password", placeholder: "เช่น abc123xyz..." },
      { key: "FACEBOOK_REDIRECT_URI", label: "Redirect URI", placeholder: "เช่น https://yourdomain.com/api/auth/facebook/callback" },
      { key: "FACEBOOK_SCOPE", label: "Scope", placeholder: "เช่น email,public_profile", type: "text" },
      { key: "FACEBOOK_HELP_URL_TH", label: "ลิงก์วิธีสร้าง Facebook App (TH)", placeholder: "https://..." },
      { key: "FACEBOOK_HELP_URL_EN", label: "ลิงก์วิธีสร้าง Facebook App (EN)", placeholder: "https://..." },
    ],
  },
  google: {
    label: "Google",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="#EA4335">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    color: "#EA4335",
    fields: [
      { key: "GOOGLE_CLIENT_ID", label: "Google Client ID", placeholder: "เช่น 1234567890-abc.apps.googleusercontent.com" },
      { key: "GOOGLE_CLIENT_SECRET", label: "Google Client Secret", type: "password", placeholder: "เช่น GOCSPX-abc123..." },
      { key: "GOOGLE_REDIRECT_URI", label: "Redirect URI", placeholder: "เช่น https://yourdomain.com/api/auth/google/callback" },
      { key: "GOOGLE_SCOPE", label: "Scope", placeholder: "เช่น openid,email,profile", type: "text" },
      { key: "GOOGLE_HELP_URL_TH", label: "ลิงก์วิธีสร้าง Google OAuth App (TH)", placeholder: "https://..." },
      { key: "GOOGLE_HELP_URL_EN", label: "ลิงก์วิธีสร้าง Google OAuth App (EN)", placeholder: "https://..." },
    ],
  },
};

export default function SystemSettings() {
  const theme = useTheme();
  const { setNotify } = useNotifyContext();

  const [activeGroup, setActiveGroup] = useState<SettingsGroup>("line");
  const [settings, setSettings] = useState<SettingsData>({
    line: {},
    cloudinary: {},
    email: {},
    facebook: {},
    google: {},
  });
  const [emailSecure, setEmailSecure] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setLoading(true);
    const result = await systemSettingService.getSystemSettings();
    if (result.success) {
      setSettings(result.data);
      setEmailSecure(result.data?.email?.EMAIL_SECURE !== "false");
    }
    setLoading(false);
  };

  const handleChange = (group: SettingsGroup, key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));
  };

  const handleSave = async (group: SettingsGroup) => {
    setSaving(true);
    const data = { ...settings[group] };
    if (group === "email") {
      data.EMAIL_SECURE = emailSecure ? "true" : "false";
    }
    const result = await systemSettingService.updateSystemSettings(group, data);
    setNotify({
      open: true,
      message: result.message,
      color: result.success ? "success" : "error",
    });
    setSaving(false);
  };

  const isConfigured = (group: SettingsGroup): boolean => {
    const data = settings[group];
    const config = GROUP_CONFIG[group];
    return config.fields.every((f) => data[f.key]?.trim());
  };

  const currentConfig = GROUP_CONFIG[activeGroup];
  const currentSettings = settings[activeGroup];

  return (
    <Box sx={{ display: "flex", gap: 3, minHeight: 500 }}>
      {/* Sidebar */}
      <Paper
        elevation={0}
        sx={{
          width: 240,
          flexShrink: 0,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          p: 1.5,
          alignSelf: "flex-start",
        }}
      >
        <Typography
          variant="overline"
          sx={{ px: 2, py: 1, display: "block", color: "#94a3b8", fontWeight: 700 }}
        >
          ตั้งค่าระบบ
        </Typography>
        {(Object.keys(GROUP_CONFIG) as SettingsGroup[]).map((group) => {
          const cfg = GROUP_CONFIG[group];
          const configured = isConfigured(group);
          const isActive = activeGroup === group;
          return (
            <Box
              key={group}
              onClick={() => setActiveGroup(group)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: "10px",
                cursor: "pointer",
                mb: 0.5,
                backgroundColor: isActive ? alpha(cfg.color, 0.08) : "transparent",
                border: isActive ? `1px solid ${alpha(cfg.color, 0.2)}` : "1px solid transparent",
                "&:hover": {
                  backgroundColor: isActive ? alpha(cfg.color, 0.08) : alpha(theme.palette.grey[500], 0.05),
                },
              }}
            >
              <Box sx={{ color: isActive ? cfg.color : "#94a3b8", display: "flex" }}>{cfg.icon}</Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#1e293b" : "#64748b",
                  flex: 1,
                }}
              >
                {cfg.label}
              </Typography>
              {configured ? (
                <CheckCircle sx={{ fontSize: 16, color: "#10b981" }} />
              ) : (
                <ErrorIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
              )}
            </Box>
          );
        })}
      </Paper>

      {/* Content */}
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          borderRadius: "16px",
          border: `1px solid ${theme.palette.divider}`,
          p: 4,
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    backgroundColor: alpha(currentConfig.color, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: currentConfig.color,
                  }}
                >
                  {currentConfig.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
                    ตั้งค่า {currentConfig.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    {activeGroup === "line" && "ตั้งค่า LINE Login และ Messaging API"}
                    {activeGroup === "cloudinary" && "ตั้งค่า Cloudinary สำหรับจัดเก็บรูปภาพ"}
                    {activeGroup === "email" && "ตั้งค่า SMTP สำหรับการส่งอีเมลแจ้งเตือน"}
                    {activeGroup === "facebook" && "ตั้งค่า Facebook OAuth สำหรับการเข้าสู่ระบบ"}
                    {activeGroup === "google" && "ตั้งค่า Google OAuth สำหรับการเข้าสู่ระบบ"}
                  </Typography>
                </Box>
              </Box>

              {isConfigured(activeGroup) ? (
                <Alert
                  severity="success"
                  icon={<CheckCircle fontSize="inherit" />}
                  sx={{ borderRadius: "10px", mt: 2 }}
                >
                  {currentConfig.label} ตั้งค่าเรียบร้อยแล้ว
                </Alert>
              ) : (
                <Alert
                  severity="warning"
                  icon={<ErrorIcon fontSize="inherit" />}
                  sx={{ borderRadius: "10px", mt: 2 }}
                >
                  {currentConfig.label} ยังไม่ได้ตั้งค่า
                </Alert>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Fields */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {currentConfig.fields.map((field) => {
                const isPassword = field.type === "password";
                const showPw = showPasswords[field.key];

                return (
                  <Box key={field.key}>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#374151", mb: 0.75 }}
                    >
                      {field.label}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      type={isPassword && !showPw ? "password" : "text"}
                      value={currentSettings[field.key] || ""}
                      onChange={(e) => handleChange(activeGroup, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      InputProps={
                        isPassword
                          ? {
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      setShowPasswords((prev) => ({
                                        ...prev,
                                        [field.key]: !prev[field.key],
                                      }))
                                    }
                                  >
                                    {showPw ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }
                          : undefined
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                        },
                      }}
                    />
                  </Box>
                );
              })}

              {/* Email secure checkbox */}
              {activeGroup === "email" && (
                <Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={emailSecure}
                        onChange={(e) => setEmailSecure(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ใช้การเชื่อมต่อแบบปลอดภัย (SSL/TLS)
                      </Typography>
                    }
                  />
                </Box>
              )}
            </Box>

            {/* Save button */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <LoadingButton
                variant="contained"
                loading={saving}
                onClick={() => handleSave(activeGroup)}
                startIcon={<Save />}
                sx={{
                  borderRadius: "10px",
                  px: 4,
                  py: 1,
                  fontWeight: 700,
                  backgroundColor: currentConfig.color,
                  "&:hover": { backgroundColor: alpha(currentConfig.color, 0.85) },
                }}
              >
                บันทึกการตั้งค่า
              </LoadingButton>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
