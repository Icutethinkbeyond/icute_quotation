import { useMediaQuery, Box, Drawer, useTheme, Button, Stack, Typography } from "@mui/material";
import Logo from "@/components/shared/Logo";
import SidebarItems from "./SidebarItems";
import { IconLogout } from "@tabler/icons-react";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const sidebarWidth = "270px";

  const LogoutButton = (
    <Box px={2} pb={4} mt="auto">
      <Button
        variant="light"
        fullWidth
        startIcon={<IconLogout size="20" />}
        sx={{
          justifyContent: "flex-start",
          color: theme.palette.error.main,
          backgroundColor: "rgba(250, 137, 107, 0.04)",
          py: "10px",
          px: "16px",
          borderRadius: "12px",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "rgba(250, 137, 107, 0.1)",
          },
        }}
        onClick={() => {
          // Add logout logic here
          console.log("Logout clicked");
        }}
      >
        ออกจากระบบ
      </Button>
    </Box>
  );

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: sidebarWidth,
              boxSizing: "border-box",
              border: "0",
              borderRight: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "none",
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box px={3} py={4}>
              <Logo />
            </Box>
            <Box flexGrow={1}>
              <SidebarItems />
            </Box>
            {LogoutButton}
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          width: sidebarWidth,
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box px={2} py={2}>
          <Logo />
        </Box>
        <Box flexGrow={1}>
          <SidebarItems toggleMobileSidebar={onSidebarClose} />
        </Box>
        {LogoutButton}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
