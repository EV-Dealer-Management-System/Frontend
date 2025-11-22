import api from "../../../api/api";
export const GetAvailableSlot = {
    getAvailableSlot: async () => {
        try {
            const response = await api.get("/DealerConfiguration/generate-time-slots");
            return response.data;
        } catch (error) {
            console.error("Error getting available slot:", error);
            throw error;
        }
    }
};