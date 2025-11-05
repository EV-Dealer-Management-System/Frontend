import api from "../../../api/api";

export const updateEVDeliveryStatus = async (deliveryId, newStatus) => {
    try {
        const response = await api.put(`/VehicleDelivery/update-status/${deliveryId}?newStatus=${newStatus}`);
        return response.data;
    }
    catch (error) {
        console.error("Error updating EV delivery status:", error);
        throw error;
    }
};
