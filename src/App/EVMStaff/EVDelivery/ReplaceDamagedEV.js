import api from "../../../api/api";

export const replaceDamagedEV = async (deliveryId) => {
    try {
        const response = await api.post(`VehicleDelivery/replace-damaged-vehicle/${deliveryId}`);
        console.log("Response data:", response.data);
        return response.data;
    }
    catch (error) {
        console.error("Error replacing damaged vehicle:", error);
        throw error;
    }
}