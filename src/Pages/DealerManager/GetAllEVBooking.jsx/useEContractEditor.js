import { useState } from 'react';
import { message } from 'antd';
import { updateEContractTemplate } from '../../../App/DealerManager/EVBooking/GetAllEContract';

// Hook wrapper để xử lý lưu eContract từ TemplateEditor
export const useEContractEditor = () => {
  const [saving, setSaving] = useState(false);

  // Hàm lưu eContract template
  const saveEContractTemplate = async (eContract, htmlContent) => {
    if (!eContract || !eContract.id) {
      message.error('Không tìm thấy thông tin eContract');
      return { success: false };
    }

    if (!htmlContent || htmlContent.trim() === '') {
      message.error('Nội dung hợp đồng không được để trống');
      return { success: false };
    }

    setSaving(true);
    try {
      console.log('🔄 Saving eContract template...', {
        eContractId: eContract.id,
        contentLength: htmlContent.length
      });

      const response = await updateEContractTemplate(eContract.id, htmlContent);
      
      if (response && response.isSuccess) {
        message.success('Đã lưu thay đổi hợp đồng thành công!');
        return { success: true, data: response.result };
      } else {
        throw new Error(response?.message || 'Lỗi khi lưu hợp đồng');
      }
    } catch (error) {
      console.error('❌ Error saving eContract:', error);
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          'Có lỗi khi lưu hợp đồng. Vui lòng thử lại';
      message.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setSaving(false);
    }
  };

  return {
    saving,
    saveEContractTemplate
  };
};