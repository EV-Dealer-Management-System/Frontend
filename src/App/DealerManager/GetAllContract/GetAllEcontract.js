import api from "../../../api/api";

// API lấy tất cả hợp đồng điện tử
export const getAllEcontractList = async (pageNumber = 1, pageSize = 1000, econtractType = 3) => {
  try {
    const response = await api.get('/EContract/get-all-econtract-list', {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        econtractType: econtractType
      }
    });
    
    console.log('Get all econtract list response:', response.data);
    
    if (response.data && response.data.isSuccess) {
      return {
        success: true,
        data: response.data.result || [],
        message: response.data.message || 'Lấy danh sách hợp đồng thành công!'
      };
    } else {
      throw new Error(response.data?.message || 'Có lỗi khi lấy danh sách hợp đồng');
    }
  } catch (error) {
    console.error('Error getting econtract list:', error);
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Không thể lấy danh sách hợp đồng điện tử';
    
    return {
      success: false,
      error: errorMessage,
      data: []
    };
  }
};
