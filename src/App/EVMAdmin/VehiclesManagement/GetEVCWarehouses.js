import api from "../../../api/api";
export const getEVCWarehouses = async () => {
    try {
        const response = await api.get("/Warehouse/get-evc-warehouses");  
        return response.data;
    } catch (error) {
        console.error("Error fetching EVC warehouses:", error);
        throw error;
    }
};