import api from "../../../api/api";

export const getAllEVQuotes = async (pageNumber = 1, pageSize = 10, status = null) => {
    try {
        const params = {
            pageNumber,
            pageSize
        };

        // Thêm status filter nếu được cung cấp
        if (status !== null && status !== undefined && status !== "") {
            params.status = status;
        }

        const response = await api.get("/Quote/get-all-quote", { params });

        // Xử lý cấu trúc response mới
        if (response.data && response.data.result && response.data.result.data) {
            return response.data.result.data;
        }

        // Fallback cho cấu trúc cũ
        return response.data || [];
    } catch (error) {
        console.error("Error fetching EV quotes:", error);
        throw error;
    }
};
