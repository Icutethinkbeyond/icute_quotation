"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  useTheme,
  Typography,
  Switch,
  Tooltip,
  Divider,
  CircularProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import { useSession } from "next-auth/react";

// components
import Profile from "./Profile";
import Notifications from "./Notifications";
import StoreLinkButton from "./StoreLinkButton";
import { Menu as MenuIcon, Power, Bot } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
// import { useStoreContext } from "@/contexts/StoreContext";
import { useNotifyContext } from "@/contexts/NotifyContext";
// import { storeService } from "@/services/ApiServices/StoreAPI";
// import { employeeService } from "@/services/ApiServices/EmployeeAPI";
// import { serviceService } from "@/services/ApiServices/ServiceAPI";
import BreadcrumbCustom from "@/components/shared/BreadcrumbCustom";

interface ItemType {
  toggleMobileSidebar?: (event: React.MouseEvent<HTMLElement>) => void;
}

const Header = ({ toggleMobileSidebar }: ItemType) => {
  const theme = useTheme();
  // const { StoreForm, setStoreForm, setStoreStatusHeader, storeStatusHeader } =
  //   useStoreContext();
  const { setNotify } = useNotifyContext();
  const { data: session } = useSession();
  const isAdmin = session?.user?.roleName === "ADMIN";
  const [loadingActivated, setLoadingActivated] = useState(false);
  const [loadingAutoQueue, setLoadingAutoQueue] = useState(false);

  // const handleToggleActivated = async (checked: boolean) => {
  //   setLoadingActivated(true);
  //   try {
  //     if (checked) {
  //       const [employeesRes, servicesRes] = await Promise.all([
  //         employeeService.getEmployeeList(),
  //         serviceService.getServiceList(),
  //       ]);

  //       const employeeCount = employeesRes.success
  //         ? employeesRes.data.length
  //         : 0;
  //       const serviceCount = servicesRes.success ? servicesRes.data.length : 0;

  //       if (employeeCount === 0 || serviceCount === 0) {
  //         let missingItems = [];
  //         if (employeeCount === 0) missingItems.push("พนักงาน");
  //         if (serviceCount === 0) missingItems.push("บริการ");

  //         setNotify({
  //           open: true,
  //           message: `ไม่สามารถเปิดร้านค้าได้ เนื่องจากยังไม่มี${missingItems.join("และ")}`,
  //           color: "error",
  //         });

  //         await storeService.ToggleActivated(false);
  //         setStoreStatusHeader({ ...storeStatusHeader, activated: false });
  //         return;
  //       }
  //     }

  //     const result = await storeService.ToggleActivated(checked);
  //     setNotify({
  //       open: true,
  //       message: result.message,
  //       color: result.success ? "success" : "error",
  //     });
  //     if (result.success) {
  //       setStoreStatusHeader({ ...storeStatusHeader, activated: checked });
  //     }
  //   } finally {
  //     setLoadingActivated(false);
  //   }
  // };

  // const handleToggleAutoQueue = async (checked: boolean) => {
  //   setLoadingAutoQueue(true);
  //   try {
  //     const result = await storeService.AutoQueuePress(checked);
  //     setNotify({
  //       open: true,
  //       message: result.message,
  //       color: result.success ? "success" : "error",
  //     });
  //     if (result.success) {
  //       setStoreStatusHeader({ ...storeStatusHeader, autoQueue: checked });
  //     }
  //   } finally {
  //     setLoadingAutoQueue(false);
  //   }
  // };

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "none",
    background: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    backdropFilter: "blur(12px)",
    borderBottom: `1px solid ${theme.palette.divider}`,
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));

  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
    padding: theme.spacing(0, 3),
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline-flex",
            },
            mr: 1,
          }}
        >
          <MenuIcon size={20} />
        </IconButton>

        <Stack spacing={1} direction="row" alignItems="center">
          <BreadcrumbCustom />
        </Stack>

        <Box flexGrow={1} />

        <Stack spacing={2} direction="row" alignItems="center">
          {/* Store Link Button */}

          {/* Store Status Toggle */}
          {/* {!isAdmin && (
            <>
              <StoreLinkButton />
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  display: { xs: "none", md: "flex" },
                  bgcolor: "action.hover",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "12px",
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Tooltip
                  title={
                    storeStatusHeader.activated ? "ปิดร้านค้า" : "เปิดร้านค้า"
                  }
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Power
                      size={16}
                      color={
                        storeStatusHeader.activated
                          ? theme.palette.success.main
                          : theme.palette.text.secondary
                      }
                    />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      sx={{
                        color: storeStatusHeader.activated
                          ? "success.main"
                          : "text.secondary",
                      }}
                    >
                      {storeStatusHeader.activated ? "เปิดร้าน" : "ปิดร้าน"}
                    </Typography>
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <Switch
                        size="small"
                        checked={storeStatusHeader.activated}
                        onChange={(e) =>
                          handleToggleActivated(e.target.checked)
                        }
                        color="success"
                        disabled={loadingActivated}
                      />
                      {loadingActivated && (
                        <CircularProgress
                          size={20}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-10px",
                            marginLeft: "-10px",
                            color: theme.palette.success.main,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Tooltip>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

                <Tooltip
                  title={
                    storeStatusHeader.autoQueue
                      ? "ปิดรับคิวอัตโนมัติ"
                      : "เปิดรับคิวอัตโนมัติ"
                  }
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Bot
                      size={16}
                      color={
                        storeStatusHeader.autoQueue
                          ? theme.palette.primary.main
                          : theme.palette.text.secondary
                      }
                    />
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                      <Switch
                        size="small"
                        checked={storeStatusHeader.autoQueue}
                        onChange={(e) =>
                          handleToggleAutoQueue(e.target.checked)
                        }
                        color="primary"
                        disabled={loadingAutoQueue}
                      />
                      {loadingAutoQueue && (
                        <CircularProgress
                          size={20}
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: "-10px",
                            marginLeft: "-10px",
                            color: theme.palette.primary.main,
                          }}
                        />
                      )}
                    </Box>
                  </Stack>
                </Tooltip>
              </Stack>
            </>
          )} */}

          {/* <Notifications /> */}
          <Profile />
          <LanguageSwitcher />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};

export default Header;
