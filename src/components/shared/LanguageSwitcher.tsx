"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  alpha,
  Tooltip,
} from "@mui/material";
import { useState, useTransition, useCallback } from "react";
import LanguageIcon from "@mui/icons-material/Language";
import CheckIcon from "@mui/icons-material/Check";

const availableLocales = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "th", label: "ไทย", flag: "🇹🇭" },
];

const LanguageSwitcher: React.FC = () => {
  const [isPending, startTransition] = useTransition();
  const localActive = useLocale();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleLanguageChange = (selectedLocale: string) => {
    const newUrl = `/${selectedLocale}${pathname.slice(3)}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    startTransition(() => {
      router.push(newUrl);
      router.refresh();
    });
    handleClose();
  };

  const currentLocale = availableLocales.find((l) => l.code === localActive);

  return (
    <>
      <Tooltip title="เปลี่ยนภาษา">
        <IconButton
          onClick={handleOpen}
          size="small"
          disabled={isPending}
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: "10px",
            px: 1.5,
            py: 0.75,
            gap: 0.75,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
            },
            ...(Boolean(anchorEl) && {
              bgcolor: alpha(theme.palette.primary.main, 0.15),
            }),
          }}
        >
          <Box sx={{ fontSize: "1rem", lineHeight: 1 }}>{currentLocale?.flag}</Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: "0.75rem",
              textTransform: "uppercase",
            }}
          >
            {localActive}
          </Typography>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: "12px",
            mt: 1,
            minWidth: 160,
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.text.secondary, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            เลือกภาษา
          </Typography>
        </Box>
        {availableLocales.map((locale) => {
          const isActive = localActive === locale.code;
          return (
            <MenuItem
              key={locale.code}
              onClick={() => handleLanguageChange(locale.code)}
              selected={isActive}
              sx={{
                py: 1.5,
                px: 2,
                mx: 0.5,
                my: 0.25,
                borderRadius: "8px",
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, fontSize: "1.25rem" }}>
                {locale.flag}
              </ListItemIcon>
              <ListItemText
                primary={locale.label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                }}
              />
              {isActive && (
                <CheckIcon sx={{ fontSize: 18, color: theme.palette.primary.main, ml: 1 }} />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
