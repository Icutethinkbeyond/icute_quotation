import APIServices from "../utils/apiServices";

export const SYSTEM_SETTING_API_BASE_URL = "/api/system-settings";

export const systemSettingService = {
    async getSystemSettings(group?: string) {
        try {
            const url = group ? `${SYSTEM_SETTING_API_BASE_URL}?group=${group}` : SYSTEM_SETTING_API_BASE_URL;
            let response: any = await APIServices.get(url);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error("Get system settings error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล" };
        }
    },

    async updateSystemSettings(group: string, settings: Record<string, string>) {
        try {
            let response: any = await APIServices.patch(SYSTEM_SETTING_API_BASE_URL, { group, settings });
            return { success: true, message: response.message };
        } catch (error: any) {
            console.error("Update system settings error:", error.response?.data);
            return { success: false, message: error.response?.data?.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล" };
        }
    },
}
