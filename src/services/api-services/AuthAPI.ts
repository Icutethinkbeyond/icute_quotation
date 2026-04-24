import { StoreRegister } from "@/interfaces/Store";
import { ResetPassword } from "@/interfaces/User";
import APIServices from "../utils/apiServices";

export const AUTH_API_BASE_URL = "/api/store/register";

export const authService = {

    async registerStore(store: StoreRegister) {
        try {
            let data: any = await APIServices.post(`${AUTH_API_BASE_URL}/shop`, store);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async checkStoreUsername(username: string) {
        try {
            let data: any = await APIServices.get(`/api/store/check-username?username=${username}`);
            return { success: true, available: data.available, message: data.message };
        } catch (error: any) {
            return { success: false, available: false, message: "ไม่สามารถตรวจสอบชื่อผู้ใช้งานได้" };
        }
    },

    async resendVerifyEmail() {
        try {
            let data: any = await APIServices.get(`/api/store/resend-verify`);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async sendForgotPassword(email: string) {
        try {
            let data: any = await APIServices.post(`/api/forgot-password`, email);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async resetPassword(value: ResetPassword) {
        try {
            let data: any = await APIServices.post(`/api/reset-password`, value);
            return { success: true, message: data.message, data: data.data };
        } catch (error: any) {
            console.log(error.response.data)
            if (error.name === "AbortError") {
                console.log("Request cancelled");
            }
            return { success: false, message: error.response.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

}