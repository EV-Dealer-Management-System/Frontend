import api from '../../../api/api';

export const updateEVDeliveryStatus = async (deliveryId, newStatus, accidentNote = "") => {
    try {
        const response = await api.put(
            `/VehicleDelivery/update-status/${deliveryId}?newStatus=${newStatus}`,
            accidentNote
        );
        return response.data;
    } catch (error) {
        console.error("Error updating EV delivery status:", error);
        throw error;
    }
};