import { useMediaQuery, Box, Drawer, Typography, Stack, useTheme, alpha } from "@mui/material";
import SidebarItems from "./SidebarItems";
import { useSession } from "next-auth/react";
import { RoleName } from "@prisma/client";
import { CalendarDays } from "lucide-react";
import React, { memo } from "react";

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
  const theme = useTheme();
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Branding Section */}
      <Box sx={{ px: collapsed ? 2.5 : 3, py: 4, transition: "padding 0.3s" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: "10px",
              minWidth: 36,
              width: 36,
              height: 36,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: theme.shadows[3],
            }}
          >
            <CalendarDays color={theme.palette.primary.main} size={20} />
          </Box>
          <Typography 
            variant="h6" 
            fontWeight={800} 
            sx={{ 
              color: theme.palette.primary.contrastText,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
              opacity: collapsed ? 0 : 1,
              transition: "opacity 0.3s, width 0.3s",
              width: collapsed ? 0 : "auto",
              overflow: "hidden"
            }}
          >
            iCute Booking
          </Typography>
        </Stack>
      </Box>

      {/* Sidebar Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", pb: 4 }}>
        <SidebarItems collapsed={collapsed} />
      </Box>

      {/* Optional Footer or Version Info */}
      <Box sx={{ p: 3, borderTop: `1px solid ${alpha(theme.palette.primary.contrastText, 0.05)}`, whiteSpace: "nowrap", overflow: "hidden" }}>
        <Typography 
          variant="caption" 
          sx={{ 
            color: alpha(theme.palette.primary.contrastText, 0.3), 
            fontWeight: 600,
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.3s"
          }}
        >
          {collapsed ? "v1.0" : "v1.0.4 - iCute Booking"}
        </Typography>
      </Box>
    </Box>
  );
};

const SidebarContentMemo = memo(SidebarContent);

const Sidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const lgUp = useMediaQuery(theme.breakpoints.up("lg"));
  
  const [isHovered, setIsHovered] = React.useState(false);

  const collapsedWidth = "80px";
  const expandedWidth = "270px";
  const sidebarWidth = lgUp ? (isHovered ? expandedWidth : collapsedWidth) : expandedWidth;

  if (lgUp) {
    return (
      <Box 
        sx={{ 
          width: collapsedWidth, 
          flexShrink: 0,
          transition: "width 0.3s ease-in-out",
        }}
      >
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          PaperProps={{
            sx: {
              width: sidebarWidth,
              boxSizing: "border-box",
              border: "0",
              bgcolor: "primary.main",
              backgroundImage: `linear-gradient(to bottom, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              color: theme.palette.primary.contrastText,
              transition: "width 0.3s ease-in-out",
              overflowX: "hidden",
              boxShadow: isHovered ? theme.shadows[8] : "none",
            },
          }}
        >
          <SidebarContentMemo collapsed={!isHovered} />
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
          bgcolor: "primary.main",
          backgroundImage: `linear-gradient(to bottom, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
          width: expandedWidth,
          color: theme.palette.primary.contrastText,
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <SidebarContentMemo collapsed={false} />
    </Drawer>
  );
};

export default memo(Sidebar);
