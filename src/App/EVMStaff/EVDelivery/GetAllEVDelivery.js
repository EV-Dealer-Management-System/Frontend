import api from "../../../api/api";

export const getAllEVDelivery = async (pageNumber = 1, pageSize = 10, status = null) => {
    try {
        const params = {
            pageNumber,
            pageSize
        };

        // Chỉ thêm status nếu có giá trị
        if (status !== null && status !== undefined) {
            params.status = status;
        }

        const response = await api.get("/VehicleDelivery/Get-all-deliveries", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching EV deliveries:", error);
        throw error;
    }
};
