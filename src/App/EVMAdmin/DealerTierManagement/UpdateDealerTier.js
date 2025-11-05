import api from "../../../api/api";

export const UpdateDealerTier = async (dealerTierId, data) => {
    try {
        const response = await api.put(`/Dealer/update-dealer-tier/${dealerTierId}`, data);
        console.log("Update Dealer Tier Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating dealer tier:", error);
        throw error;
    }
};