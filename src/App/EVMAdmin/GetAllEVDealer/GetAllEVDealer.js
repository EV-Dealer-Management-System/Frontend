import api from "../../../api/api";

export const GetAllEVDealer = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        if (params.filterOn) queryParams.append('filterOn', params.filterOn);
        if (params.filterQuery) queryParams.append('filterQuery', params.filterQuery);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.isAscending !== undefined) queryParams.append('isAscending', params.isAscending);
        if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
        if (params.pageSize) queryParams.append('pageSize', params.pageSize);
        const url = `/Dealer/get-all-dealers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error("Error fetching EV dealers:", error);
        throw error;
    }
};

// Cập nhật trạng thái dealer: status = 0 (hoạt động), 1 (không hoạt động)
export const updateDealerStatus = async (dealerId, status) => {
    try {
        const url = `/Dealer/update-dealer-status/${dealerId}?status=${status}`;
        const response = await api.put(url);
        return response.data;
    } catch (error) {
        console.error("Error updating dealer status:", error);
        throw error;
    }
};
