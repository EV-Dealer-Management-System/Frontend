import api from "../../../api/api";

export const getAllEVInventory = async (params = {}) => {
    try {
        const { pageNumber = 1, pageSize = 10000000, warehouseId } = params;

        // Tạo query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('pageNumber', pageNumber.toString());
        queryParams.append('pageSize', pageSize.toString());

        if (warehouseId) {
            queryParams.append('warehouseId', warehouseId);
        }

        const response = await api.get(`/ElectricVehicle/get-evc-inventory?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching EV inventory:", error);
        throw error;
    }
};