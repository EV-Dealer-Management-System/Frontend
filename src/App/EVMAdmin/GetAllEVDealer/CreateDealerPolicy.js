import api from "../../../api/api";
export const updateDealerPolicy = async (dealerId, policyData) => {
    try {
        const response = await api.post(`/Dealer/create-dealer-policy-override/${dealerId}`, policyData);
        console.log("Update Dealer Policy Response:", response);
        return response; // Trả về toàn bộ response để check status
    } catch (error) {
        console.error("Error updating dealer policy:", error);
        throw error;
    }
};