"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  IconButton,
  Badge,
  Menu,
  Box,
  Typography,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Button,
  Avatar,
  useTheme,
  Tooltip,
  CircularProgress,
  Chip,
} from "@mui/material";
import { keyframes } from "@mui/material/styles";
import {
  Bell,
  CheckCheck,
  Calendar,
  RefreshCw,
  Clock,
  Sparkles,
  XCircle,
  Edit3,
  PartyPopper,
  CalendarCheck,
  CalendarClock,
  StoreIcon,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
// import { bookingService } from "@/services/ApiServices/BookingAPI";
// import { Booking } from "@/interfaces/Booking";
// import BookingDetailDialog from "@/components/forms/admin-booking/BookingDetailDialog";
import { useNotifyContext } from "@/contexts/NotifyContext";
import { NotificationData } from "@/services/api-services/NotificationAPI";

// Bell shake animation
const shake = keyframes`
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
  20%, 40%, 60%, 80% { transform: rotate(10deg); }
`;

// Pulse animation for badge
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

// Notification type icons
const getIcon = (type: string) => {
  const iconSize = 20;
  const iconColor = "#fff";

  switch (type) {
    case "STORE_NEW_BOOKING":
      return <Calendar size={iconSize} color={iconColor} strokeWidth={2.5} />;
    case "STORE_CANCELED_BY_CUSTOMER":
      return <XCircle size={iconSize} color={iconColor} strokeWidth={2.5} />;
    case "STORE_BOOKING_MODIFIED":
      return <Edit3 size={iconSize} color={iconColor} strokeWidth={2.5} />;
    case "CUSTOMER_BOOKING_SUCCESS":
      return (
        <PartyPopper size={iconSize} color={iconColor} strokeWidth={2.5} />
      );
    case "CUSTOMER_CONFIRMED":
      return (
        <CalendarCheck size={iconSize} color={iconColor} strokeWidth={2.5} />
      );
    case "CUSTOMER_RESCHEDULED":
      return (
        <CalendarClock size={iconSize} color={iconColor} strokeWidth={2.5} />
      );
    case "CUSTOMER_CANCELED":
      return <XCircle size={iconSize} color={iconColor} strokeWidth={2.5} />;
    case "STORE_NEW_REGISTRATION":
      return <StoreIcon size={iconSize} color={iconColor} strokeWidth={2.5} />;
    default:
      return <Sparkles size={iconSize} color={iconColor} strokeWidth={2.5} />;
  }
};

// Gradient backgrounds for notification types
const getIconGradient = (type: string) => {
  switch (type) {
    case "STORE_NEW_BOOKING":
      return `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
    case "STORE_CANCELED_BY_CUSTOMER":
      return `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)`;
    case "STORE_BOOKING_MODIFIED":
      return `linear-gradient(135deg, #f6d365 0%, #fda085 100%)`;
    case "CUSTOMER_BOOKING_SUCCESS":
      return `linear-gradient(135deg, #11998e 0%, #38ef7d 100%)`;
    case "CUSTOMER_CONFIRMED":
      return `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`;
    case "CUSTOMER_RESCHEDULED":
      return `linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)`;
    case "CUSTOMER_CANCELED":
      return `linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)`;
    case "STORE_NEW_REGISTRATION":
      return `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`;
    default:
      return `linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)`;
  }
};


const Notifications = () => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [markingRead, setMarkingRead] = useState(false);
  // const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingDetailOpen, setBookingDetailOpen] = useState(false);
  const shakeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch notifications when menu opens
  // const fetchNotifications = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     const result = await notificationService.getNotifications({ limit: 50 });
  //     if (result.success && result.data) {
  //       const newUnreadCount = result.metadata?.unreadCount || 0;
  //       const hasNewNotification =
  //         newUnreadCount > previousUnreadCount && previousUnreadCount > 0;

  //       const seen = new Map<string, NotificationData>();
  //       for (const n of result.data) {
  //         const key = n.bookingId || n.id;
  //         if (
  //           !seen.has(key) ||
  //           new Date(n.createdAt) > new Date(seen.get(key)!.createdAt)
  //         ) {
  //           seen.set(key, n);
  //         }
  //       }
  //       const deduped = Array.from(seen.values());

  //       setNotifications(deduped);
  //       setUnreadCount(newUnreadCount);

  //       if (hasNewNotification && !anchorEl) {
  //         setIsShaking(true);
  //         if (shakeTimeoutRef.current) {
  //           clearTimeout(shakeTimeoutRef.current);
  //         }
  //         shakeTimeoutRef.current = setTimeout(() => {
  //           setIsShaking(false);
  //         }, 600);
  //       }

  //       setPreviousUnreadCount(newUnreadCount);
  //     }
  //   } catch (error: any) {
  //     console.error("Error fetching notifications:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [previousUnreadCount, anchorEl]);

  // Initial fetch and poll for new notifications every 1 minute
  // useEffect(() => {
  //   fetchNotifications();

  //   const interval = setInterval(() => {
  //     fetchNotifications();
  //   }, 60000);

  //   return () => clearInterval(interval);
  // }, [fetchNotifications]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // const handleMarkAsRead = async (notificationId: string) => {
  //   try {
  //     const result = await notificationService.markAsRead([notificationId]);
  //     if (result.success) {
  //       setNotifications((prev) =>
  //         prev.map((n) =>
  //           n.id === notificationId ? { ...n, isRead: true } : n,
  //         ),
  //       );
  //       setUnreadCount((prev) => Math.max(0, prev - 1));
  //     }
  //   } catch (error) {
  //     console.error("Error marking notification as read:", error);
  //   }
  // };

  // const handleMarkAllAsRead = async () => {
  //   setMarkingRead(true);
  //   try {
  //     const result = await notificationService.markAllAsRead();
  //     if (result.success) {
  //       setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  //       setUnreadCount(0);
  //     }
  //   } catch (error) {
  //     console.error("Error marking all as read:", error);
  //   } finally {
  //     setMarkingRead(false);
  //   }
  // };

  // const handleNotificationClick = async (notification: NotificationData) => {
  //   console.log(notification);

  //   handleClose();

  //   // Only open booking detail if notification has a bookingId
  //   if (notification.bookingId) {
  //     setBookingDetailOpen(true);
  //     try {
  //       const result = await bookingService.getBooking(notification.bookingId);
  //       if (result.success && result.data) {
  //         setSelectedBooking(result.data);
  //         if (!notification.isRead) {
  //           handleMarkAsRead(notification.id);
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching booking:", error);
  //     } 
  //   }
  // };

  return (
    <Box>
      <Tooltip title="การแจ้งเตือน">
        <IconButton
          size="large"
          color="inherit"
          onClick={handleClick}
          sx={{
            padding: 1,
            borderRadius: "12px",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "action.hover",
            },
            ...(Boolean(anchorEl) && {
              bgcolor: "action.selected",
            }),
            animation: isShaking
              ? `${shake} 0.6s ease-in-out`
              : unreadCount > 0
                ? `${pulse} 2s ease-in-out infinite`
                : "none",
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            overlap="rectangular"
            max={99}
            sx={{
              "& .MuiBadge-badge": {
                boxShadow: "0 2px 8px rgba(211, 47, 47, 0.4)",
              },
            }}
          >
            <Bell size={22} strokeWidth={2} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        id="notifications-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{
          paper: {
            sx: {
              width: "380px",
              mt: 1.5,
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              borderRadius: "16px",
              border: `1px solid ${theme.palette.divider}`,
              maxHeight: "560px",
              display: "flex",
              flexDirection: "column",
              p: 0,
              "& .MuiList-root": {
                p: 0,
              },
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              การแจ้งเตือน
            </Typography>
            {unreadCount > 0 && (
              <Box
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  px: 1.2,
                  py: 0.3,
                  borderRadius: "12px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                {unreadCount} รายการ
              </Box>
            )}
          </Box>
          <Tooltip title="รีเฟรช">
            <IconButton
              size="small"
              // onClick={fetchNotifications}
              sx={{
                bgcolor: theme.palette.action.hover,
                "&:hover": { bgcolor: theme.palette.action.selected },
              }}
            >
              <RefreshCw size={16} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto", maxHeight: "420px" }}>
          {loading && notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                กำลังโหลด...
              </Typography>
            </Box>
          ) : notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: theme.palette.grey[100],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Bell size={28} color={theme.palette.grey[400]} />
              </Box>
              <Typography
                variant="body1"
                fontWeight={600}
                color="text.secondary"
              >
                ไม่มีการแจ้งเตือน
              </Typography>
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ mt: 0.5 }}
              >
                คุณจะได้รับการแจ้งเตือนเมื่อมีการจองใหม่หรือมีการเปลี่ยนแปลง
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItemButton
                    // onClick={() => handleNotificationClick(notification)}
                    sx={{
                      px: 2.5,
                      py: 2,
                      alignItems: "flex-start",
                      bgcolor: notification.isRead
                        ? "transparent"
                        : "rgba(3, 201, 215, 0.04)",
                      borderLeft: notification.isRead
                        ? "none"
                        : `3px solid ${theme.palette.primary.main}`,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        bgcolor: notification.isRead
                          ? theme.palette.action.hover
                          : "rgba(3, 201, 215, 0.08)",
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        mr: 2,
                        mt: 0.3,
                        width: 44,
                        height: 44,
                        background: getIconGradient(notification.type),
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      {getIcon(notification.type)}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={notification.isRead ? 500 : 700}
                            color="text.primary"
                          >
                            {notification.title || "การแจ้งเตือน"}
                          </Typography>
                          {!notification.isRead && (
                            // <Box
                            //   sx={{
                            //     width: 8,
                            //     height: 8,
                            //     bgcolor: "primary.main",
                            //     borderRadius: "50%",
                            //   }}
                            // />
                            <Chip label="ใหม่" color="primary" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: 1.4,
                            }}
                          >
                            {notification.message ||
                              (notification.booking
                                ? `${notification.booking.customerName} - ${notification.booking.service?.name || "บริการ"} (${notification.booking.bookingStartTime})`
                                : "ไม่มีรายละเอียด")}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Clock
                              size={12}
                              color={theme.palette.text.disabled}
                            />
                            <Typography variant="caption" color="text.disabled">
                              {notification.createdAt
                                ? formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    { addSuffix: true, locale: th },
                                  )
                                : "ไม่ระบุเวลา"}
                            </Typography>
                          </Box>
                        </Stack>
                      }
                    />
                  </ListItemButton>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <Box
            sx={{
              p: 1.5,
              borderTop: `1px solid ${theme.palette.divider}`,
              bgcolor: theme.palette.grey[50],
            }}
          >
            <Button
              fullWidth
              variant="text"
              color="primary"
              disabled={markingRead || unreadCount === 0}
              startIcon={
                markingRead ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <CheckCheck size={18} />
                )
              }
              // onClick={handleMarkAllAsRead}
              sx={{
                py: 1,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                "&:hover": {
                  bgcolor: theme.palette.primary.main + "10",
                },
              }}
            >
              {markingRead
                ? "กำลังอัปเดต..."
                : "ทำเครื่องหมายว่าอ่านแล้วทั้งหมด"}
            </Button>
          </Box>
        )}
      </Menu>

      {/* Booking Detail Dialog */}
      {/* <BookingDetailDialog
        open={bookingDetailOpen}
        booking={selectedBooking}
        loading={!selectedBooking && bookingDetailOpen}
        onClose={() => {
          setBookingDetailOpen(false);
          setSelectedBooking(null);
        }}
        onEdit={(booking) => {
          console.log("Edit booking:", booking);
          setBookingDetailOpen(false);
          setSelectedBooking(null);
        }}
      /> */}
    </Box>
  );
};

export default Notifications;
