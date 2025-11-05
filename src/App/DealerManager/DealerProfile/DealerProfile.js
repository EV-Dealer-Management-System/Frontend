import api from "../../../api/api";

export const getDealerProfile = async() => {
    try {
        const response = await api.get('/Dealer/dealer-information');
        return response.data;
    } catch (error) {
        console.error("Error fetching dealer profile:", error);
        throw error;
    }
};
