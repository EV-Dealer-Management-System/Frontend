import api from '../../../api/api';

export const updateEVDeliveryStatus = async (deliveryId, newStatus, statusNote = "") => {
    try {
        const response = await api.put(
            `/VehicleDelivery/update-status/${deliveryId}?newStatus=${newStatus}`,
            statusNote // Can be accident note, delay note, or any status description
        );
        return response.data;
    } catch (error) {
        console.error("Error updating EV delivery status:", error);
        throw error;
    }
};