import api from '../../../api/api';

// API để lấy danh sách đơn hàng khách hàng
export const getAllCustomerOrders = async (params = {}) => {
  try {
    const response = await api.get('/CustomerOrder/get-all-customer-orders', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        phoneNumber: params.phoneNumber || undefined,
        orderNo: params.orderNo || undefined,
        status: params.status !== undefined ? params.status : undefined,
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    
    // Trả về lỗi với format chuẩn
    return {
      isSuccess: false,
      message: error.response?.data?.message || 'Không thể kết nối đến máy chủ',
      errors: error.response?.data?.errors || [error.message]
    };
  }
};