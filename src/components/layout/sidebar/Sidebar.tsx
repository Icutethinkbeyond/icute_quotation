import { useMediaQuery, Box, Drawer, useTheme, Button } from "@mui/material";
import Logo from "@/components/shared/Logo";
import SidebarItems from "./SidebarItems";
import { IconLogout, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useState, useEffect } from "react";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
  onToggleSidebar,
}: ItemType) => {
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"));

  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = 270;
  const sidebarWidthCollapsed = 80;

  // Set collapsed as default on desktop
  useEffect(() => {
    if (lgUp) {
      setCollapsed(true);
    }
  }, [lgUp]);

  const currentWidth = collapsed ? sidebarWidthCollapsed : sidebarWidth;

  const LogoutButton = (
    <Box px={collapsed ? 0.5 : 2} pb={4} mt="auto">
      <Button
        fullWidth
        startIcon={!collapsed && <IconLogout size="20" />}
        sx={{
          justifyContent: collapsed ? "center" : "flex-start",
          color: theme.palette.error.main,
          backgroundColor: "transparent",
          py: "10px",
          px: collapsed ? "0" : "16px",
          borderRadius: "12px",
          fontWeight: 600,
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: theme.palette.error.light + "20",
          },
          "& .MuiButton-startIcon": {
            marginRight: collapsed ? 0 : "8px",
          },
          fontSize: "0.875rem",
        }}
        onClick={() => {
          // Add logout logic here
          console.log("Logout clicked");
        }}
      >
        {!collapsed && "ออกจากระบบ"}
      </Button>
    </Box>
  );

  const ToggleButton = () => (
    <Box
      onClick={() => {
        setCollapsed(!collapsed);
        if (onToggleSidebar) onToggleSidebar();
      }}
      sx={{
        position: "absolute",
        right: -16,
        top: "50%",
        transform: "translateY(-50%)",
        width: 32,
        height: 32,
        borderRadius: "50%",
        backgroundColor: theme.palette.background.paper,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        boxShadow: theme.shadows[3],
        zIndex: 10,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {collapsed ? (
        <IconChevronRight size={18} />
      ) : (
        <IconChevronLeft size={18} />
      )}
    </Box>
  );

  if (lgUp) {
    return (
      <Box
        sx={{
          width: currentWidth,
          flexShrink: 0,
          position: "relative",
          transition: "width 0.3s ease-in-out",
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              width: currentWidth,
              minWidth: currentWidth,
              boxSizing: "border-box",
              border: "0",
              borderRight: "1px solid",
              borderColor: "divider",
              boxShadow: "none",
              background: theme.palette.background.paper,
              transition: "width 0.3s ease-in-out",
              overflowX: "hidden",
              color: theme.palette.text.primary,
            },
          }}
        >
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <Box
              px={collapsed ? 0.5 : 3}
              py={collapsed ? 1 : 3}
              sx={{
                transition: "all 0.2s ease-in-out",
              }}
            >
              <Logo collapsed={collapsed} />
            </Box>
            <ToggleButton />
            <Box
              flexGrow={1}
              sx={{
                mt: 1,
                transition: "all 0.2s ease-in-out",
              }}
            >
              <SidebarItems collapsed={collapsed} />
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
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
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
          <Logo collapsed={false} />
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
