import api from "../../../api/api";
export const GetAllEVTransaction = async (pageNumber, pageSize) => {
    try {
        const response = await api.post(`/Payment/get-all-transactions?pageNumber=${pageNumber}&pageSize=${pageSize}`);
        console.log("GetAllEVTransaction response:", response);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy tất cả giao dịch xe điện:", error);
        throw error;
    }
};