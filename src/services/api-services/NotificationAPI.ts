import APIServices from "../utils/apiServices";
import { NotificationType, SendMethod, NotificationTarget } from "@prisma/client";

export const NOTIFICATION_API_BASE_URL = "/api/store/notifications";

export interface NotificationData {
    id: string;
    title: string;
    message: string;
    targetAddress: string;
    metadata?: any;
    type: NotificationType;
    method: SendMethod;
    targetGroup: NotificationTarget;
    isSent: boolean;
    isRead: boolean;
    sentAt?: string | null;
    errorMessage?: string | null;
    storeId: string;
    bookingId?: string | null;
    booking?: {
        id: string;
        customerName: string;
        bookingDate: Date | string;
        bookingStartTime: string;
        bookingEndTime: string;
        status: string;
        service?: { name: string };
    };
    lineUserId?: string | null;
    createdAt: string;
    updatedAt: string;
}

export const notificationService = {

    async getNotifications(params?: { page?: number; limit?: number; unreadOnly?: boolean }) {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.set('page', params.page.toString());
            if (params?.limit) queryParams.set('limit', params.limit.toString());
            if (params?.unreadOnly) queryParams.set('unreadOnly', 'true');

            const url = `${NOTIFICATION_API_BASE_URL}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
            let data: any = await APIServices.get(url);
            // console.log(data)
            return { 
                success: true, 
                message: data.message, 
                data: data.data, 
                metadata: data.metadata 
            };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async markAsRead(notificationIds: string[]) {
        try {
            let data: any = await APIServices.patch(NOTIFICATION_API_BASE_URL, {
                notificationIds
            });
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async markAllAsRead() {
        try {
            let data: any = await APIServices.patch(NOTIFICATION_API_BASE_URL, {
                markAllAsRead: true
            });
            return { success: true, message: data.message };
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },
};
