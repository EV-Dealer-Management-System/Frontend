import api from "../../../api/api";

export const GetAllCustomers = {
    // Lấy tất cả khách hàng với pagination và search
    getAllCustomers: async (pageNumber = 1, pageSize = 10000000, search = "") => {
        try {
            const params = {
                pageNumber,
                pageSize
            };

            // Thêm search parameter nếu được cung cấp
            if (search && search.trim() !== "") {
                params.search = search.trim();
            }

            const response = await api.get("/Customer/get-all-customers", { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching customers:", error);
            throw error;
        }
    },
};