import api from "../../../api/api";
export const getDealerDebtDetail = async (dealerId, fromDateUtc, toDateUtc, pageNumber = 1, pageSize = 100) => {
    try {
        const response = await api.get(`/DealerDebt/get-debt-details`, {
            params: {
                dealerId,
                fromDateUtc,
                toDateUtc,
                pageNumber,
                pageSize
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dealer debt details:", error);
        throw error;
    }
};