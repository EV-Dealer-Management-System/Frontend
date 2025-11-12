import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import PDFEditMain from '../../../Admin/SignContract/Components/PDF/PDFEdit/PDFEditMain';
import { PDFUpdateService } from '../../../../App/Home/PDFconfig/PDFUpdate';

// Component wrapper cho PDFEdit để xử lý eContract - theo cách CreateDealerAccount
const EContractPDFEditor = ({ 
  visible, 
  onClose, 
  eContract,
  onSaveSuccess 
}) => {
  const [saving, setSaving] = useState(false);
  const pdfUpdateService = PDFUpdateService();

  // Custom save handler cho eContract - sử dụng API /api/EContract/update-econtract
  const handleSave = async (updateInfo) => {
    try {
      setSaving(true);
      console.log('� EContract PDFEdit save handler called:', updateInfo);
      
      // updateInfo chứa: { htmlContent, downloadUrl, positionA, positionB, pageSign }
      // API đã được gọi trong PDFEditMain qua useTemplateActions
      // Chúng ta chỉ cần xử lý callback thành công
      
      message.success('Đã lưu thay đổi hợp đồng thành công!');
      
      // Gọi callback khi lưu thành công
      if (onSaveSuccess) {
        onSaveSuccess({
          success: true,
          data: updateInfo
        });
      }
      
      // Đóng modal sau khi lưu thành công
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('❌ EContract save handler error:', error);
      message.error('Có lỗi khi lưu hợp đồng. Vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  // Cancel handler
  const handleCancel = () => {
    onClose();
  };

  if (!eContract || !visible) {
    return null;
  }

  return (
    <PDFEditMain
      contractId={eContract.id}
      contractNo={eContract.name || `EContract_${eContract.id.slice(0, 8)}`}
      visible={visible}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
};

export default EContractPDFEditor;