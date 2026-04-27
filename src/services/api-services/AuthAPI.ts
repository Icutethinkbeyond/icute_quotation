import { ResetPassword } from "@/interfaces/User";
import APIServices from "../utils/apiServices";

export const AUTH_API_BASE_URL = "/api/auth";

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    companyName: string;
}

export const authService = {

    async register(data: RegisterData) {
        try {
            let response: any = await APIServices.post(`${AUTH_API_BASE_URL}/register`, data);
            return { success: true, message: response.message, data: response.data };
        } catch (error: any) {
            console.error("Register error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาดในการลงทะเบียน" };
        }
    },

    async forgotPassword(email: string) {
        try {
            let response: any = await APIServices.post(`${AUTH_API_BASE_URL}/forgot-password`, { email });
            return { success: true, message: response.message, data: response.data };
        } catch (error: any) {
            console.error("Forgot password error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async resetPassword(value: ResetPassword) {
        try {
            let response: any = await APIServices.post(`${AUTH_API_BASE_URL}/reset-password`, value);
            return { success: true, message: response.message, data: response.data };
        } catch (error: any) {
            console.error("Reset password error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

    async resendVerifyEmail(email: string) {
        try {
            let response: any = await APIServices.post(`${AUTH_API_BASE_URL}/resend-verify`, { email });
            return { success: true, message: response.message, data: response.data };
        } catch (error: any) {
            console.error("Resend verify error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาด" };
        }
    },

}