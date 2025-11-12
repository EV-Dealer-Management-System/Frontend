import React, { useState, useEffect } from 'react';
import { message } from 'antd';
import TemplateEditorModal from '../../../Admin/TemplateEditor/TemplateEditorModal';
import { useEContractEditor } from '../useEContractEditor';

// Component wrapper cho TemplateEditor để xử lý eContract
const EContractTemplateEditor = ({ 
  visible, 
  onClose, 
  eContract,
  onSaveSuccess 
}) => {
  const [template, setTemplate] = useState(null);
  const { saving, saveEContractTemplate } = useEContractEditor();

  // Chuyển đổi eContract thành template format cho TemplateEditor
  useEffect(() => {
    if (eContract && visible) {
      const templateForEditor = {
        id: eContract.id,
        name: eContract.name || `EContract_${eContract.id}`,
        code: `ECONTRACT_${eContract.id}`,
        contentHtml: eContract.htmlTemaple || eContract.htmlTemplate || eContract.contentHtml,
        type: eContract.type || 2,
        status: eContract.status || 4,
        createdAt: eContract.createdAt,
        createdBy: eContract.createdBy || 'System',
        ownerBy: eContract.ownerBy,
        ownerName: eContract.ownerName,
        // Metadata để track đây là eContract
        isEContract: true,
        originalEContract: eContract
      };

      setTemplate(templateForEditor);
      console.log('📋 EContract loaded for editing:', templateForEditor);
    } else {
      setTemplate(null);
    }
  }, [eContract, visible]);

  // Wrapper cho TemplateEditor với custom save logic
  const WrappedTemplateEditor = () => {
    if (!template) return null;

    // Override useTemplateEditor's saveTemplate function
    const originalUseTemplateEditor = require('../../../Admin/TemplateEditor/useTemplateEditor').useTemplateEditor;
    
    return (
      <TemplateEditorModal
        visible={visible}
        onClose={onClose}
        template={template}
        // Custom save handler cho eContract
        customSaveHandler={async (htmlContent) => {
          try {
            console.log('💾 Custom save handler for eContract called');
            const result = await saveEContractTemplate(eContract, htmlContent);
            
            if (result.success) {
              // Gọi callback khi lưu thành công
              if (onSaveSuccess) {
                onSaveSuccess(result.data);
              }
              
              // Đóng modal sau khi lưu thành công
              setTimeout(() => {
                onClose();
              }, 1000);
              
              return { success: true };
            } else {
              return { success: false, error: result.error };
            }
          } catch (error) {
            console.error('❌ Custom save handler error:', error);
            return { success: false, error: error.message };
          }
        }}
      />
    );
  };

  return <WrappedTemplateEditor />;
};

export default EContractTemplateEditor;