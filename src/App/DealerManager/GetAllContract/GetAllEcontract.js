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

// API lấy thông tin hợp đồng VNPT theo ID
export const getVnptEcontractById = async (contractId) => {
  try {
    const response = await api.get(`/EContract/get-vnpt-econtract-by-id/${contractId}`);
    
    console.log('Get VNPT econtract by ID response:', response.data);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: 'Lấy thông tin hợp đồng thành công!'
      };
    } else {
      throw new Error(response.data?.messages?.[0] || 'Có lỗi khi lấy thông tin hợp đồng');
    }
  } catch (error) {
    console.error('Error getting VNPT econtract by ID:', error);
    
    const errorMessage = error.response?.data?.messages?.[0] || 
                        error.response?.data?.message || 
                        error.message || 
                        'Không thể lấy thông tin hợp đồng';
    
    return {
      success: false,
      error: errorMessage,
      data: null
    };
  }
};

// API lấy PDF preview từ downloadUrl
export const getEcontractPreview = async (downloadUrl) => {
  try {
    const response = await api.get('/EContract/preview', {
      params: {
        downloadURL: downloadUrl
      },
      responseType: 'blob' // Quan trọng: để nhận PDF blob
    });
    
    console.log('Get econtract preview response:', response);
    
    // Kiểm tra nếu response là blob và có content-type PDF
    if (response.data && response.data.type?.includes('pdf')) {
      return response.data; // Trả về blob để tạo URL
    } else {
      throw new Error('Response không phải là PDF hợp lệ');
    }
  } catch (error) {
    console.error('Error getting econtract preview:', error);
    
    // Xử lý lỗi đặc biệt cho 404
    if (error.response?.status === 404) {
      throw new Error('Hợp đồng không tồn tại hoặc đã hết hạn xem');
    }
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Không thể tải preview hợp đồng';
    
    throw new Error(errorMessage);
  }
};
