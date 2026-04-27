import React, { memo } from "react";
import { useMenuItemsStore } from "./MenuItems";
import { Box, List, Collapse } from "@mui/material";
import NavItem from "./NavItem";

interface SidebarItemsProps {
  toggleMobileSidebar?: (event: React.MouseEvent<HTMLElement>) => void;
  collapsed?: boolean;
}

const SidebarItems = memo(({ toggleMobileSidebar, collapsed }: SidebarItemsProps) => {
  const menuItems = useMenuItemsStore();

  const handleClick = toggleMobileSidebar || (() => {});

  return (
    <Box sx={{ px: collapsed ? 0.5 : 2 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {menuItems.map((item) => {
          return (
            <NavItem
              item={item}
              key={item.id}
              onClick={handleClick}
              collapsed={collapsed}
            />
          );
        })}
      </List>
    </Box>
  );
});

SidebarItems.displayName = 'SidebarItems';

export default SidebarItems;
