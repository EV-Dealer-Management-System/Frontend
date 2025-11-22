import api from "../../../api/api";

export const EVinspectAccident = async (deliveryId, electricVehicleIds) => {
    try {
        // Chuyển sang mảng nếu truyền vào một ID
        const idsArray = Array.isArray(electricVehicleIds) ? electricVehicleIds : [electricVehicleIds];
        const response = await api.post(`VehicleDelivery/inspect-accident/${deliveryId}`, idsArray);
        console.log("Response data:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error inspecting accident:", error);
        throw error;
    }
};
