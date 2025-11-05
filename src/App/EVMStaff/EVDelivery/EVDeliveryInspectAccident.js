import api from "../../../api/api";

export const EVinspectAccident = async (deliveryId, electricVehicleId) => {
    try {
        const response = await api.post(`VehicleDelivery/inspect-accident/${deliveryId}`, [electricVehicleId]);
        console.log("Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error inspecting accident:", error);
        throw error;
    }
};
