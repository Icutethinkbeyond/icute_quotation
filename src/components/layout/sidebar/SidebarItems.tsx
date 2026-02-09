import React from "react";
import { useMenuItems } from "./MenuItems";
import { usePathname } from "next/navigation";
import { Box, List } from "@mui/material";
import NavItem from "./NavItem";

const SidebarItems = ({ toggleMobileSidebar }: any) => {
  const pathname = usePathname();
  const pathDirect = pathname;

  const menuItems = useMenuItems();

  return (
    <Box sx={{ px: 2 }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {menuItems.map((item) => {
          return (
            <NavItem
              item={item}
              key={item.id}
              // pathDirect={pathDirect}
              onClick={toggleMobileSidebar}
            />
          );
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
