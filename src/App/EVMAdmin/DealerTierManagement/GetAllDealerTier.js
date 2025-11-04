import api from "../../../api/api";
export const GetAllDealerTier = async () => {
    try {
        const response = await api.get("/Dealer/get-all-dealer-tiers");
        return response.data;
    } catch (error) {
        console.error("Error fetching dealer tiers:", error);
        throw error;
    }
};