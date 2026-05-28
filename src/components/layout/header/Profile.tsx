import React, { useState } from "react";
import { useTheme, alpha } from "@mui/material/styles";
import {
  Box,
  Menu,
  Typography,
  Divider,
  Button,
  IconButton,
  ListItemButton,
  List,
  ListItemText,
  Avatar,
  ListItemIcon,
  Switch,
  Chip,
  Paper,
} from "@mui/material";

import {
  ChevronDown,
  User,
  LogOut,
  Settings,
  Power,
  Bot,
  Store,
  Shield,
} from "lucide-react";
import { useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
// import { useStoreContext } from "@/contexts/StoreContext";
// import { storeService } from "@/services/ApiServices/StoreAPI";
// import { employeeService } from "@/services/ApiServices/EmployeeAPI";
// import { serviceService } from "@/services/ApiServices/ServiceAPI";
import { useNotifyContext } from "@/contexts/NotifyContext";

const Profile = () => {
  const { data: session } = useSession();
  // const { StoreForm, setStoreForm } = useStoreContext();
  const { setNotify } = useNotifyContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const theme = useTheme();
  const router = useRouter();
  const localActive = useLocale();

  const handleEdit = () => {
    handleClose();
    if (session?.user?.id) {
      router.push(`/${localActive}/store/protected/profile`);
    }
  };

  const handleGoToSettings = () => {
    handleClose();
    router.push(`/${localActive}/store/protected/shop-settings`);
  };

  // const handleToggleActivated = async (checked: boolean) => {
  //   if (checked) {
  //     const [employeesRes, servicesRes] = await Promise.all([
  //       employeeService.getEmployeeList(),
  //       serviceService.getServiceList(),
  //     ]);

  //     const employeeCount = employeesRes.success ? employeesRes.data.length : 0;
  //     const serviceCount = servicesRes.success ? servicesRes.data.length : 0;

  //     if (employeeCount === 0 || serviceCount === 0) {
  //       let missingItems = [];
  //       if (employeeCount === 0) missingItems.push("พนักงาน");
  //       if (serviceCount === 0) missingItems.push("บริการ");

  //       setNotify({
  //         open: true,
  //         message: `ไม่สามารถเปิดร้านค้าได้ เนื่องจากยังไม่มี${missingItems.join("และ")}`,
  //         color: "error",
  //       });

  //       await storeService.ToggleActivated(false);
  //       setStoreForm({ ...StoreForm, activated: false });
  //       return;
  //     }
  //   }

  //   const result = await storeService.ToggleActivated(checked);
  //   setNotify({
  //     open: true,
  //     message: result.message,
  //     color: result.success ? "success" : "error",
  //   });
  //   if (result.success) {
  //     setStoreForm({ ...StoreForm, activated: checked });
  //   }
  // };

  // const handleToggleAutoQueue = async (checked: boolean) => {
  //   const result = await storeService.AutoQueuePress(checked);
  //   setNotify({
  //     open: true,
  //     message: result.message,
  //     color: result.success ? "success" : "error",
  //   });
  //   if (result.success) {
  //     setStoreForm({ ...StoreForm, autoQueue: checked });
  //   }
  // };

  const showSettings = session?.user?.roleName !== "STOREADMIN";
  const isStoreAdmin = session?.user?.roleName === "STOREADMIN";
  const isAdmin = session?.user?.roleName === "ADMIN";

  const roleLabels: Record<string, string> = {
    ADMIN: "แอดมิน",
    STOREADMIN: "ผู้จัดการ",
    MANAGER: "ผู้จัดการ",
    RECEPTION: "รับเรื่อง",
    STAFF: "พนักงาน",
  };

  const roleName = session?.user?.roleName || "STAFF";
  const roleLabel = roleLabels[roleName] || "พนักงาน";

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="menu"
        color="inherit"
        sx={{
          padding: 0.5,
          borderRadius: "14px",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.08),
          },
          ...(Boolean(anchorEl) && {
            bgcolor: alpha(theme.palette.primary.main, 0.12),
          }),
        }}
        onClick={handleClick}
      >
        <Avatar
          src={session?.user?.image || ""}
          alt={"ProfileImg"}
          sx={{
            width: 36,
            height: 36,
            border: `2px solid ${theme.palette.background.paper}`,
            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        />
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            ml: 1,
            mr: 0.5,
          }}
        >
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            สวัสดี,
          </Typography>
          <Typography
            variant="body2"
            color="text.primary"
            fontWeight={700}
            sx={{ ml: 0.5 }}
          >
            {/* {session?.user?.storeName || "Developer"} */}
          </Typography>
          <ChevronDown size={16} style={{ marginLeft: 4, opacity: 0.5 }} />
        </Box>
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              width: "320px",
              mt: 1.5,
              boxShadow: "0 20px 50px -12px rgba(0,0,0,0.15)",
              borderRadius: "18px",
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Profile Header */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.7)} 100%)`,
            px: 2.5,
            py: 2.5,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -30,
              right: -30,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              position: "relative",
              zIndex: 1,
            }}
          >
            <Avatar
              src={session?.user?.image || ""}
              sx={{
                width: 48,
                height: 48,
                border: "2px solid rgba(255,255,255,0.4)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "white", lineHeight: 1.2 }}
              >
                {/* {session?.user?.storeName || "Developer"} */}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {session?.user?.email}
              </Typography>
            </Box>
            <Chip
              icon={
                ["ADMIN", "STOREADMIN"].includes(roleName) ? (
                  <Shield size={14} />
                ) : (
                  <User size={14} />
                )
              }
              label={roleLabel}
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.65rem",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.3)",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ p: 1.5 }}>
          {showSettings && (
            <ListItemButton
              onClick={handleEdit}
              sx={{
                borderRadius: "12px",
                mb: 0.5,
                py: 1.25,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={18} color={theme.palette.primary.main} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="ข้อมูลส่วนตัว"
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
              />
            </ListItemButton>
          )}

          {isStoreAdmin && (
            <ListItemButton
              onClick={handleGoToSettings}
              sx={{
                borderRadius: "12px",
                mb: 0.5,
                py: 1.25,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: alpha(theme.palette.info.main, 0.06),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: alpha(theme.palette.info.main, 0.1),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Settings size={18} color={theme.palette.info.main} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary="ตั้งค่าร้านค้า"
                primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
              />
            </ListItemButton>
          )}
        </Box>

        <Divider sx={{ mx: 1.5 }} />

        {/* Store Status */}
        {!isAdmin && (
          <Box sx={{ px: 1.5, py: 1.5 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                px: 1,
                mb: 1,
                display: "block",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              สถานะร้านค้า
            </Typography>

            <Paper
              elevation={0}
              sx={{
                borderRadius: "12px",
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 1.25,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      // bgcolor: StoreForm.activated
                      //   ? alpha(theme.palette.success.main, 0.1)
                      //   : alpha(theme.palette.grey[500], 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    <Power
                      size={16}
                      // color={
                      //   StoreForm.activated
                      //     ? theme.palette.success.main
                      //     : theme.palette.text.secondary
                      // }
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      เปิดร้านค้า
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.65rem" }}
                    >
                      {/* {StoreForm.activated
                        ? "ร้านเปิดให้บริการ"
                        : "ร้านปิดให้บริการ"} */}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  size="small"
                  // checked={StoreForm.activated}
                  // onChange={(e) => handleToggleActivated(e.target.checked)}
                  color="success"
                />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 1.25,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      // bgcolor: StoreForm.autoQueue
                      //   ? alpha(theme.palette.primary.main, 0.1)
                      //   : alpha(theme.palette.grey[500], 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                    }}
                  >
                    <Bot
                      size={16}
                      // color={
                      //   StoreForm.autoQueue
                      //     ? theme.palette.primary.main
                      //     : theme.palette.text.secondary
                      // }
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      รับคิวอัตโนมัติ
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.65rem" }}
                    >
                      {/* {StoreForm.autoQueue ? "เปิดใช้งาน" : "ปิดใช้งาน"} */}
                    </Typography>
                  </Box>
                </Box>
                <Switch
                  size="small"
                  // checked={StoreForm.autoQueue}
                  // onChange={(e) => handleToggleAutoQueue(e.target.checked)}
                  color="primary"
                />
              </Box>
            </Paper>
          </Box>
        )}

        <Divider sx={{ mx: 1.5 }} />

        {/* Logout */}
        <Box sx={{ p: 1.5 }}>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogOut size={18} />}
            onClick={() => signOut()}
            sx={{
              borderRadius: "12px",
              py: 1.25,
              textTransform: "none",
              fontWeight: 600,
              borderColor: alpha(theme.palette.error.main, 0.3),
              "&:hover": {
                borderColor: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.04),
              },
            }}
          >
            ออกจากระบบ
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
