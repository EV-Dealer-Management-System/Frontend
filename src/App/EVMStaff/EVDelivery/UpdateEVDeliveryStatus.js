import api from '../../../api';
export const updateEVDeliveryStatus = async (deliveryId, status) => {
    try {
        const response = await api.put(`/VehicleDelivery/update-status/${deliveryId}`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating EV delivery status:", error);
        throw error;
    }
};