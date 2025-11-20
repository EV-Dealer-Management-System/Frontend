import api from "../../../api/api";
export const getDealerBalanceAtQuarter = async (dealerId) => {
    try {
        const response = await api.get(`/DealerDebt/get-balance-at-quarter-now`, {
            params: { dealerId },
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching dealer balance:", error);
        throw error;
    }
};
