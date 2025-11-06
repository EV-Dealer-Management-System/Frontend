import api from "../../../api/api";

export const getAllEVInventory = async (params = {}) => {
    try {
        // Xây dựng URL với các tham số
        const queryParams = new URLSearchParams({
            pageNumber: params.pageNumber || 1,
            pageSize: params.pageSize || 1000,
            ...(params.warehouseId && { warehouseId: params.warehouseId })
        });

        const response = await api.get(`/ElectricVehicle/get-evc-inventory?${queryParams.toString()}`);
        return response.data;
    }
    catch (error) {
        console.error("Error fetching EV inventory:", error);
        throw error;
    }
};