"use client";

import React, { useState, useEffect, forwardRef } from "react";
import {
  ListItemIcon,
  ListItem,
  styled,
  ListItemText,
  useTheme,
  ListItemButton,
  Collapse,
  List,
  Box,
  Badge,
  Tooltip,
} from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

/**
 * Next.js Link adapter for MUI
 */
const LinkBehavior = forwardRef<HTMLAnchorElement, any>(
  function LinkBehavior(props, ref) {
    const { href, ...other } = props;
    return <NextLink ref={ref} href={href} {...other} />;
  },
);

type NavGroup = {
  id?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: NavGroup[];
  badge?: boolean;
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  collapsed?: boolean;
}

/**
 * Styled Components
 */

const ListItemStyled = styled(ListItem)(({ theme }) => ({
  padding: 0,

  ".MuiButtonBase-root": {
    whiteSpace: "nowrap",
    marginBottom: "4px",
    padding: "10px 16px",
    borderRadius: "12px",
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease-in-out",

    "&:hover": {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary,
    },

    "&.Mui-selected": {
      color: theme.palette.primary.main,
      backgroundColor: theme.palette.primary.light,
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },

      "& .MuiListItemIcon-root": {
        color: theme.palette.primary.main,
      },
    },
  },
}));

/**
 * Nav Item Component
 */

const NavItem = ({ item, onClick, collapsed }: ItemType) => {
  const theme = useTheme();
  const pathname = usePathname();

  const Icon = item.icon;

  const isExactlyMatched = item.href === pathname;
  const isChildActive =
    item.children && item.children.some((sub) => pathname === sub.href);

  const isActive = isExactlyMatched || isChildActive;

  const itemIcon = Icon ? (
    <Icon size="20" strokeWidth={isActive ? 2.5 : 1.5} />
  ) : null;

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isActive && item.children) {
      setOpen(true);
    }
  }, [isActive, item.children]);

  const handleToggle = (e: React.MouseEvent<HTMLElement>) => {
    if (item.children) {
      e.preventDefault();
      setOpen(!open);
    } else {
      onClick(e);
    }
  };

  const menuItemContent = (
    <ListItemStyled disablePadding>
      <ListItemButton
        component={item.children ? "div" : LinkBehavior}
        href={item.children ? undefined : item.href}
        selected={isActive}
        onClick={handleToggle}
        sx={{
          px: collapsed ? "10px" : "16px",
        }}
      >
        {itemIcon && (
          <ListItemIcon
            sx={{
              minWidth: 32,
              color: "inherit",
              transition: "all 0.2s",
            }}
          >
            {itemIcon}
          </ListItemIcon>
        )}

        {!collapsed && (
          <ListItemText
            primary={
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {item.title}
                {item.badge && (
                  <Badge
                    variant="dot"
                    color="error"
                    sx={{
                      ml: 1.5,
                      "& .MuiBadge-badge": {
                        boxShadow: "0 0 0 2px #172E4E",
                      },
                    }}
                  />
                )}
              </Box>
            }
            primaryTypographyProps={{
              variant: "body2",
              fontWeight: isActive ? 700 : 500,
              sx: { transition: "all 0.2s" },
            }}
          />
        )}

        {!collapsed && item.children && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              ml: "auto",
              color: theme.palette.text.secondary,
              opacity: 0.7,
            }}
          >
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </Box>
        )}
      </ListItemButton>
    </ListItemStyled>
  );

  const collapsedContent = collapsed ? (
    <Tooltip
      title={item.title || ""}
      placement="right"
      slotProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 10],
              },
            },
          ],
        },
      }}
    >
      {menuItemContent}
    </Tooltip>
  ) : (
    menuItemContent
  );

  return (
    <Box key={item.id} sx={{ mb: 0.5 }}>
      {collapsedContent}

      {!collapsed && item.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ mt: 0.5, mb: 1 }}>
            {item.children.map((subItem) => {
              const isSubActive = pathname === subItem.href;

              return (
                <ListItem key={subItem.id} disablePadding>
                  <ListItemButton
                    component={LinkBehavior}
                    href={subItem.href ?? ""}
                    selected={isSubActive}
                    onClick={onClick}
                    sx={{
                      borderRadius: "10px",
                      marginBottom: "2px",
                      padding: "8px 16px 8px 48px",
                      color: theme.palette.text.secondary,

                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        color: theme.palette.text.primary,
                      },

                      "&.Mui-selected": {
                        backgroundColor: "transparent",
                        color: theme.palette.primary.main,
                        fontWeight: 700,

                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                      },
                    }}
                  >
                    <ListItemText
                      primary={subItem.title}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isSubActive ? 700 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      )}
    </Box>
  );
};

export default NavItem;
