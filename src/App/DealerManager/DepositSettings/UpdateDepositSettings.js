import api from "../../../api/api";
export const updateAllDepositSettings = async (minDepositPercentage, maxDepositPercentage) => {
    try {
        const response = await api.put(`/DealerConfiguration/update-all-deposit-settings`, {
            minDepositPercentage,
            maxDepositPercentage
        });
        return response.data;
    } catch (error) {
        console.error("Error updating all deposit settings:", error);
        throw error;
    }
};
