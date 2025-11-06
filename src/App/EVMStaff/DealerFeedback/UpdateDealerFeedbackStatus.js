import api from "../../../api/api";
export const UpdateDealerFeedbackStatus = {
    updateStatusDealerFeedback: async (feedbackId, newStatus) => {
        try {
            const response = await api.put(`/DealerFeedback/update-dealer-feedback-status/${feedbackId}?newStatus=${newStatus}`);
            console.log("Update response:", response.data);
            return response.data;
        } catch (error) {
            console.error("Error updating dealer feedback status:", error);
            throw error;
        }
    }
}