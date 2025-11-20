import api from "../../../api/api";
export const getDealerEffectivePolicy = async (dealerId) => {
    try {
        const response = await api.get(`/Dealer/get-effective-policy?dealerId=${dealerId}`);
        console.log("Dealer Effective Policy Response:", response);
        return response; // Trả về toàn bộ response để modal có thể access response.data
    } catch (error) {
        console.error("Error fetching dealer effective policy:", error);
        throw error;
    }
};