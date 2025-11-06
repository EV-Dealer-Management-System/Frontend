import api from "../../../api/api";
export const getDepositSettings = async () => {
    try {
        const response = await api.get(`/DepositSetting/get-deposit-setting`);
        return response.data;
    } catch (error) {
        console.error("Error fetching deposit settings:", error);
        throw error;
    }
};
export const createDepositSettings = async (depositPercentage) => {
    try {
        const response = await api.post(`/DepositSetting/create-update-deposit-setting-dealer?depositPercentage=${depositPercentage}`);
        return response.data;
    } catch (error) {
        console.error("Error creating deposit settings:", error);
        throw error;
    }
};