import api from "../../../api/api";

// API duyệt hợp đồng điện tử - chuyển status từ Draft (1) sang Ready (2)
export const confirmEcontract = async (eContractId) => {
  try {
    if (!eContractId) {
      throw new Error('ID hợp đồng không được để trống');
    }

    const response = await api.post('/EContract/ready-customerorder-econtract', null, {
      params: {
        eContractId: eContractId
      }
    });
    
    console.log('Confirm econtract response:', response.data);
    
    if (response.data && response.data.isSuccess) {
      return {
        success: true,
        data: response.data.result || response.data,
        message: response.data.message || 'Duyệt hợp đồng thành công!'
      };
    } else {
      throw new Error(response.data?.message || 'Có lỗi khi duyệt hợp đồng');
    }
  } catch (error) {
    console.error('Error confirming econtract:', error);
    
    let errorMessage = 'Không thể duyệt hợp đồng điện tử';
    
    if (error.response?.status === 400) {
      errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại ID hợp đồng.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Không tìm thấy hợp đồng với ID này.';
    } else if (error.response?.status === 500) {
      errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};
