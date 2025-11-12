import api from '../../../api/api';

// API để lấy danh sách tất cả eContract
export const getAllEContractList = async () => {
  try {
    const response = await api.get('/api/econtract/get-all-econtract-list');
    
    if (response.data && response.data.isSuccess) {
      return response.data;
    } else {
      throw new Error(response.data?.message || 'Lỗi khi lấy danh sách eContract');
    }
  } catch (error) {
    console.error('Error in getAllEContractList:', error);
    throw error;
  }
};

// API để lấy eContract theo bookingId
export const getEContractByBookingId = async (bookingId) => {
  try {
    const response = await getAllEContractList();
    
    if (response && response.isSuccess && Array.isArray(response.result)) {
      // Tìm eContract có liên kết với bookingId này
      // Giả sử có trường liên kết, có thể là customerOrderId hoặc tương tự
      const eContract = response.result.find(contract => 
        contract.customerOrderId === bookingId || 
        contract.ownerBy === bookingId ||
        // Có thể cần điều chỉnh logic tìm kiếm tùy theo cách liên kết
        contract.name && contract.name.includes(bookingId)
      );
      
      if (eContract) {
        return {
          isSuccess: true,
          result: eContract,
          message: 'Tìm thấy eContract'
        };
      } else {
        return {
          isSuccess: false,
          result: null,
          message: 'Không tìm thấy eContract cho booking này'
        };
      }
    }
    
    throw new Error(response?.message || 'Lỗi khi tìm eContract');
  } catch (error) {
    console.error('Error in getEContractByBookingId:', error);
    throw error;
  }
};

// API để cập nhật nội dung eContract - sử dụng endpoint mới như CreateDealerAccount
export const updateEContractTemplate = async (eContractId, htmlTemplate, subject = null) => {
  try {
    console.log('🔄 Updating eContract via /api/EContract/update-econtract');
    console.log('ID:', eContractId);
    console.log('Subject:', subject);
    console.log('HTML length:', htmlTemplate?.length || 0);
    
    const requestPayload = {
      id: eContractId,
      subject: subject || `EContract_${eContractId.slice(0, 8)}`,
      htmlFile: htmlTemplate
    };
    
    const response = await api.post('/EContract/update-econtract', requestPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ EContract update response:', response.data);
    
    if (response.data && response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } else {
      throw new Error(response.data?.message || 'Lỗi khi cập nhật eContract');
    }
  } catch (error) {
    console.error('❌ Error in updateEContractTemplate:', error);
    throw error;
  }
};