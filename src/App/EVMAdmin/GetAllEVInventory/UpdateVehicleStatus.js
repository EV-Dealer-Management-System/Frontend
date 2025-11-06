import api from "../../../api/api";
export const updateVehicleStatus = async (vehicleId, status) => {
    try {
        const response = await api.put(`/ElectricVehicle/update-vehicle-status/${vehicleId}`, {
            status
        });
        console.log("Response from updateVehicleStatus:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating vehicle status:", error);
        throw error;
    }
};
