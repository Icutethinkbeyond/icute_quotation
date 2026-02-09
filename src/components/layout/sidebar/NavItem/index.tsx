// // components/NavItem.tsx

// import React, { useState, useEffect } from "react";
// // MUI imports
// import {
//   ListItemIcon,
//   ListItem,
//   styled,
//   ListItemText,
//   useTheme,
//   ListItemButton,
//   Collapse,
//   List,
// } from "@mui/material";
// import Link from "next/link";
// import { usePathname } from "next/navigation"; // Import usePathname from Next.js

// type NavGroup = {
//   [x: string]: any;
//   id?: string;
//   navlabel?: boolean;
//   subheader?: string;
//   title?: string;
//   icon?: any;
//   href?: any;
//   children?: NavGroup[]; // Add children property for submenus
// };

// interface ItemType {
//   item: NavGroup;
//   pathDirect: string;
//   onClick?: (event: React.MouseEvent<HTMLElement>) => void;
// }

// const NavItem = ({ item, pathDirect, onClick }: ItemType) => {
//   const Icon = item.icon;
//   const theme = useTheme();
//   const pathname = usePathname(); // Get the current path using usePathname from Next.js
//   const itemIcon = <Icon stroke={1.5} size="1.3rem" />;

//   const ListItemStyled = styled(ListItem)(() => ({
//     padding: 0,
//     ".MuiButtonBase-root": {
//       whiteSpace: "nowrap",
//       marginBottom: "8px",
//       padding: "8px 10px",
//       borderRadius: "8px",
//       backgroundColor: "inherit",
//       color: theme.palette.text.secondary,
//       "&:hover": {
//         backgroundColor: theme.palette.primary.light,
//         color: theme.palette.primary.main,
//       },
//       "&.Mui-selected": {
//         color: "white",
//         backgroundColor: theme.palette.primary.main,
//         "&:hover": {
//           backgroundColor: theme.palette.primary.main,
//           color: "white",
//         },
//       },
//     },
//   }));

//   const [open, setOpen] = useState(false); // State to handle submenu open/close

//   // Automatically open the submenu and mark parent active if a child route is active
//   const isActive = item.href === pathname || (item.children && item.children.some(subItem => pathname.includes(subItem.href)));

//   useEffect(() => {
//     if (isActive && item.children) {
//       setOpen(true);
//     }
//   }, [isActive, item.children]);

//   const handleClick = (event: any) => {
//     // Prevent the link navigation if the item has children
//     if (item.children) {
//       event.preventDefault();
//       setOpen((prev) => !prev); // Toggle the submenu
//     } else {
//       if (onClick) onClick(event); // Call onClick for navigation if no children and onClick is defined
//     }
//   };

//   return (
//     <>
//       <List component="div" disablePadding key={item.id}>
//         <ListItemStyled>
//           <ListItemButton
//             component={Link}
//             href={item.href}
//             selected={isActive} // Highlight parent menu if it's active or if a child is active
//             onClick={handleClick} // Use handleClick to toggle submenu
//           >
//             <ListItemIcon
//               sx={{
//                 minWidth: "36px",
//                 p: "3px 0",
//                 color: "inherit",
//               }}
//             >
//               {itemIcon}
//             </ListItemIcon>
//             <ListItemText>
//               <>{item.title}</>
//             </ListItemText>
//           </ListItemButton>
//         </ListItemStyled>
//         {item.children && (
//           <Collapse in={open} timeout="auto" unmountOnExit>
//             <List component="div" disablePadding>
//               {item.children.map((subItem) => (
//                 <ListItem key={subItem.id} sx={{ pl: 4 }}>
//                   <ListItemButton
//                     component={Link}
//                     href={subItem.href}
//                     selected={pathname === subItem.href} // Highlight active submenu item
//                   >
//                     <ListItemText primary={subItem.title} />
//                   </ListItemButton>
//                 </ListItem>
//               ))}
//             </List>
//           </Collapse>
//         )}
//       </List>
//     </>
//   );
// };

// export default NavItem;

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  ListItemIcon,
  ListItem,
  styled,
  ListItemText,
  useTheme,
  ListItemButton,
  Collapse,
  List,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KeyboardArrowDown, KeyboardArrowRight } from "@mui/icons-material";

type NavGroup = {
  id?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: NavGroup[];
};

interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
}

const NavItem = ({ item, onClick }: ItemType) => {
  const theme = useTheme();
  const pathname = usePathname();
  const Icon = item.icon;

  const itemIcon = Icon ? <Icon stroke={1.5} size="1.3rem" /> : null;

  const ListItemStyled = styled(ListItem)(() => ({
    padding: 0,
    ".MuiButtonBase-root": {
      whiteSpace: "nowrap",
      marginBottom: "8px",
      padding: "8px 10px",
      borderRadius: "8px",
      backgroundColor: "inherit",
      color: theme.palette.text.secondary,
      "&:hover": {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
      },
      "&.Mui-selected": {
        color: "white",
        backgroundColor: theme.palette.primary.main,
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          color: "white",
        },
      },
    },
  }));

  const [open, setOpen] = useState(false);

  // Active state (parent active if any child active)
  const isActive =
    item.href === pathname ||
    (item.children &&
      item.children.some((sub) => pathname.startsWith(sub.href ?? "")));

  useEffect(() => {
    if (isActive && item.children) {
      setOpen(true); // auto open submenu
    }
  }, [isActive, item.children]);

  return (
    <>
      <List component="div" disablePadding key={item.id}>
        <ListItemStyled>
          <ListItemButton
            component={item.children ? "div" : Link}
            href={item.children ? undefined : item.href}
            selected={isActive}
            onClick={() => {
              if (!item.children) {
                onClick;
              }
            }}
          >
            {/* Icon */}
            {itemIcon && (
              <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
                {itemIcon}
              </ListItemIcon>
            )}

            {/* Title */}
            <ListItemText
              primary={item.title}
              sx={{
                cursor: item.children ? "pointer" : "default",
                "& .MuiListItemText-primary": {
                  fontSize: "0.95rem",
                  fontWeight: isActive ? 600 : 400,
                },
              }}
              onClick={() => {
                if (item.children) setOpen((prev) => !prev);
              }}
            />

            {/* Arrow toggle button */}
            {item.children && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((prev) => !prev);
                }}
                sx={{ color: "inherit" }}
              >
                {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
              </IconButton>
            )}
          </ListItemButton>
        </ListItemStyled>

        {/* Submenu */}
        {item.children && (
          <Collapse in={open} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children.map((subItem) => (
                <ListItem key={subItem.id} sx={{ pl: 4 }}>
                  <ListItemButton
                    component={Link}
                    href={subItem.href ?? ""}
                    selected={pathname === subItem.href}
                  >
                    <ListItemText primary={subItem.title} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Collapse>
        )}
      </List>
    </>
  );
};

export default NavItem;
