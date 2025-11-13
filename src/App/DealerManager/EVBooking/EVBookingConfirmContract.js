import api from "../../../api/api";

// API xác nhận hợp đồng - POST: /EContract/confirm-booking-econtract?EContractId=xxx
export const confirmBookingEContract = async (eContractId) => {
    try {
        const response = await api.post(`/EContract/confirm-booking-econtract?EContractId=${eContractId}`);
        console.log("EContract confirmed successfully:", response);
        return response;
    } catch (error) {
        console.error("Error confirming EContract:", error);
        throw error;
    }
};